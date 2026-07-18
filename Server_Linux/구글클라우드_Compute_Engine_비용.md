# 구글클라우드_Compute_Engine_비용
> 2026년 7월 18일 기준으로 Compute Engine은 **사용한 만큼 초·시간 단위로 청구**됩니다.
> 수업용 Ubuntu 서버에서는 주로 다음 네 가지 비용이 발생합니다.

```text
월 요금
= VM CPU·메모리
+ 영구 디스크
+ 외부 IPv4
+ 인터넷 송신 트래픽
```

## 1. 서울 리전 VM 요금

서울 리전 `asia-northeast3`의 E2 계열 온디맨드 가격은 다음과 같습니다. 월 요금은 730시간 동안 계속 실행했을 때의 단순 계산입니다. ([Google Cloud][1])

| 머신 유형           |  메모리 |          시간당 |     24시간×한 달 |
| --------------- | ---: | -----------: | -----------: |
| `e2-small`      | 2GiB | $0.016752855 | 약 **$12.23** |
| `e2-medium`     | 4GiB |  $0.03350571 | 약 **$24.46** |
| `e2-standard-2` | 8GiB |  $0.06701142 | 약 **$48.92** |

수업용 권장 기준은 다음과 같습니다.

| 수업 환경                | 권장 유형              |
| -------------------- | ------------------ |
| 강사 혼자 실습             | `e2-small`         |
| 학생 5~10명 기본 명령어      | `e2-medium`        |
| 학생 10~20명 동시 접속      | `e2-standard-2`    |
| Python·컴파일·Docker 병행 | `e2-standard-2` 이상 |

학생들이 `ls`, `grep`, `find`, `chmod`, 셸 스크립트 정도만 실행한다면 CPU 사용량은 크지 않습니다. 동시에 `apt install`, Python 패키지 설치, 압축 작업을 하면 사양을 높이는 편이 안정적입니다.

## 2. 외부 IP 요금

VM에 외부 IPv4를 연결하면 시간당 **$0.005**가 추가됩니다.

```text
$0.005 × 730시간 = 약 $3.65/월
```

정적 IP와 임시 외부 IP 모두 실행 중인 일반 VM에 연결되어 있으면 과금됩니다. 임시 외부 IP는 VM을 중지하면 반환되지만, 정적 IP는 VM이 중지되어도 연결 상태에 따라 계속 과금될 수 있습니다. ([Google Cloud][2])

외부 IP 비용을 줄이려면 다음 구성이 가능합니다.

```text
외부 IP 없음
    ↓
Google Cloud IAP 터널
    ↓
Ubuntu VM 내부 IP로 SSH 접속
```

다만 학생들에게는 외부 IP를 사용한 SSH 접속이 더 간단합니다.

## 3. 디스크 요금

VM을 만들면 부팅용 영구 디스크가 반드시 필요합니다. 디스크는 VM이 중지되어도 삭제하지 않는 한 계속 과금됩니다. 실제 사용한 파일 용량이 아니라 **설정한 전체 디스크 크기**를 기준으로 청구됩니다. ([Google Cloud][3])

표준 영구 디스크의 기본 가격을 적용하면 대략 다음 정도입니다.

| 디스크             | 예상 월 요금 |
| --------------- | ------: |
| 표준 디스크 10GiB    | 약 $0.40 |
| 표준 디스크 20GiB    | 약 $0.80 |
| 표준 디스크 30GiB    | 약 $1.20 |
| 균형 영구 디스크 30GiB | 약 $3.00 |

Google Cloud Console에서 VM을 만들면 기본 디스크가 `pd-balanced`로 선택될 수 있습니다. 비용을 줄이려면 다음처럼 변경하는 것이 좋습니다. ([Google Cloud Documentation][4])

```text
부팅 디스크
→ 변경
→ 디스크 유형
→ 표준 영구 디스크(pd-standard)
→ 크기 20~30GB
```

## 4. 네트워크 트래픽 요금

외부에서 VM으로 들어오는 데이터는 일반적으로 무료이고, VM에서 인터넷으로 나가는 데이터에 요금이 부과됩니다. 한국 목적지로 나가는 Premium Tier 트래픽은 공식 가격표상 첫 1TiB 구간에서 GiB당 **$0.19**로 표시됩니다. ([Google Cloud][2])

하지만 Linux SSH 실습은 텍스트만 주고받으므로 트래픽 요금은 매우 적습니다.

```text
SSH 명령어 실습
→ 수 MB~수십 MB 수준
→ 네트워크 비용은 사실상 미미
```

다음 작업을 하면 트래픽 비용이 커질 수 있습니다.

* 학생이 대용량 파일 다운로드
* 서버에서 데이터셋 배포
* Docker 이미지 다운로드 후 외부 전송
* 동영상이나 음성 파일 제공
* 서버 백업 파일을 학생 PC로 다운로드

## 5. 실제 4시간 수업 예상 비용

### `e2-medium` 한 대를 4시간 사용

```text
VM:       $0.03350571 × 4시간 = 약 $0.134
외부 IP:  $0.005 × 4시간      = 약 $0.020
디스크:   약 $0.007
네트워크: SSH만 사용하면 미미
────────────────────────────────────
합계: 약 $0.16 전후
```

즉, 서버를 수업 직전에 켜고 수업 후 중지하면 **4시간 수업 한 번에 약 $0.16 수준**입니다.

### `e2-standard-2`를 4시간 사용

```text
VM:       $0.06701142 × 4시간 = 약 $0.268
외부 IP:  $0.005 × 4시간      = 약 $0.020
────────────────────────────────────
합계: 약 $0.29 + 디스크·트래픽
```

학생 10~20명이 동시 접속하는 수업도 한 차시의 컴퓨팅 비용 자체는 크지 않습니다.

## 6. 월 10회 수업 예시

4시간 수업을 월 10회, 총 40시간 진행한다고 가정하겠습니다.

### `e2-medium` 사용

| 항목                  |       예상 비용 |
| ------------------- | ----------: |
| VM 40시간             |     약 $1.34 |
| 외부 IPv4 40시간        |     약 $0.20 |
| 표준 디스크 30GiB 한 달 유지 |     약 $1.20 |
| SSH 네트워크            |      대체로 미미 |
| **월 합계**            | **약 $2.74** |

수업이 끝날 때 VM을 **삭제하지 않고 중지만 하면**, VM CPU 요금은 멈추지만 디스크 요금은 계속 발생합니다.

## 7. 24시간 서버를 계속 운영할 경우

### `e2-medium` + 외부 IP + 표준 디스크 30GiB

```text
VM                약 $24.46
외부 IPv4         약  $3.65
표준 디스크       약  $1.20
네트워크          사용량에 따라 추가
────────────────────────────
예상 월 비용      약 $29.31 + 네트워크
```

### `e2-standard-2` 구성

```text
VM                약 $48.92
외부 IPv4         약  $3.65
표준 디스크       약  $1.20
────────────────────────────
예상 월 비용      약 $53.77 + 네트워크
```

실제 원화 결제액은 Google Cloud의 원화 SKU 가격, 카드사 환율 및 세금 처리에 따라 달라질 수 있습니다.

## 8. 무료 등급

Compute Engine 무료 등급은 다음 조건을 충족해야 합니다.

* `e2-micro` 1대에 해당하는 월간 실행 시간
* 미국의 `us-west1`, `us-central1`, `us-east1` 중 하나
* 표준 영구 디스크 30GB-월
* 북미 지역에서 발생하는 일정 범위의 송신 트래픽

**서울 리전은 무료 VM 대상 지역이 아닙니다.** ([Google Cloud Documentation][5])

```text
무료 우선
→ us-central1 + e2-micro + pd-standard

국내 접속 속도 우선
→ asia-northeast3(서울) + e2-medium
```

신규 Google Cloud 사용자는 현재 **90일간 사용할 수 있는 $300 무료 크레딧**을 받을 수 있습니다. 무료 체험 상태에서는 자동으로 유료 청구되지 않으며, 유료 계정으로 직접 전환한 경우에만 크레딧 초과분이 결제됩니다. ([Google Cloud][6])

## 9. 수업용 최종 권장 설정

```text
리전: asia-northeast3 서울
머신: e2-medium
운영체제: Ubuntu 24.04 LTS
디스크: pd-standard 30GB
외부 IP: 임시 IP
운영 방식: 수업 직전 시작 → 수업 종료 후 중지
```

이 구성은 학생 5~10명의 기본 Linux 명령어 실습이라면 **월 10회 수업 기준 약 $3 안팎**으로 운영할 수 있습니다. 수업이 완전히 끝났다면 VM만 삭제하지 말고 **부팅 디스크와 정적 IP가 남아 있는지도 함께 확인**해야 추가 비용을 막을 수 있습니다.

가격 변경 알림이 필요하면 월 1회 Compute Engine 서울 리전 요금을 확인하도록 설정할 수 있습니다.

[1]: https://cloud.google.com/products/compute/pricing/general-purpose?hl=ko&utm_source=chatgpt.com "범용 VM 가격 책정 | Google Cloud"
[2]: https://cloud.google.com/vpc/network-pricing "Network pricing | Google Cloud"
[3]: https://cloud.google.com/compute/disks-image-pricing "Disk and image pricing | Google Cloud"
[4]: https://docs.cloud.google.com/compute/docs/disks/performance?utm_source=chatgpt.com "Persistent Disk performance overview  |  Compute Engine  |  Google Cloud Documentation"
[5]: https://docs.cloud.google.com/free/docs/free-cloud-features "Free Google Cloud features and trial offer  |  Google Cloud Free Program  |  Google Cloud Documentation"
[6]: https://cloud.google.com/signup-faqs?utm_source=chatgpt.com "Google Cloud Free Trial FAQs | Google Cloud"
