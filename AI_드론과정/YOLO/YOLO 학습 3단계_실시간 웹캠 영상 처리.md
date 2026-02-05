# YOLO 학습 3단계: 실시간 웹캠 영상 처리

## 1. 웹캠 기본 처리

### 실습 1: 기본 웹캠 영상 읽기
```python
import cv2
import time

def test_webcam_basic():
    """
    웹캠 기본 동작 테스트
    """
    print("웹캠 열기 시도...")
    
    # 웹캠 열기 (0: 기본 카메라, 1: 외장 카메라)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("✗ 웹캠을 열 수 없습니다!")
        print("  - 웹캠이 연결되어 있는지 확인하세요")
        print("  - 다른 프로그램에서 웹캠을 사용 중인지 확인하세요")
        return
    
    print("✓ 웹캠 열기 성공!")
    
    # 웹캠 정보 출력
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    print(f"  해상도: {width}x{height}")
    print(f"  FPS: {fps}")
    print("\n[ESC] 또는 [Q] 키를 누르면 종료됩니다\n")
    
    frame_count = 0
    start_time = time.time()
    
    while True:
        # 프레임 읽기
        ret, frame = cap.read()
        
        if not ret:
            print("프레임을 읽을 수 없습니다!")
            break
        
        frame_count += 1
        
        # FPS 계산
        elapsed_time = time.time() - start_time
        current_fps = frame_count / elapsed_time if elapsed_time > 0 else 0
        
        # 정보 표시
        cv2.putText(frame, f'FPS: {current_fps:.1f}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f'Frame: {frame_count}', (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, 'Press Q or ESC to quit', (10, 110),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # 화면에 표시
        cv2.imshow('Webcam Test', frame)
        
        # 키 입력 확인
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:  # q 또는 ESC
            break
    
    # 정리
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n종료: 총 {frame_count}프레임 처리")
    print(f"평균 FPS: {current_fps:.2f}")

# 실행
# test_webcam_basic()
```

### 실습 2: 웹캠 설정 조정
```python
import cv2

def adjust_webcam_settings():
    """
    웹캠 해상도, FPS 등 설정 조정
    """
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 원래 설정 확인
    original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    original_fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    print("=" * 60)
    print("웹캠 설정 조정")
    print("=" * 60)
    print(f"\n현재 설정:")
    print(f"  해상도: {original_width}x{original_height}")
    print(f"  FPS: {original_fps}")
    
    # 설정 변경 시도
    target_configs = [
        (640, 480, 30),   # VGA
        (1280, 720, 30),  # HD
        (1920, 1080, 30), # Full HD
    ]
    
    print("\n설정 테스트:")
    for width, height, fps in target_configs:
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        cap.set(cv2.CAP_PROP_FPS, fps)
        
        # 실제 적용된 값 확인
        actual_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        actual_fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        success = (actual_width == width and 
                  actual_height == height)
        
        status = "✓" if success else "✗"
        print(f"  {status} {width}x{height}@{fps}fps -> "
              f"실제: {actual_width}x{actual_height}@{actual_fps}fps")
    
    # 최적 설정 적용 (640x480)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("\n✓ 최적 설정 적용: 640x480")
    print("  (객체 검출에 적합한 해상도)")
    
    cap.release()
    print("=" * 60)

# 실행
# adjust_webcam_settings()
```

## 2. 실시간 객체 검출

### 실습 3: 웹캠 실시간 객체 검출 (기본)
```python
from ultralytics import YOLO
import cv2
import time

def realtime_detection_basic():
    """
    웹캠으로 실시간 객체 검출 (기본 버전)
    """
    print("실시간 객체 검출 시작...")
    
    # YOLO 모델 로드
    print("모델 로딩 중...")
    model = YOLO('yolov8n.pt')  # 가장 빠른 nano 모델 사용
    print("✓ 모델 로드 완료")
    
    # 웹캠 열기
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    print("✓ 웹캠 준비 완료")
    print("\n[Q] 또는 [ESC] 키로 종료\n")
    
    frame_count = 0
    start_time = time.time()
    
    while True:
        # 프레임 읽기
        ret, frame = cap.read()
        
        if not ret:
            print("프레임을 읽을 수 없습니다!")
            break
        
        frame_count += 1
        
        # YOLO 객체 검출
        results = model(frame, verbose=False)  # verbose=False로 콘솔 출력 최소화
        
        # 검출 결과 그리기
        annotated_frame = results[0].plot()
        
        # FPS 계산
        elapsed_time = time.time() - start_time
        fps = frame_count / elapsed_time if elapsed_time > 0 else 0
        
        # FPS 표시
        cv2.putText(annotated_frame, f'FPS: {fps:.1f}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 검출된 객체 수 표시
        num_objects = len(results[0].boxes)
        cv2.putText(annotated_frame, f'Objects: {num_objects}', (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 화면 표시
        cv2.imshow('Real-time Object Detection', annotated_frame)
        
        # 키 입력 확인
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            break
    
    # 정리
    cap.release()
    cv2.destroyAllWindows()
    
    # 통계 출력
    print(f"\n종료:")
    print(f"  총 프레임: {frame_count}")
    print(f"  평균 FPS: {fps:.2f}")
    print(f"  총 실행 시간: {elapsed_time:.2f}초")

# 실행
# realtime_detection_basic()
```

### 실습 4: 성능 향상된 실시간 검출
```python
from ultralytics import YOLO
import cv2
import time
from collections import deque

def realtime_detection_optimized():
    """
    최적화된 실시간 객체 검출
    - 프레임 스킵
    - FPS 스무딩
    - 검출 결과 캐싱
    """
    print("최적화된 실시간 객체 검출 시작...")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 설정
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 설정
    SKIP_FRAMES = 2  # 2프레임마다 한 번씩 검출
    CONFIDENCE_THRESHOLD = 0.5  # 높은 confidence만 표시
    
    # FPS 계산용
    fps_queue = deque(maxlen=30)  # 최근 30프레임의 FPS 평균
    
    frame_count = 0
    detection_count = 0
    last_results = None
    
    print("✓ 준비 완료")
    print(f"  프레임 스킵: {SKIP_FRAMES}")
    print(f"  Confidence 임계값: {CONFIDENCE_THRESHOLD}")
    print("\n[Q] 종료 | [S] 스크린샷\n")
    
    while True:
        frame_start_time = time.time()
        
        # 프레임 읽기
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # 프레임 스킵으로 성능 향상
        if frame_count % (SKIP_FRAMES + 1) == 0:
            # 객체 검출 수행
            results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
            last_results = results
            detection_count += 1
        
        # 이전 검출 결과 사용
        if last_results is not None:
            annotated_frame = last_results[0].plot()
            num_objects = len(last_results[0].boxes)
        else:
            annotated_frame = frame
            num_objects = 0
        
        # FPS 계산
        frame_time = time.time() - frame_start_time
        current_fps = 1.0 / frame_time if frame_time > 0 else 0
        fps_queue.append(current_fps)
        avg_fps = sum(fps_queue) / len(fps_queue)
        
        # 정보 패널
        info_panel_height = 120
        cv2.rectangle(annotated_frame, (0, 0), 
                     (350, info_panel_height), (0, 0, 0), -1)
        
        # 텍스트 정보
        cv2.putText(annotated_frame, f'FPS: {avg_fps:.1f}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f'Objects: {num_objects}', (10, 65),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f'Detections: {detection_count}', (10, 100),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        # 화면 표시
        cv2.imshow('Optimized Detection', annotated_frame)
        
        # 키 입력
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            break
        elif key == ord('s'):
            # 스크린샷 저장
            filename = f'screenshot_{int(time.time())}.jpg'
            cv2.imwrite(filename, annotated_frame)
            print(f"✓ 스크린샷 저장: {filename}")
    
    # 정리
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n통계:")
    print(f"  총 프레임: {frame_count}")
    print(f"  검출 수행: {detection_count}")
    print(f"  평균 FPS: {avg_fps:.2f}")

# 실행
# realtime_detection_optimized()
```

## 3. 비디오 파일 처리

### 실습 5: 비디오 파일 객체 검출
```python
from ultralytics import YOLO
import cv2
import time

def detect_video_file(video_path, output_path='output_video.mp4'):
    """
    비디오 파일에서 객체 검출 후 결과 저장
    
    Args:
        video_path: 입력 비디오 경로
        output_path: 출력 비디오 경로
    """
    print(f"비디오 파일 처리: {video_path}")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 비디오 열기
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"✗ 비디오를 열 수 없습니다: {video_path}")
        return
    
    # 비디오 정보
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"✓ 비디오 정보:")
    print(f"  해상도: {frame_width}x{frame_height}")
    print(f"  FPS: {fps}")
    print(f"  총 프레임: {total_frames}")
    print(f"  길이: {total_frames/fps:.2f}초")
    
    # 출력 비디오 설정
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, 
                         (frame_width, frame_height))
    
    print(f"\n처리 시작...")
    print("=" * 60)
    
    frame_count = 0
    start_time = time.time()
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            break
        
        frame_count += 1
        
        # 객체 검출
        results = model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        # 진행률 표시
        progress = (frame_count / total_frames) * 100
        cv2.putText(annotated_frame, f'Progress: {progress:.1f}%', 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 출력 비디오에 쓰기
        out.write(annotated_frame)
        
        # 화면에 표시 (선택적)
        cv2.imshow('Video Processing', annotated_frame)
        
        # 진행률 출력
        if frame_count % 30 == 0:
            elapsed = time.time() - start_time
            fps_processing = frame_count / elapsed
            eta = (total_frames - frame_count) / fps_processing
            print(f"프레임: {frame_count}/{total_frames} "
                  f"({progress:.1f}%) | "
                  f"처리 FPS: {fps_processing:.1f} | "
                  f"남은 시간: {eta:.1f}초")
        
        # ESC로 중단 가능
        if cv2.waitKey(1) & 0xFF == 27:
            print("\n중단됨!")
            break
    
    # 정리
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    
    total_time = time.time() - start_time
    
    print("=" * 60)
    print(f"\n✓ 처리 완료!")
    print(f"  처리 프레임: {frame_count}/{total_frames}")
    print(f"  소요 시간: {total_time:.2f}초")
    print(f"  평균 처리 FPS: {frame_count/total_time:.2f}")
    print(f"  출력 파일: {output_path}")

# 실행 예시
# detect_video_file('input_video.mp4', 'output_video.mp4')
```

### 실습 6: 비디오 파일 다운로드 및 테스트
```python
import cv2
import requests
from pathlib import Path

def download_test_video():
    """
    테스트용 샘플 비디오 다운로드
    """
    # 샘플 비디오 URL
    url = "https://www.pexels.com/download/video/3196036/"
    
    output_path = "test_video.mp4"
    
    if Path(output_path).exists():
        print(f"✓ 비디오 파일이 이미 존재: {output_path}")
        return output_path
    
    print("샘플 비디오 다운로드 중...")
    
    try:
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(output_path, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    progress = (downloaded / total_size) * 100
                    print(f"\r다운로드: {progress:.1f}%", end='')
        
        print(f"\n✓ 다운로드 완료: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"✗ 다운로드 실패: {e}")
        print("  수동으로 비디오 파일을 준비해주세요")
        return None

# 실행
# video_path = download_test_video()
# if video_path:
#     detect_video_file(video_path)
```

## 4. FPS 최적화 기법

### 실습 7: 멀티스레딩을 이용한 성능 향상
```python
from ultralytics import YOLO
import cv2
import time
from threading import Thread
from queue import Queue

class VideoStream:
    """
    별도 스레드에서 프레임을 읽어오는 클래스
    """
    def __init__(self, src=0):
        self.stream = cv2.VideoCapture(src)
        self.stopped = False
        self.queue = Queue(maxsize=128)
        
    def start(self):
        """스레드 시작"""
        Thread(target=self.update, daemon=True).start()
        return self
        
    def update(self):
        """프레임 지속적으로 읽기"""
        while not self.stopped:
            if not self.queue.full():
                ret, frame = self.stream.read()
                if not ret:
                    self.stop()
                    return
                self.queue.put(frame)
                
    def read(self):
        """큐에서 프레임 가져오기"""
        return self.queue.get()
        
    def stop(self):
        """스레드 중지"""
        self.stopped = True
        
    def release(self):
        """리소스 해제"""
        self.stream.release()

def realtime_detection_threaded():
    """
    멀티스레딩을 사용한 고성능 실시간 검출
    """
    print("멀티스레딩 실시간 검출 시작...")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 비디오 스트림 시작
    vs = VideoStream(src=0).start()
    time.sleep(2.0)  # 카메라 워밍업
    
    print("✓ 준비 완료\n")
    
    frame_count = 0
    start_time = time.time()
    
    while True:
        # 프레임 읽기 (논블로킹)
        frame = vs.read()
        
        frame_count += 1
        
        # 객체 검출
        results = model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        # FPS 계산
        elapsed = time.time() - start_time
        fps = frame_count / elapsed if elapsed > 0 else 0
        
        # 정보 표시
        cv2.putText(annotated_frame, f'Threaded FPS: {fps:.1f}', 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 화면 표시
        cv2.imshow('Threaded Detection', annotated_frame)
        
        # 종료 조건
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # 정리
    vs.stop()
    vs.release()
    cv2.destroyAllWindows()
    
    print(f"\n평균 FPS (멀티스레딩): {fps:.2f}")

# 실행
# realtime_detection_threaded()
```

### 실습 8: 해상도 다운스케일링
```python
from ultralytics import YOLO
import cv2
import time

def compare_resolutions():
    """
    다양한 해상도에서 FPS 비교
    """
    model = YOLO('yolov8n.pt')
    
    # 테스트할 해상도
    resolutions = [
        (320, 240, "QVGA"),
        (640, 480, "VGA"),
        (1280, 720, "HD"),
    ]
    
    results_data = []
    
    print("=" * 70)
    print("해상도별 FPS 비교")
    print("=" * 70)
    
    for width, height, name in resolutions:
        print(f"\n테스트: {name} ({width}x{height})")
        
        # 웹캠 설정
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        
        if not cap.isOpened():
            print("  웹캠을 열 수 없습니다!")
            continue
        
        # 실제 적용된 해상도
        actual_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"  실제 해상도: {actual_width}x{actual_height}")
        
        # 30프레임 테스트
        frame_count = 0
        start_time = time.time()
        
        print("  측정 중...", end='')
        
        while frame_count < 30:
            ret, frame = cap.read()
            if not ret:
                break
            
            # 검출 수행
            results = model(frame, verbose=False)
            frame_count += 1
        
        elapsed = time.time() - start_time
        fps = frame_count / elapsed if elapsed > 0 else 0
        
        print(f" 완료")
        print(f"  평균 FPS: {fps:.2f}")
        
        results_data.append({
            'name': name,
            'resolution': f"{actual_width}x{actual_height}",
            'fps': fps
        })
        
        cap.release()
        time.sleep(1)
    
    # 결과 요약
    print("\n" + "=" * 70)
    print("결과 요약")
    print("=" * 70)
    for data in results_data:
        print(f"{data['name']:10s} {data['resolution']:12s} : {data['fps']:6.2f} FPS")
    
    print("\n권장: 640x480 (VGA) - 속도와 정확도의 균형")
    print("=" * 70)

# 실행
# compare_resolutions()
```

### 실습 9: 프레임 스킵 최적화
```python
from ultralytics import YOLO
import cv2
import time

def test_frame_skip():
    """
    프레임 스킵 전략 비교
    """
    model = YOLO('yolov8n.pt')
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 테스트할 스킵 설정
    skip_configs = [0, 1, 2, 3]  # 0: 모든 프레임, 1: 1프레임 스킵, ...
    
    print("=" * 70)
    print("프레임 스킵 전략 비교")
    print("=" * 70)
    
    for skip_frames in skip_configs:
        print(f"\n프레임 스킵: {skip_frames} (매 {skip_frames+1}프레임마다 검출)")
        
        frame_count = 0
        detection_count = 0
        start_time = time.time()
        test_duration = 5  # 5초 테스트
        
        while time.time() - start_time < test_duration:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # 프레임 스킵 적용
            if frame_count % (skip_frames + 1) == 0:
                results = model(frame, verbose=False)
                detection_count += 1
        
        elapsed = time.time() - start_time
        read_fps = frame_count / elapsed
        detection_fps = detection_count / elapsed
        
        print(f"  프레임 읽기 FPS: {read_fps:.2f}")
        print(f"  검출 수행 FPS: {detection_fps:.2f}")
        print(f"  검출 비율: {(detection_count/frame_count)*100:.1f}%")
    
    cap.release()
    
    print("\n" + "=" * 70)
    print("권장: 스킵 1-2 (30-50% 성능 향상, 검출 품질 유지)")
    print("=" * 70)

# 실행
# test_frame_skip()
```

## 5. 영상 저장 기능

### 실습 10: 검출 결과 녹화
```python
from ultralytics import YOLO
import cv2
import time
from datetime import datetime

def record_detection(duration=10, output_prefix='recording'):
    """
    실시간 검출 결과를 비디오로 저장
    
    Args:
        duration: 녹화 시간 (초)
        output_prefix: 출력 파일명 접두사
    """
    print(f"{duration}초 동안 검출 결과 녹화")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 설정
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 비디오 정보
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = 20  # 출력 FPS
    
    # 출력 파일명 (타임스탬프 포함)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = f"{output_prefix}_{timestamp}.mp4"
    
    # 비디오 라이터 설정
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, 
                         (frame_width, frame_height))
    
    print(f"✓ 녹화 시작: {output_path}")
    print("  [Q] 키로 조기 종료 가능\n")
    
    start_time = time.time()
    frame_count = 0
    
    # 카운트다운
    for i in range(3, 0, -1):
        ret, frame = cap.read()
        if ret:
            cv2.putText(frame, str(i), (frame_width//2 - 50, frame_height//2),
                       cv2.FONT_HERSHEY_SIMPLEX, 5, (0, 0, 255), 10)
            cv2.imshow('Recording', frame)
            cv2.waitKey(1000)
    
    print("녹화 중...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 시간 체크
        elapsed = time.time() - start_time
        if elapsed >= duration:
            break
        
        # 객체 검출
        results = model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        # 녹화 정보 표시
        remaining = duration - elapsed
        cv2.circle(annotated_frame, (20, 20), 10, (0, 0, 255), -1)  # 빨간 점
        cv2.putText(annotated_frame, f'REC {remaining:.1f}s', (40, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # 프레임 수
        cv2.putText(annotated_frame, f'Frame: {frame_count}', (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # 비디오에 쓰기
        out.write(annotated_frame)
        
        # 화면 표시
        cv2.imshow('Recording', annotated_frame)
        
        frame_count += 1
        
        # 종료 조건
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\n녹화 중단!")
            break
    
    # 정리
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    
    total_time = time.time() - start_time
    
    print(f"\n✓ 녹화 완료!")
    print(f"  파일: {output_path}")
    print(f"  프레임: {frame_count}")
    print(f"  시간: {total_time:.2f}초")
    print(f"  평균 FPS: {frame_count/total_time:.2f}")

# 실행
# record_detection(duration=10)
```

### 실습 11: 이벤트 기반 자동 녹화
```python
from ultralytics import YOLO
import cv2
import time
from datetime import datetime

def auto_record_on_detection(target_class='person', min_confidence=0.7):
    """
    특정 객체 검출 시 자동으로 녹화 시작
    
    Args:
        target_class: 녹화를 트리거할 클래스
        min_confidence: 최소 신뢰도
    """
    print(f"자동 녹화 대기 중...")
    print(f"  트리거: {target_class} (신뢰도 ≥ {min_confidence})")
    print("  [Q] 종료\n")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 설정
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    is_recording = False
    out = None
    recording_start_time = None
    recording_duration = 5  # 검출 후 5초간 녹화
    
    frame_buffer = []  # 사전 버퍼 (검출 전 프레임 저장)
    buffer_size = 30   # 1초 정도의 프레임
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출 수행
        results = model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        # 타겟 객체 확인
        target_detected = False
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            confidence = float(box.conf[0])
            
            if cls_name == target_class and confidence >= min_confidence:
                target_detected = True
                break
        
        # 녹화 상태 관리
        if target_detected and not is_recording:
            # 녹화 시작
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"auto_recording_{timestamp}.mp4"
            
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, 20, 
                                 (frame_width, frame_height))
            
            # 버퍼의 프레임들을 먼저 쓰기
            for buffered_frame in frame_buffer:
                out.write(buffered_frame)
            
            is_recording = True
            recording_start_time = time.time()
            
            print(f"✓ 녹화 시작: {output_path}")
            print(f"  감지: {target_class} ({confidence:.2f})")
        
        if is_recording:
            # 녹화 중
            out.write(annotated_frame)
            
            elapsed = time.time() - recording_start_time
            
            # 녹화 표시
            cv2.circle(annotated_frame, (20, 20), 10, (0, 0, 255), -1)
            cv2.putText(annotated_frame, f'REC {elapsed:.1f}s', (40, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # 녹화 종료 조건
            if elapsed >= recording_duration:
                out.release()
                is_recording = False
                print(f"  녹화 완료 ({elapsed:.1f}초)\n")
        else:
            # 대기 중 - 프레임 버퍼에 저장
            frame_buffer.append(annotated_frame.copy())
            if len(frame_buffer) > buffer_size:
                frame_buffer.pop(0)
            
            cv2.putText(annotated_frame, 'Waiting...', (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        
        # 화면 표시
        cv2.imshow('Auto Recording', annotated_frame)
        
        # 종료
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # 정리
    if is_recording and out is not None:
        out.release()
    cap.release()
    cv2.destroyAllWindows()

# 실행
# auto_record_on_detection('person', 0.7)
```

## 6. 통계 및 모니터링

### 실습 12: 실시간 통계 대시보드
```python
from ultralytics import YOLO
import cv2
import numpy as np
import time
from collections import defaultdict, deque

def realtime_dashboard():
    """
    실시간 검출 통계 대시보드
    """
    print("실시간 통계 대시보드 시작...\n")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 설정
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 통계 변수
    object_counts = defaultdict(int)  # 클래스별 누적 카운트
    detection_history = deque(maxlen=100)  # 최근 100프레임의 검출 수
    fps_history = deque(maxlen=30)
    
    frame_count = 0
    start_time = time.time()
    
    print("[Q] 종료 | [R] 통계 초기화\n")
    
    while True:
        frame_start = time.time()
        
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # 검출 수행
        results = model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        # 현재 프레임의 검출 정보
        current_detections = len(results[0].boxes)
        detection_history.append(current_detections)
        
        # 클래스별 카운트
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            object_counts[cls_name] += 1
        
        # FPS 계산
        frame_time = time.time() - frame_start
        fps = 1.0 / frame_time if frame_time > 0 else 0
        fps_history.append(fps)
        avg_fps = sum(fps_history) / len(fps_history)
        
        # 통계 패널 생성
        stats_panel = create_stats_panel(
            annotated_frame.shape[1],
            frame_count,
            avg_fps,
            current_detections,
            detection_history,
            object_counts
        )
        
        # 메인 화면과 통계 패널 결합
        combined = np.vstack([annotated_frame, stats_panel])
        
        # 화면 표시
        cv2.imshow('Detection Dashboard', combined)
        
        # 키 입력
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            # 통계 초기화
            object_counts.clear()
            detection_history.clear()
            fps_history.clear()
            frame_count = 0
            start_time = time.time()
            print("통계 초기화 완료")
    
    # 정리
    cap.release()
    cv2.destroyAllWindows()
    
    # 최종 통계 출력
    print("\n" + "=" * 60)
    print("최종 통계")
    print("=" * 60)
    print(f"총 프레임: {frame_count}")
    print(f"평균 FPS: {avg_fps:.2f}")
    print(f"\n클래스별 검출 횟수:")
    for cls_name, count in sorted(object_counts.items(), 
                                  key=lambda x: x[1], reverse=True):
        print(f"  {cls_name}: {count}회")

def create_stats_panel(width, frame_count, fps, current_detections, 
                      detection_history, object_counts):
    """
    통계 패널 생성
    """
    panel_height = 200
    panel = np.zeros((panel_height, width, 3), dtype=np.uint8)
    panel[:] = (40, 40, 40)  # 어두운 배경
    
    # 기본 정보
    y_pos = 30
    cv2.putText(panel, f'Frame: {frame_count}', (10, y_pos),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    cv2.putText(panel, f'FPS: {fps:.1f}', (200, y_pos),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    cv2.putText(panel, f'Current Objects: {current_detections}', (350, y_pos),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    
    # 검출 히스토리 그래프
    if len(detection_history) > 1:
        y_pos = 70
        cv2.putText(panel, 'Detection History:', (10, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        graph_start_x = 10
        graph_y = 160
        graph_width = min(len(detection_history) * 3, width - 20)
        max_detections = max(detection_history) if detection_history else 1
        
        for i in range(len(detection_history) - 1):
            x1 = graph_start_x + i * 3
            x2 = graph_start_x + (i + 1) * 3
            y1 = graph_y - int((detection_history[i] / max(max_detections, 1)) * 60)
            y2 = graph_y - int((detection_history[i + 1] / max(max_detections, 1)) * 60)
            cv2.line(panel, (x1, y1), (x2, y2), (0, 255, 0), 2)
    
    # 상위 5개 클래스
    if object_counts:
        y_pos = 90
        cv2.putText(panel, 'Top Detected Classes:', (10, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        top_classes = sorted(object_counts.items(), 
                           key=lambda x: x[1], reverse=True)[:5]
        
        y_pos = 110
        for cls_name, count in top_classes:
            cv2.putText(panel, f'{cls_name}: {count}', (20, y_pos),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            y_pos += 15
    
    return panel

# 실행
# realtime_dashboard()
```

## 7. 종합 실습 프로젝트

### 실습 13: 완전한 비디오 처리 시스템
```python
from ultralytics import YOLO
import cv2
import time
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

class VideoDetectionSystem:
    """
    완전한 비디오 객체 검출 시스템
    - 웹캠 및 비디오 파일 지원
    - 실시간 검출 및 녹화
    - 통계 수집 및 로그
    - 다양한 최적화 옵션
    """
    
    def __init__(self, model_name='yolov8n.pt', output_dir='output'):
        """
        Args:
            model_name: YOLO 모델
            output_dir: 출력 디렉토리
        """
        print("비디오 검출 시스템 초기화...")
        
        # 모델 로드
        self.model = YOLO(model_name)
        self.model_name = model_name
        
        # 출력 디렉토리
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # 통계
        self.stats = {
            'total_frames': 0,
            'total_detections': 0,
            'class_counts': defaultdict(int),
            'start_time': None,
            'end_time': None
        }
        
        print("✓ 시스템 초기화 완료\n")
    
    def process_webcam(self, conf=0.25, skip_frames=2, 
                      record=False, duration=None):
        """
        웹캠 실시간 처리
        
        Args:
            conf: confidence threshold
            skip_frames: 프레임 스킵 수
            record: 녹화 여부
            duration: 실행 시간 (초, None이면 무제한)
        """
        print("웹캠 처리 시작")
        print(f"  Confidence: {conf}")
        print(f"  Frame Skip: {skip_frames}")
        print(f"  Recording: {record}")
        
        # 웹캠 열기
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        if not cap.isOpened():
            print("✗ 웹캠을 열 수 없습니다!")
            return
        
        # 녹화 설정
        out = None
        if record:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            video_path = self.output_dir / f"webcam_{timestamp}.mp4"
            
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(str(video_path), fourcc, 20, 
                                 (width, height))
            print(f"  녹화 파일: {video_path}")
        
        print("\n[Q] 종료 | [S] 스크린샷 | [P] 통계 출력\n")
        
        self.stats['start_time'] = time.time()
        frame_count = 0
        last_results = None
        
        while True:
            # 종료 조건 체크
            if duration and (time.time() - self.stats['start_time']) >= duration:
                print(f"\n{duration}초 경과 - 자동 종료")
                break
            
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            self.stats['total_frames'] += 1
            
            # 프레임 스킵
            if frame_count % (skip_frames + 1) == 0:
                results = self.model(frame, conf=conf, verbose=False)
                last_results = results
                
                # 통계 업데이트
                for box in results[0].boxes:
                    cls_name = self.model.names[int(box.cls[0])]
                    self.stats['class_counts'][cls_name] += 1
                    self.stats['total_detections'] += 1
            
            # 시각화
            if last_results:
                annotated = last_results[0].plot()
                num_objects = len(last_results[0].boxes)
            else:
                annotated = frame
                num_objects = 0
            
            # 정보 표시
            elapsed = time.time() - self.stats['start_time']
            fps = frame_count / elapsed if elapsed > 0 else 0
            
            self._draw_info(annotated, fps, num_objects, 
                          self.stats['total_detections'], record)
            
            # 녹화
            if out:
                out.write(annotated)
            
            # 화면 표시
            cv2.imshow('Video Detection System', annotated)
            
            # 키 입력
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # 스크린샷
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                screenshot_path = self.output_dir / f"screenshot_{timestamp}.jpg"
                cv2.imwrite(str(screenshot_path), annotated)
                print(f"✓ 스크린샷 저장: {screenshot_path}")
            elif key == ord('p'):
                # 통계 출력
                self._print_stats()
        
        # 정리
        self.stats['end_time'] = time.time()
        cap.release()
        if out:
            out.release()
        cv2.destroyAllWindows()
        
        # 최종 통계
        self._print_stats()
        self._save_stats()
    
    def process_video(self, video_path, conf=0.25, save_output=True):
        """
        비디오 파일 처리
        
        Args:
            video_path: 입력 비디오 경로
            conf: confidence threshold
            save_output: 출력 비디오 저장 여부
        """
        print(f"비디오 파일 처리: {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"✗ 비디오를 열 수 없습니다: {video_path}")
            return
        
        # 비디오 정보
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"  해상도: {width}x{height}")
        print(f"  FPS: {fps}")
        print(f"  총 프레임: {total_frames}")
        
        # 출력 비디오
        out = None
        if save_output:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = self.output_dir / f"processed_{timestamp}.mp4"
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(str(output_path), fourcc, fps, 
                                 (width, height))
            print(f"  출력: {output_path}")
        
        print("\n처리 중...\n")
        
        self.stats['start_time'] = time.time()
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            self.stats['total_frames'] += 1
            
            # 검출
            results = self.model(frame, conf=conf, verbose=False)
            annotated = results[0].plot()
            
            # 통계 업데이트
            for box in results[0].boxes:
                cls_name = self.model.names[int(box.cls[0])]
                self.stats['class_counts'][cls_name] += 1
                self.stats['total_detections'] += 1
            
            # 진행률
            progress = (frame_count / total_frames) * 100
            
            # 정보 표시
            cv2.putText(annotated, f'Progress: {progress:.1f}%', 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, 
                       (0, 255, 0), 2)
            
            # 저장
            if out:
                out.write(annotated)
            
            # 화면 표시
            cv2.imshow('Video Processing', annotated)
            
            # 진행률 출력
            if frame_count % 30 == 0:
                elapsed = time.time() - self.stats['start_time']
                processing_fps = frame_count / elapsed
                eta = (total_frames - frame_count) / processing_fps
                print(f"프레임: {frame_count}/{total_frames} "
                      f"({progress:.1f}%) | ETA: {eta:.1f}초")
            
            # ESC로 중단
            if cv2.waitKey(1) & 0xFF == 27:
                break
        
        # 정리
        self.stats['end_time'] = time.time()
        cap.release()
        if out:
            out.release()
        cv2.destroyAllWindows()
        
        # 통계
        self._print_stats()
        self._save_stats()
    
    def _draw_info(self, frame, fps, objects, total_detections, recording):
        """프레임에 정보 그리기"""
        # 배경 패널
        cv2.rectangle(frame, (0, 0), (400, 120), (0, 0, 0), -1)
        
        # 텍스트
        y = 30
        cv2.putText(frame, f'FPS: {fps:.1f}', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        y += 30
        cv2.putText(frame, f'Objects: {objects}', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        y += 30
        cv2.putText(frame, f'Total: {total_detections}', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # 녹화 중 표시
        if recording:
            cv2.circle(frame, (380, 20), 8, (0, 0, 255), -1)
            cv2.putText(frame, 'REC', (350, 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    
    def _print_stats(self):
        """통계 출력"""
        print("\n" + "=" * 60)
        print("검출 통계")
        print("=" * 60)
        
        print(f"총 프레임: {self.stats['total_frames']}")
        print(f"총 검출: {self.stats['total_detections']}")
        
        if self.stats['start_time'] and self.stats['end_time']:
            duration = self.stats['end_time'] - self.stats['start_time']
            print(f"처리 시간: {duration:.2f}초")
            print(f"평균 FPS: {self.stats['total_frames']/duration:.2f}")
        
        print("\n클래스별 검출:")
        for cls_name, count in sorted(self.stats['class_counts'].items(),
                                     key=lambda x: x[1], reverse=True):
            print(f"  {cls_name}: {count}회")
        
        print("=" * 60)
    
    def _save_stats(self):
        """통계 JSON으로 저장"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        stats_path = self.output_dir / f"stats_{timestamp}.json"
        
        stats_data = {
            'model': self.model_name,
            'total_frames': self.stats['total_frames'],
            'total_detections': self.stats['total_detections'],
            'class_counts': dict(self.stats['class_counts']),
            'start_time': self.stats['start_time'],
            'end_time': self.stats['end_time'],
            'duration': self.stats['end_time'] - self.stats['start_time'] 
                       if self.stats['end_time'] else None
        }
        
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(stats_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ 통계 저장: {stats_path}")


# 사용 예시
def main():
    """메인 실행 함수"""
    system = VideoDetectionSystem('yolov8n.pt', 'detection_output')
    
    print("비디오 검출 시스템")
    print("=" * 60)
    print("1. 웹캠 실시간 검출")
    print("2. 웹캠 검출 및 녹화 (10초)")
    print("3. 비디오 파일 처리")
    print("=" * 60)
    
    choice = input("선택 (1-3): ")
    
    if choice == '1':
        system.process_webcam(conf=0.5, skip_frames=2, record=False)
    elif choice == '2':
        system.process_webcam(conf=0.5, skip_frames=2, 
                             record=True, duration=10)
    elif choice == '3':
        video_path = input("비디오 파일 경로: ")
        system.process_video(video_path, conf=0.5)
    else:
        print("잘못된 선택입니다.")

# 실행
# if __name__ == '__main__':
#     main()
```

## 8. 학습 체크리스트

3단계를 완료하기 위한 체크리스트:

- [ ] 웹캠 기본 영상 읽기 및 표시 성공
- [ ] 웹캠 설정(해상도, FPS) 조정 가능
- [ ] 실시간 객체 검출 구현
- [ ] FPS 계산 및 표시 구현
- [ ] 프레임 스킵으로 성능 향상 이해
- [ ] 비디오 파일 읽기 및 처리 성공
- [ ] 검출 결과를 비디오로 저장 가능
- [ ] 멀티스레딩 적용 이해
- [ ] 해상도별 성능 차이 이해
- [ ] 이벤트 기반 자동 녹화 구현
- [ ] 실시간 통계 대시보드 구현
- [ ] 종합 비디오 처리 시스템 실행 성공

## 9. 성능 최적화 팁 요약

```python
# 최적화 체크리스트
OPTIMIZATION_TIPS = """
1. 모델 선택
   - yolov8n: 실시간 처리 (20-30 FPS)
   - yolov8s: 균형잡힌 성능 (15-20 FPS)
   
2. 해상도
   - 640x480: 권장 (속도와 정확도 균형)
   - 320x240: 매우 빠름 (작은 객체 놓칠 수 있음)
   
3. 프레임 스킵
   - 1-2 프레임 스킵 권장
   - 30-50% 성능 향상
   
4. Confidence Threshold
   - 0.5: 일반적 사용
   - 0.7: 높은 정확도 필요 시
   
5. 멀티스레딩
   - 프레임 읽기를 별도 스레드로
   - 10-20% 성능 향상

6. GPU 사용
   - CUDA 환경에서 3-5배 빠름
   - model = YOLO('yolov8n.pt').to('cuda')
"""

print(OPTIMIZATION_TIPS)
```

## 10. 다음 단계 준비

3단계를 완료했다면:

1. **다양한 환경에서 테스트**: 조명, 각도, 거리 변화
2. **성능 벤치마크**: 본인 시스템에서 최적 설정 찾기
3. **샘플 영상 수집**: 4단계를 위한 관제 대상 영상 준비
4. **추적 알고리즘 사전 학습**: DeepSORT 개념 공부
