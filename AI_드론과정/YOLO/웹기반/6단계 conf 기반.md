좋습니다. **WS(사용자)별 상태에 `conf_thres`를 추가**해서, 프론트 슬라이더로 실시간 변경 → 서버가 해당 사용자에게는 그 threshold로 필터링해서 전송하도록 확장하겠습니다.

중요한 설계 포인트:

* **추론 자체는 공통(conf 낮게)**으로 1번만 수행 (예: 서버 기본 `BASE_CONF=0.05`)
* 이후 **사용자별로 conf_thres로 결과를 후필터링**해서 전송
  → 사용자마다 다른 threshold를 적용 가능하면서도 **서버 추론은 1회**로 유지
* (주의) 너무 낮은 BASE_CONF는 박스가 많아져 CPU/네트워크가 증가하니 적당히 잡습니다(0.05~0.10 추천)

아래는 **서버 코드 변경(필수)** + **Svelte UI 슬라이더 추가(필수)** 입니다.

---

# 1) 서버(web_server_stream.py) 수정: WS별 conf_thres 상태 추가

## 1-1. 상단 설정 변경

기존 `CONF_THRES`는 “추론용 기본값”으로만 쓰고, 사용자별 threshold는 따로 둡니다.

```python
# 기존 CONF_THRES 대신 아래로 교체/추가
BASE_CONF_THRES = 0.08   # 추론 시 낮게(공통). 사용자별 필터는 별도 적용
IOU_THRES = 0.45

DEFAULT_USER_CONF = 0.25 # 사용자 기본 슬라이더 값
```

그리고 `model.predict` 호출 시 `BASE_CONF_THRES` 사용.

---

## 1-2. WS별 상태 dict 추가

기존 `_ws_filters`에 더해 `_ws_user_conf`를 추가합니다.

```python
# ws별 필터: None이면 전체 클래스, set이면 해당 class_id만
_ws_filters: Dict[WebSocket, Optional[Set[int]]] = {}

# ws별 confidence threshold (0.0 ~ 1.0)
_ws_user_conf: Dict[WebSocket, float] = {}
```

---

## 1-3. detect_stream에서 사용자 conf 설정 메시지 처리 추가

클라이언트가 아래 메시지를 보내면:

```json
{ "type": "set_conf", "conf": 0.35 }
```

해당 ws의 threshold가 바뀝니다.

### ✅ detect_stream 내부에 “set_conf” 처리 추가

(아래는 기존 `set_filter` 처리와 같은 receive loop 안에 추가)

```python
            if msg.get("type") == "set_conf":
                raw = msg.get("conf", None)
                try:
                    conf = float(raw)
                except Exception:
                    await ws.send_json({"type": "conf_ack", "ok": False, "detail": "conf must be number", "ts": time.time()})
                    continue

                # clamp
                conf = max(0.0, min(1.0, conf))
                async with _ws_lock:
                    _ws_user_conf[ws] = conf

                await ws.send_json({"type": "conf_ack", "ok": True, "conf": conf, "ts": time.time()})
                continue
```

또한 연결 직후 기본값 세팅:

```python
    async with _ws_lock:
        _ws_clients.add(ws)
        _ws_filters[ws] = None
        _ws_user_conf[ws] = DEFAULT_USER_CONF
```

연결 시 hello 메시지에 현재 conf도 포함:

```python
    await ws.send_json({
        "type": "hello",
        "ts": time.time(),
        "filter": None,
        "conf": DEFAULT_USER_CONF,
        "hint": "Send set_filter or set_conf..."
    })
```

disconnect 정리에도 `_ws_user_conf.pop(ws, None)` 추가.

---

## 1-4. inference_loop에서 “사용자별 conf로 후필터링”

### ✅ `model.predict` 호출 변경

```python
        results = await asyncio.to_thread(
            model.predict,
            bgr,
            BASE_CONF_THRES,
            IOU_THRES,
            False
        )
```

그리고 ws별 전송 직전에:

* 클래스 필터
* conf 필터(사용자별)

```python
            async with _ws_lock:
                flt = _ws_filters.get(ws, None)         # None이면 전체
                user_conf = _ws_user_conf.get(ws, DEFAULT_USER_CONF)

            dets = all_dets

            if flt is not None:
                dets = [d for d in dets if d["class_id"] in flt]

            dets = [d for d in dets if d["confidence"] >= user_conf]
```

payload에 user_conf 포함(프론트 디버그/표시용):

```python
            payload = {
                "type": "detections",
                "ts": time.time(),
                "image": {"width": int(bgr.shape[1]), "height": int(bgr.shape[0])},
                "filter": None if flt is None else sorted(list(flt)),
                "user_conf": float(user_conf),
                "detections": dets
            }
```

---

## 1-5. 전체적으로 수정된 서버 파일(핵심만 합쳐서)

아래는 **변경분이 반영된 핵심 블록들**입니다. (이미 가지고 계신 파일에 그대로 반영하면 됩니다)

* 설정부: `BASE_CONF_THRES`, `DEFAULT_USER_CONF`
* dict: `_ws_user_conf`
* detect_stream: set_conf 처리
* inference_loop: 후필터링

> 파일 전체를 다시 붙여넣기 원하시면 말씀만 하면 “완전한 단일 파일”로 드리겠습니다.

---

# 2) Svelte 프론트 수정: confidence slider 추가 + WS로 전송

## 변경점

* 슬라이더(0.05~0.90 같은 범위) 추가
* 변경 시 `set_conf` 메시지 전송
* 재연결 시 현재 값 재전송

### ✅ App.svelte에 추가/수정

#### 2-1) state 추가

```svelte
let conf = 0.25; // 사용자 기본값(서버 DEFAULT_USER_CONF와 맞추는 게 좋음)
```

#### 2-2) sendConf 함수 추가

```svelte
function sendConf() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: "set_conf", conf }));
}
```

#### 2-3) connectWS에서 onopen 시 sendConf도 호출

```svelte
ws.onopen = () => {
  status = "connected";
  sendFilter();
  sendConf();
};
```

#### 2-4) 슬라이더 UI 추가

필터 UI 위/아래 아무 곳에나 넣으면 됩니다.

```svelte
<div style="margin-top:12px;">
  <h3 style="margin:0 0 6px 0;">Confidence Threshold</h3>

  <div style="display:flex; align-items:center; gap:10px;">
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      bind:value={conf}
      on:input={sendConf}
      style="width: 100%;"
    />
    <div style="min-width:60px; text-align:right;">
      {(Number(conf)).toFixed(2)}
    </div>
  </div>

  <div style="font-size:12px; color:#555; margin-top:4px;">
    값이 높을수록 더 확실한 박스만 표시됩니다.
  </div>
</div>
```

#### 2-5) 서버 ack 메시지 처리(선택)

서버가 `conf_ack`를 보내면 마지막 메시지에 표시되니 굳이 필수는 아니지만,
원하면 ack로 `conf`를 확정 업데이트할 수 있습니다.

---

# 3) 동작 흐름

1. 브라우저에서 슬라이더 이동
2. 프론트가 WS로 `{type:"set_conf", conf: 0.37}` 전송
3. 서버는 해당 ws의 `_ws_user_conf[ws]=0.37` 저장
4. 다음 프레임부터 그 사용자에게는 `confidence >= 0.37`만 포함해서 push
   (다른 사용자는 각자 값이 다르게 적용)

---

# 4) 운영 팁(성능)

* `BASE_CONF_THRES`를 너무 낮추면 박스가 많아져 후필터링 비용 증가

  * 추천: **0.05 ~ 0.10**
* `INFER_FPS`는 GPU/CPU 상황에 맞게 2~10 사이 조절

---

원하시는 방식이 하나 더 있습니다:

* 지금 방식: **추론은 낮은 conf로 1회 → 사용자별 후필터링**
* 대안: **사용자별로 conf를 달리해서 추론 자체를 별도로 수행** (정확도/성능 trade-off, 보통 비추)

지금 요구사항(WS별 적용)에는 **현재 방식이 정답**입니다.

원하시면 제가 **“서버 파일 전체(완성본)”**으로 한 번에 붙여넣을 수 있게 정리해서 제공하겠습니다.
