# YOLO 학습 4단계: 특정 객체 필터링 및 추적

> 4단계에서는 관제 시스템에 필요한 특정 객체만 필터링하고, 시간에 따라 동일 객체를 추적하는 방법을 학습합니다.

## 1. 특정 객체 필터링 기초

### 실습 1: 단일 클래스 필터링
```python
from ultralytics import YOLO
import cv2

def filter_single_class(class_name='person'):
    """
    특정 클래스만 검출
    
    Args:
        class_name: 검출할 클래스 이름
    """
    print(f"'{class_name}' 클래스만 검출\n")
    
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 클래스 이름을 ID로 변환
    class_id = None
    for idx, name in model.names.items():
        if name == class_name:
            class_id = idx
            break
    
    if class_id is None:
        print(f"✗ '{class_name}' 클래스를 찾을 수 없습니다!")
        print("사용 가능한 클래스:")
        for idx, name in model.names.items():
            print(f"  {idx}: {name}")
        return
    
    print(f"✓ 클래스 ID: {class_id}")
    print("[Q] 종료\n")
    
    # 웹캠 열기
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    total_detected = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 특정 클래스만 검출
        results = model(frame, classes=[class_id], verbose=False)
        
        # 결과 시각화
        annotated_frame = results[0].plot()
        
        # 검출 수
        num_detected = len(results[0].boxes)
        total_detected += num_detected
        
        # 정보 표시
        cv2.putText(annotated_frame, f'{class_name}: {num_detected}', 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f'Total: {total_detected}', 
                   (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        cv2.imshow('Single Class Filter', annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n총 검출 횟수: {total_detected}")

# 실행
# filter_single_class('person')
```

### 실습 2: 다중 클래스 필터링
```python
from ultralytics import YOLO
import cv2

def filter_multiple_classes(target_classes=['person', 'car', 'bicycle']):
    """
    여러 클래스 필터링
    
    Args:
        target_classes: 검출할 클래스 리스트
    """
    print(f"검출 대상: {', '.join(target_classes)}\n")
    
    model = YOLO('yolov8n.pt')
    
    # 클래스 이름을 ID로 변환
    class_ids = []
    for target in target_classes:
        for idx, name in model.names.items():
            if name == target:
                class_ids.append(idx)
                print(f"✓ {target}: ID {idx}")
                break
    
    if not class_ids:
        print("유효한 클래스가 없습니다!")
        return
    
    print(f"\n[Q] 종료 | [C] 클래스 통계\n")
    
    # 웹캠 열기
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 클래스별 카운터
    from collections import defaultdict
    class_counts = defaultdict(int)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 지정된 클래스만 검출
        results = model(frame, classes=class_ids, verbose=False)
        
        # 결과 시각화
        annotated_frame = results[0].plot()
        
        # 현재 프레임의 클래스별 카운트
        current_counts = defaultdict(int)
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            current_counts[cls_name] += 1
            class_counts[cls_name] += 1
        
        # 정보 패널
        y_pos = 30
        for cls_name in target_classes:
            count = current_counts[cls_name]
            color = (0, 255, 0) if count > 0 else (128, 128, 128)
            cv2.putText(annotated_frame, f'{cls_name}: {count}', 
                       (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            y_pos += 35
        
        cv2.imshow('Multiple Class Filter', annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            # 통계 출력
            print("\n클래스별 누적 검출:")
            for cls_name in target_classes:
                print(f"  {cls_name}: {class_counts[cls_name]}")
    
    cap.release()
    cv2.destroyAllWindows()
    
    # 최종 통계
    print("\n최종 통계:")
    for cls_name in target_classes:
        print(f"  {cls_name}: {class_counts[cls_name]}")

# 실행
# filter_multiple_classes(['person', 'car', 'bicycle'])
```

### 실습 3: Confidence 기반 필터링
```python
from ultralytics import YOLO
import cv2

def filter_by_confidence(min_conf=0.5, max_conf=1.0):
    """
    신뢰도 범위로 필터링
    
    Args:
        min_conf: 최소 신뢰도
        max_conf: 최대 신뢰도
    """
    print(f"신뢰도 필터: {min_conf} ~ {max_conf}\n")
    
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    print("[Q] 종료 | [+/-] 신뢰도 조정\n")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출 수행
        results = model(frame, conf=min_conf, verbose=False)
        
        # 신뢰도 범위 필터링
        filtered_boxes = []
        for box in results[0].boxes:
            conf = float(box.conf[0])
            if min_conf <= conf <= max_conf:
                filtered_boxes.append(box)
        
        # 수동으로 박스 그리기
        annotated_frame = frame.copy()
        
        for box in filtered_boxes:
            # 박스 좌표
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            
            # 클래스 정보
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            
            # 신뢰도에 따른 색상 (낮음: 빨강, 높음: 초록)
            color_value = int((conf - min_conf) / (max_conf - min_conf) * 255)
            color = (0, color_value, 255 - color_value)
            
            # 박스 그리기
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            
            # 라벨
            label = f'{cls_name} {conf:.2f}'
            cv2.putText(annotated_frame, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # 정보 표시
        info_text = f'Conf Range: {min_conf:.2f} - {max_conf:.2f} | Objects: {len(filtered_boxes)}'
        cv2.putText(annotated_frame, info_text, (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow('Confidence Filter', annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('+') or key == ord('='):
            min_conf = min(0.95, min_conf + 0.05)
            print(f"최소 신뢰도: {min_conf:.2f}")
        elif key == ord('-'):
            min_conf = max(0.1, min_conf - 0.05)
            print(f"최소 신뢰도: {min_conf:.2f}")
    
    cap.release()
    cv2.destroyAllWindows()

# 실행
# filter_by_confidence(0.5, 1.0)
```

## 2. 영역 기반 필터링

### 실습 4: ROI (Region of Interest) 설정
```python
from ultralytics import YOLO
import cv2
import numpy as np

class ROISelector:
    """
    마우스로 관심 영역 설정
    """
    def __init__(self):
        self.roi_points = []
        self.drawing = False
        
    def mouse_callback(self, event, x, y, flags, param):
        """마우스 콜백"""
        if event == cv2.EVENT_LBUTTONDOWN:
            self.roi_points.append((x, y))
            self.drawing = True
            
        elif event == cv2.EVENT_RBUTTONDOWN:
            # 초기화
            self.roi_points = []
            self.drawing = False
    
    def get_roi(self, frame):
        """ROI 영역 표시"""
        if len(self.roi_points) > 1:
            # 다각형 그리기
            pts = np.array(self.roi_points, np.int32)
            pts = pts.reshape((-1, 1, 2))
            cv2.polylines(frame, [pts], True, (0, 255, 0), 2)
            cv2.fillPoly(frame.copy(), [pts], (0, 255, 0))
            
        # 현재 점 표시
        for point in self.roi_points:
            cv2.circle(frame, point, 5, (0, 0, 255), -1)
            
        return frame
    
    def is_inside_roi(self, x, y):
        """점이 ROI 내부에 있는지 확인"""
        if len(self.roi_points) < 3:
            return True  # ROI 미설정 시 모두 통과
        
        pts = np.array(self.roi_points, np.int32)
        result = cv2.pointPolygonTest(pts, (float(x), float(y)), False)
        return result >= 0

def detect_with_roi():
    """
    ROI 내부의 객체만 검출
    """
    print("ROI 기반 객체 검출")
    print("=" * 60)
    print("사용법:")
    print("  - 좌클릭: ROI 포인트 추가")
    print("  - 우클릭: ROI 초기화")
    print("  - [Q] 종료")
    print("=" * 60 + "\n")
    
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # ROI 선택기
    roi_selector = ROISelector()
    cv2.namedWindow('ROI Detection')
    cv2.setMouseCallback('ROI Detection', roi_selector.mouse_callback)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출 수행
        results = model(frame, verbose=False)
        
        # ROI 필터링
        inside_count = 0
        outside_count = 0
        
        for box in results[0].boxes:
            # 박스 중심점
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            
            # ROI 체크
            is_inside = roi_selector.is_inside_roi(center_x, center_y)
            
            if is_inside:
                inside_count += 1
                color = (0, 255, 0)  # 초록색 (내부)
            else:
                outside_count += 1
                color = (0, 0, 255)  # 빨간색 (외부)
            
            # 박스 그리기
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), 
                         color, 2)
            
            # 중심점 표시
            cv2.circle(frame, (center_x, center_y), 3, color, -1)
            
            # 라벨
            cls_name = model.names[int(box.cls[0])]
            conf = float(box.conf[0])
            label = f'{cls_name} {conf:.2f}'
            cv2.putText(frame, label, (int(x1), int(y1) - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # ROI 표시
        if len(roi_selector.roi_points) > 0:
            pts = np.array(roi_selector.roi_points, np.int32)
            pts = pts.reshape((-1, 1, 2))
            
            # 반투명 영역
            overlay = frame.copy()
            if len(roi_selector.roi_points) >= 3:
                cv2.fillPoly(overlay, [pts], (0, 255, 0))
                frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
            
            # 경계선
            cv2.polylines(frame, [pts], True, (0, 255, 0), 3)
            
            # 포인트
            for point in roi_selector.roi_points:
                cv2.circle(frame, point, 5, (0, 0, 255), -1)
        
        # 정보 표시
        cv2.putText(frame, f'Inside ROI: {inside_count}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f'Outside ROI: {outside_count}', (10, 65),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        cv2.imshow('ROI Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

# 실행
# detect_with_roi()
```

### 실습 5: 침입 탐지 (Line Crossing)
```python
from ultralytics import YOLO
import cv2
import numpy as np

def line_crossing_detection():
    """
    가상 라인을 넘는 객체 감지
    """
    print("라인 크로싱 탐지")
    print("=" * 60)
    print("사용법:")
    print("  - 화면 클릭으로 라인의 시작점과 끝점 설정")
    print("  - [R] 라인 초기화")
    print("  - [Q] 종료")
    print("=" * 60 + "\n")
    
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 라인 포인트
    line_points = []
    
    # 객체 추적 (간단한 중심점 기록)
    object_positions = {}  # {object_id: [(x, y), ...]}
    crossing_count = {'up': 0, 'down': 0}
    object_id_counter = 0
    
    def mouse_callback(event, x, y, flags, param):
        nonlocal line_points
        if event == cv2.EVENT_LBUTTONDOWN:
            if len(line_points) < 2:
                line_points.append((x, y))
                print(f"포인트 {len(line_points)} 설정: ({x}, {y})")
    
    cv2.namedWindow('Line Crossing')
    cv2.setMouseCallback('Line Crossing', mouse_callback)
    
    def get_line_side(point, line_start, line_end):
        """점이 라인의 어느 쪽에 있는지 확인"""
        x, y = point
        x1, y1 = line_start
        x2, y2 = line_end
        
        # 외적을 이용한 방향 판별
        cross_product = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)
        return 'up' if cross_product > 0 else 'down'
    
    prev_detections = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출 수행
        results = model(frame, classes=[0], verbose=False)  # person만
        
        current_detections = []
        
        for box in results[0].boxes:
            # 박스 중심점
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            
            current_detections.append((center_x, center_y))
            
            # 박스 그리기
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), 
                         (0, 255, 0), 2)
            cv2.circle(frame, (center_x, center_y), 5, (0, 0, 255), -1)
        
        # 라인 크로싱 체크 (간단한 버전)
        if len(line_points) == 2 and len(current_detections) > 0:
            for curr_pos in current_detections:
                # 이전 위치와 비교
                for prev_pos in prev_detections:
                    # 거리가 가까우면 같은 객체로 간주
                    dist = np.sqrt((curr_pos[0] - prev_pos[0])**2 + 
                                 (curr_pos[1] - prev_pos[1])**2)
                    
                    if dist < 50:  # 임계값
                        # 라인을 넘었는지 확인
                        curr_side = get_line_side(curr_pos, line_points[0], 
                                                  line_points[1])
                        prev_side = get_line_side(prev_pos, line_points[0], 
                                                  line_points[1])
                        
                        if curr_side != prev_side:
                            crossing_count[curr_side] += 1
                            print(f"라인 크로싱 감지! 방향: {curr_side}")
        
        prev_detections = current_detections.copy()
        
        # 라인 그리기
        if len(line_points) == 2:
            cv2.line(frame, line_points[0], line_points[1], (255, 0, 0), 3)
            
            # 방향 표시 화살표
            mid_x = (line_points[0][0] + line_points[1][0]) // 2
            mid_y = (line_points[0][1] + line_points[1][1]) // 2
            cv2.arrowedLine(frame, (mid_x, mid_y), 
                          (mid_x, mid_y - 30), (0, 255, 255), 2)
            cv2.putText(frame, 'UP', (mid_x + 10, mid_y - 15),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
        
        # 포인트 표시
        for i, point in enumerate(line_points):
            cv2.circle(frame, point, 8, (0, 0, 255), -1)
            cv2.putText(frame, str(i+1), (point[0] + 10, point[1]),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # 통계 표시
        cv2.putText(frame, f'Crossing UP: {crossing_count["up"]}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(frame, f'Crossing DOWN: {crossing_count["down"]}', (10, 65),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
        
        cv2.imshow('Line Crossing', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            line_points = []
            crossing_count = {'up': 0, 'down': 0}
            print("라인 초기화")
    
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n최종 통계:")
    print(f"  UP: {crossing_count['up']}")
    print(f"  DOWN: {crossing_count['down']}")

# 실행
# line_crossing_detection()
```

## 3. 객체 추적 기초

### 실습 6: 간단한 중심점 추적
```python
from ultralytics import YOLO
import cv2
import numpy as np
from collections import defaultdict

def simple_centroid_tracking():
    """
    중심점 기반 간단한 객체 추적
    """
    print("중심점 기반 객체 추적\n")
    
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 추적 데이터
    next_object_id = 0
    tracked_objects = {}  # {id: {'center': (x, y), 'class': name, 'trail': []}}
    max_disappeared = 30  # 사라진 것으로 간주할 프레임 수
    max_distance = 50  # 같은 객체로 간주할 최대 거리
    
    print("[Q] 종료\n")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출 수행
        results = model(frame, classes=[0], verbose=False)  # person만
        
        # 현재 프레임의 중심점들
        current_centroids = []
        current_classes = []
        
        for box in results[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            
            current_centroids.append((center_x, center_y))
            current_classes.append(cls_name)
        
        # 객체 매칭
        if len(tracked_objects) == 0:
            # 첫 프레임 또는 추적 객체 없음
            for i, centroid in enumerate(current_centroids):
                tracked_objects[next_object_id] = {
                    'center': centroid,
                    'class': current_classes[i],
                    'trail': [centroid],
                    'disappeared': 0
                }
                next_object_id += 1
        else:
            # 기존 객체와 새 검출 매칭
            object_ids = list(tracked_objects.keys())
            previous_centroids = [tracked_objects[oid]['center'] 
                                for oid in object_ids]
            
            # 거리 행렬 계산
            if len(current_centroids) > 0 and len(previous_centroids) > 0:
                distances = np.zeros((len(previous_centroids), 
                                    len(current_centroids)))
                
                for i, prev in enumerate(previous_centroids):
                    for j, curr in enumerate(current_centroids):
                        distances[i, j] = np.sqrt(
                            (prev[0] - curr[0])**2 + (prev[1] - curr[1])**2
                        )
                
                # 헝가리안 알고리즘 대신 간단한 greedy 매칭
                used_current = set()
                used_previous = set()
                
                # 거리가 가까운 순서로 매칭
                matches = []
                for _ in range(min(len(previous_centroids), len(current_centroids))):
                    min_dist = float('inf')
                    min_i, min_j = -1, -1
                    
                    for i in range(len(previous_centroids)):
                        if i in used_previous:
                            continue
                        for j in range(len(current_centroids)):
                            if j in used_current:
                                continue
                            if distances[i, j] < min_dist:
                                min_dist = distances[i, j]
                                min_i, min_j = i, j
                    
                    if min_dist < max_distance:
                        matches.append((min_i, min_j, min_dist))
                        used_previous.add(min_i)
                        used_current.add(min_j)
                
                # 매칭된 객체 업데이트
                for prev_idx, curr_idx, dist in matches:
                    object_id = object_ids[prev_idx]
                    tracked_objects[object_id]['center'] = current_centroids[curr_idx]
                    tracked_objects[object_id]['class'] = current_classes[curr_idx]
                    tracked_objects[object_id]['trail'].append(current_centroids[curr_idx])
                    tracked_objects[object_id]['disappeared'] = 0
                    
                    # 트레일 길이 제한
                    if len(tracked_objects[object_id]['trail']) > 30:
                        tracked_objects[object_id]['trail'].pop(0)
                
                # 매칭되지 않은 이전 객체 (사라진 객체)
                for i in range(len(previous_centroids)):
                    if i not in used_previous:
                        object_id = object_ids[i]
                        tracked_objects[object_id]['disappeared'] += 1
                
                # 매칭되지 않은 현재 검출 (새 객체)
                for j in range(len(current_centroids)):
                    if j not in used_current:
                        tracked_objects[next_object_id] = {
                            'center': current_centroids[j],
                            'class': current_classes[j],
                            'trail': [current_centroids[j]],
                            'disappeared': 0
                        }
                        next_object_id += 1
            
            # 오래 사라진 객체 제거
            to_delete = []
            for object_id, obj in tracked_objects.items():
                if obj['disappeared'] > max_disappeared:
                    to_delete.append(object_id)
            
            for object_id in to_delete:
                del tracked_objects[object_id]
        
        # 시각화
        for object_id, obj in tracked_objects.items():
            center = obj['center']
            trail = obj['trail']
            cls_name = obj['class']
            
            # 트레일 그리기
            if len(trail) > 1:
                for i in range(len(trail) - 1):
                    thickness = int(np.sqrt(30 / float(i + 1)) * 2)
                    cv2.line(frame, trail[i], trail[i + 1], (0, 255, 0), thickness)
            
            # 중심점
            cv2.circle(frame, center, 5, (0, 0, 255), -1)
            
            # ID 라벨
            text = f'ID: {object_id} ({cls_name})'
            cv2.putText(frame, text, (center[0] - 10, center[1] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # 정보 표시
        cv2.putText(frame, f'Tracked Objects: {len(tracked_objects)}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow('Centroid Tracking', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

# 실행
# simple_centroid_tracking()
```

## 4. SORT/DeepSORT 추적

### 실습 7: SORT 추적 알고리즘
```python
# SORT 라이브러리 설치 필요: pip install filterpy

from ultralytics import YOLO
import cv2
import numpy as np
from filterpy.kalman import KalmanFilter

class SORTTracker:
    """
    간단한 SORT (Simple Online and Realtime Tracking) 구현
    """
    def __init__(self, max_age=30, min_hits=3):
        self.max_age = max_age
        self.min_hits = min_hits
        self.trackers = []
        self.frame_count = 0
        self.next_id = 0
    
    def update(self, detections):
        """
        검출 결과로 추적 업데이트
        
        Args:
            detections: [[x1, y1, x2, y2, score], ...]
        
        Returns:
            [[x1, y1, x2, y2, track_id], ...]
        """
        self.frame_count += 1
        
        # 예측 단계
        for tracker in self.trackers:
            tracker['kf'].predict()
        
        # 매칭 (간단한 IoU 기반)
        if len(detections) > 0:
            matched, unmatched_dets, unmatched_trks = self._associate(detections)
            
            # 매칭된 추적 업데이트
            for t_idx, d_idx in matched:
                self.trackers[t_idx]['kf'].update(detections[d_idx][:4])
                self.trackers[t_idx]['hits'] += 1
                self.trackers[t_idx]['age'] = 0
            
            # 새로운 추적 생성
            for d_idx in unmatched_dets:
                self._create_tracker(detections[d_idx])
        
        # 나이 증가 및 제거
        i = len(self.trackers)
        ret = []
        
        for tracker in reversed(self.trackers):
            i -= 1
            
            # 상태 가져오기
            pos = tracker['kf'].x[:4].reshape((4,))
            
            tracker['age'] += 1
            
            if tracker['hits'] >= self.min_hits and tracker['age'] <= 1:
                ret.append([*pos, tracker['id']])
            
            # 오래된 추적 제거
            if tracker['age'] > self.max_age:
                self.trackers.pop(i)
        
        return ret
    
    def _create_tracker(self, detection):
        """새 추적 생성"""
        kf = KalmanFilter(dim_x=7, dim_z=4)
        
        # 상태 전이 행렬
        kf.F = np.array([
            [1, 0, 0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 1]
        ])
        
        # 측정 행렬
        kf.H = np.array([
            [1, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0]
        ])
        
        # 초기 상태
        kf.x[:4] = detection[:4].reshape((4, 1))
        
        self.trackers.append({
            'kf': kf,
            'id': self.next_id,
            'hits': 1,
            'age': 0
        })
        
        self.next_id += 1
    
    def _associate(self, detections):
        """검출과 추적 매칭"""
        if len(self.trackers) == 0:
            return [], list(range(len(detections))), []
        
        # IoU 계산
        iou_matrix = np.zeros((len(self.trackers), len(detections)))
        
        for t, tracker in enumerate(self.trackers):
            pos = tracker['kf'].x[:4].reshape((4,))
            for d, det in enumerate(detections):
                iou_matrix[t, d] = self._iou(pos, det[:4])
        
        # 헝가리안 알고리즘 (간단한 greedy)
        matched = []
        unmatched_dets = list(range(len(detections)))
        unmatched_trks = list(range(len(self.trackers)))
        
        for _ in range(min(len(self.trackers), len(detections))):
            max_iou = 0.3  # IoU 임계값
            max_t, max_d = -1, -1
            
            for t in unmatched_trks:
                for d in unmatched_dets:
                    if iou_matrix[t, d] > max_iou:
                        max_iou = iou_matrix[t, d]
                        max_t, max_d = t, d
            
            if max_t != -1:
                matched.append((max_t, max_d))
                unmatched_trks.remove(max_t)
                unmatched_dets.remove(max_d)
        
        return matched, unmatched_dets, unmatched_trks
    
    def _iou(self, box1, box2):
        """IoU 계산"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        inter_area = max(0, x2 - x1) * max(0, y2 - y1)
        
        box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
        box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
        
        union_area = box1_area + box2_area - inter_area
        
        return inter_area / union_area if union_area > 0 else 0

def tracking_with_sort():
    """
    SORT를 사용한 객체 추적
    """
    print("SORT 객체 추적\n")
    
    model = YOLO('yolov8n.pt')
    tracker = SORTTracker(max_age=30, min_hits=3)
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 색상 맵 (ID별로 다른 색상)
    np.random.seed(42)
    colors = {}
    
    def get_color(track_id):
        if track_id not in colors:
            colors[track_id] = tuple(np.random.randint(0, 255, 3).tolist())
        return colors[track_id]
    
    print("[Q] 종료\n")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출
        results = model(frame, classes=[0], verbose=False)
        
        # 검출 결과를 SORT 형식으로 변환
        detections = []
        for box in results[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            detections.append([x1, y1, x2, y2, conf])
        
        # 추적 업데이트
        if len(detections) > 0:
            tracks = tracker.update(np.array(detections))
        else:
            tracks = tracker.update(np.empty((0, 5)))
        
        # 시각화
        for track in tracks:
            x1, y1, x2, y2, track_id = track
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            track_id = int(track_id)
            
            # 색상
            color = get_color(track_id)
            
            # 박스
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # ID 라벨
            label = f'ID: {track_id}'
            cv2.putText(frame, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # 정보
        cv2.putText(frame, f'Tracked: {len(tracks)}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow('SORT Tracking', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

# 실행
# tracking_with_sort()
```

### 실습 8: Ultralytics 내장 추적 사용
```python
from ultralytics import YOLO
import cv2
import numpy as np

def ultralytics_tracking():
    """
    Ultralytics 내장 추적 기능 사용
    (BoT-SORT, ByteTrack 등)
    """
    print("Ultralytics 내장 추적")
    print("=" * 60)
    print("지원 추적 알고리즘:")
    print("  - botsort (기본)")
    print("  - bytetrack")
    print("=" * 60 + "\n")
    
    # 추적 가능한 모델 로드
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 추적 통계
    track_history = {}  # {track_id: [(x, y), ...]}
    total_tracks = set()
    
    print("[Q] 종료 | [C] 통계 초기화\n")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 추적 수행 (.track() 메서드 사용)
        results = model.track(
            frame,
            persist=True,  # 프레임 간 ID 유지
            tracker='botsort.yaml',  # 추적 알고리즘
            classes=[0],  # person만
            verbose=False
        )
        
        # 추적 결과 시각화
        annotated_frame = results[0].plot()
        
        # 추적 정보 수집
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.cpu().numpy().astype(int)
            
            for box, track_id in zip(boxes, track_ids):
                x1, y1, x2, y2 = box
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                
                # 트레일 업데이트
                if track_id not in track_history:
                    track_history[track_id] = []
                track_history[track_id].append((center_x, center_y))
                
                # 트레일 길이 제한
                if len(track_history[track_id]) > 30:
                    track_history[track_id].pop(0)
                
                # 총 추적 ID
                total_tracks.add(track_id)
                
                # 트레일 그리기
                points = track_history[track_id]
                if len(points) > 1:
                    for i in range(len(points) - 1):
                        thickness = int(np.sqrt(30 / float(i + 1)) * 2)
                        cv2.line(annotated_frame, points[i], points[i + 1],
                               (0, 255, 0), thickness)
        
        # 통계 표시
        current_tracks = len(track_ids) if results[0].boxes.id is not None else 0
        cv2.putText(annotated_frame, f'Current: {current_tracks}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f'Total IDs: {len(total_tracks)}', (10, 65),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow('Ultralytics Tracking', annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            track_history.clear()
            total_tracks.clear()
            print("통계 초기화")
    
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n최종 통계:")
    print(f"  총 추적된 고유 ID: {len(total_tracks)}")

# 실행
# ultralytics_tracking()
```

## 5. 고급 필터링과 추적

### 실습 9: 크기 기반 필터링
```python
from ultralytics import YOLO
import cv2

def size_based_filtering():
    """
    객체 크기에 따른 필터링
    """
    print("크기 기반 객체 필터링\n")
    
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 크기 임계값 (픽셀)
    min_width = 50
    max_width = 400
    min_height = 50
    max_height = 400
    
    print(f"크기 범위: {min_width}x{min_height} ~ {max_width}x{max_height}")
    print("[Q] 종료 | [+/-] 최소 크기 조정\n")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 검출
        results = model(frame, verbose=False)
        
        # 크기 필터링
        small_objects = []
        medium_objects = []
        large_objects = []
        
        for box in results[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            width = x2 - x1
            height = y2 - y1
            
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            
            # 크기 체크
            if width < min_width or height < min_height:
                small_objects.append((box, 'small'))
                color = (128, 128, 128)  # 회색
            elif width > max_width or height > max_height:
                large_objects.append((box, 'large'))
                color = (255, 0, 0)  # 파랑
            else:
                medium_objects.append((box, 'medium'))
                color = (0, 255, 0)  # 초록
            
            # 박스 그리기
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)),
                         color, 2)
            
            # 라벨
            label = f'{cls_name} {int(width)}x{int(height)}'
            cv2.putText(frame, label, (int(x1), int(y1) - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # 통계
        y_pos = 30
        cv2.putText(frame, f'Small: {len(small_objects)}', (10, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (128, 128, 128), 2)
        y_pos += 30
        cv2.putText(frame, f'Medium: {len(medium_objects)}', (10, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        y_pos += 30
        cv2.putText(frame, f'Large: {len(large_objects)}', (10, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
        
        cv2.imshow('Size-based Filtering', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('+') or key == ord('='):
            min_width += 10
            min_height += 10
            print(f"최소 크기: {min_width}x{min_height}")
        elif key == ord('-'):
            min_width = max(10, min_width - 10)
            min_height = max(10, min_height - 10)
            print(f"최소 크기: {min_width}x{min_height}")
    
    cap.release()
    cv2.destroyAllWindows()

# 실행
# size_based_filtering()
```

### 실습 10: 속도 기반 필터링
```python
from ultralytics import YOLO
import cv2
import numpy as np
from collections import defaultdict
import time

def speed_based_filtering():
    """
    객체 속도에 따른 필터링
    """
    print("속도 기반 객체 필터링\n")
    
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    # 추적 데이터
    track_data = defaultdict(lambda: {
        'positions': [],
        'timestamps': [],
        'speed': 0
    })
    
    speed_threshold = 50  # 픽셀/초
    
    print(f"속도 임계값: {speed_threshold} 픽셀/초")
    print("[Q] 종료\n")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        current_time = time.time()
        
        # 추적
        results = model.track(
            frame,
            persist=True,
            tracker='botsort.yaml',
            classes=[0],
            verbose=False
        )
        
        # 속도 계산
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.cpu().numpy().astype(int)
            
            for box, track_id in zip(boxes, track_ids):
                x1, y1, x2, y2 = box
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                
                # 위치 기록
                track_data[track_id]['positions'].append((center_x, center_y))
                track_data[track_id]['timestamps'].append(current_time)
                
                # 최근 10프레임만 유지
                if len(track_data[track_id]['positions']) > 10:
                    track_data[track_id]['positions'].pop(0)
                    track_data[track_id]['timestamps'].pop(0)
                
                # 속도 계산
                if len(track_data[track_id]['positions']) >= 2:
                    positions = track_data[track_id]['positions']
                    timestamps = track_data[track_id]['timestamps']
                    
                    # 최근 2개 포인트로 속도 계산
                    dx = positions[-1][0] - positions[-2][0]
                    dy = positions[-1][1] - positions[-2][1]
                    dt = timestamps[-1] - timestamps[-2]
                    
                    if dt > 0:
                        distance = np.sqrt(dx**2 + dy**2)
                        speed = distance / dt
                        track_data[track_id]['speed'] = speed
                    else:
                        track_data[track_id]['speed'] = 0
                else:
                    track_data[track_id]['speed'] = 0
                
                # 속도에 따른 색상
                speed = track_data[track_id]['speed']
                if speed > speed_threshold:
                    color = (0, 0, 255)  # 빨강 (빠름)
                    status = 'FAST'
                else:
                    color = (0, 255, 0)  # 초록 (느림)
                    status = 'SLOW'
                
                # 박스
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)),
                             color, 2)
                
                # 라벨
                label = f'ID:{track_id} {status} {speed:.1f}px/s'
                cv2.putText(frame, label, (int(x1), int(y1) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                # 속도 벡터 (화살표)
                if len(track_data[track_id]['positions']) >= 2:
                    start = (int(positions[-2][0]), int(positions[-2][1]))
                    end = (int(positions[-1][0]), int(positions[-1][1]))
                    cv2.arrowedLine(frame, start, end, color, 2)
        
        cv2.imshow('Speed-based Filtering', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

# 실행
# speed_based_filtering()
```

## 6. 종합 실습 프로젝트

### 실습 11: 완전한 관제 시스템 프로토타입
```python
from ultralytics import YOLO
import cv2
import numpy as np
from collections import defaultdict
import time
import json
from datetime import datetime
from pathlib import Path

class SurveillanceSystem:
    """
    완전한 영상 관제 시스템
    - 특정 객체 필터링
    - 객체 추적
    - ROI 설정
    - 이벤트 감지
    - 통계 수집
    """
    
    def __init__(self, config=None):
        """
        Args:
            config: 설정 딕셔너리
        """
        # 기본 설정
        self.config = config or {
            'model': 'yolov8n.pt',
            'target_classes': ['person'],
            'confidence': 0.5,
            'tracker': 'botsort.yaml',
            'roi_enabled': False,
            'roi_points': [],
            'alert_conditions': {
                'max_objects': 5,
                'speed_threshold': 100,
                'size_min': 50,
                'size_max': 500
            }
        }
        
        # 모델 로드
        print("모델 로딩...")
        self.model = YOLO(self.config['model'])
        
        # 클래스 ID 변환
        self.target_class_ids = []
        for target in self.config['target_classes']:
            for idx, name in self.model.names.items():
                if name == target:
                    self.target_class_ids.append(idx)
                    break
        
        print(f"✓ 타겟 클래스: {self.config['target_classes']}")
        
        # 통계
        self.stats = {
            'total_detections': 0,
            'total_tracks': set(),
            'alerts': [],
            'class_counts': defaultdict(int),
            'start_time': None
        }
        
        # 추적 데이터
        self.track_data = defaultdict(lambda: {
            'positions': [],
            'timestamps': [],
            'first_seen': None,
            'last_seen': None
        })
        
        # 출력 디렉토리
        self.output_dir = Path('surveillance_output')
        self.output_dir.mkdir(exist_ok=True)
        
        print("✓ 시스템 초기화 완료\n")
    
    def set_roi(self, points):
        """ROI 설정"""
        self.config['roi_points'] = points
        self.config['roi_enabled'] = len(points) >= 3
        print(f"ROI 설정: {len(points)} 포인트")
    
    def is_inside_roi(self, x, y):
        """점이 ROI 내부인지 확인"""
        if not self.config['roi_enabled']:
            return True
        
        pts = np.array(self.config['roi_points'], np.int32)
        result = cv2.pointPolygonTest(pts, (float(x), float(y)), False)
        return result >= 0
    
    def check_alerts(self, track_id, box, speed):
        """알람 조건 체크"""
        alerts = []
        
        # 크기 체크
        x1, y1, x2, y2 = box
        width = x2 - x1
        height = y2 - y1
        
        size_min = self.config['alert_conditions']['size_min']
        size_max = self.config['alert_conditions']['size_max']
        
        if width < size_min or height < size_min:
            alerts.append({
                'type': 'SIZE_TOO_SMALL',
                'track_id': track_id,
                'size': (width, height)
            })
        elif width > size_max or height > size_max:
            alerts.append({
                'type': 'SIZE_TOO_LARGE',
                'track_id': track_id,
                'size': (width, height)
            })
        
        # 속도 체크
        speed_threshold = self.config['alert_conditions']['speed_threshold']
        if speed > speed_threshold:
            alerts.append({
                'type': 'HIGH_SPEED',
                'track_id': track_id,
                'speed': speed
            })
        
        return alerts
    
    def process_frame(self, frame):
        """프레임 처리"""
        current_time = time.time()
        
        # 추적
        results = self.model.track(
            frame,
            persist=True,
            tracker=self.config['tracker'],
            classes=self.target_class_ids,
            conf=self.config['confidence'],
            verbose=False
        )
        
        # 결과 분석
        detections_info = []
        
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.cpu().numpy().astype(int)
            classes = results[0].boxes.cls.cpu().numpy().astype(int)
            confidences = results[0].boxes.conf.cpu().numpy()
            
            for box, track_id, cls_id, conf in zip(boxes, track_ids, classes, confidences):
                x1, y1, x2, y2 = box
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                
                # ROI 체크
                if not self.is_inside_roi(center_x, center_y):
                    continue
                
                # 추적 데이터 업데이트
                if self.track_data[track_id]['first_seen'] is None:
                    self.track_data[track_id]['first_seen'] = current_time
                    self.stats['total_tracks'].add(track_id)
                
                self.track_data[track_id]['last_seen'] = current_time
                self.track_data[track_id]['positions'].append((center_x, center_y))
                self.track_data[track_id]['timestamps'].append(current_time)
                
                # 최근 데이터만 유지
                if len(self.track_data[track_id]['positions']) > 30:
                    self.track_data[track_id]['positions'].pop(0)
                    self.track_data[track_id]['timestamps'].pop(0)
                
                # 속도 계산
                speed = 0
                if len(self.track_data[track_id]['positions']) >= 2:
                    pos = self.track_data[track_id]['positions']
                    ts = self.track_data[track_id]['timestamps']
                    
                    dx = pos[-1][0] - pos[-2][0]
                    dy = pos[-1][1] - pos[-2][1]
                    dt = ts[-1] - ts[-2]
                    
                    if dt > 0:
                        distance = np.sqrt(dx**2 + dy**2)
                        speed = distance / dt
                
                # 알람 체크
                alerts = self.check_alerts(track_id, box, speed)
                if alerts:
                    for alert in alerts:
                        alert['timestamp'] = current_time
                        self.stats['alerts'].append(alert)
                        print(f"⚠ ALERT: {alert['type']} - ID {track_id}")
                
                # 통계
                self.stats['total_detections'] += 1
                cls_name = self.model.names[cls_id]
                self.stats['class_counts'][cls_name] += 1
                
                # 검출 정보 저장
                detections_info.append({
                    'box': box,
                    'track_id': track_id,
                    'class': cls_name,
                    'confidence': conf,
                    'speed': speed,
                    'alerts': alerts
                })
        
        return results, detections_info
    
    def draw_visualization(self, frame, results, detections_info):
        """시각화"""
        # 결과 그리기
        annotated_frame = frame.copy()
        
        # ROI 그리기
        if self.config['roi_enabled']:
            pts = np.array(self.config['roi_points'], np.int32)
            pts = pts.reshape((-1, 1, 2))
            
            overlay = annotated_frame.copy()
            cv2.fillPoly(overlay, [pts], (0, 255, 0))
            annotated_frame = cv2.addWeighted(annotated_frame, 0.7, overlay, 0.3, 0)
            cv2.polylines(annotated_frame, [pts], True, (0, 255, 0), 3)
        
        # 검출 객체 그리기
        for det in detections_info:
            box = det['box']
            track_id = det['track_id']
            cls_name = det['class']
            conf = det['confidence']
            speed = det['speed']
            alerts = det['alerts']
            
            x1, y1, x2, y2 = map(int, box)
            
            # 알람이 있으면 빨간색, 없으면 초록색
            color = (0, 0, 255) if alerts else (0, 255, 0)
            
            # 박스
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            
            # 라벨
            label = f'ID:{track_id} {cls_name} {conf:.2f}'
            cv2.putText(annotated_frame, label, (x1, y1 - 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # 속도
            if speed > 0:
                speed_label = f'Speed: {speed:.1f}px/s'
                cv2.putText(annotated_frame, speed_label, (x1, y1 - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
            
            # 트레일
            if track_id in self.track_data:
                positions = self.track_data[track_id]['positions']
                if len(positions) > 1:
                    for i in range(len(positions) - 1):
                        pt1 = (int(positions[i][0]), int(positions[i][1]))
                        pt2 = (int(positions[i+1][0]), int(positions[i+1][1]))
                        cv2.line(annotated_frame, pt1, pt2, color, 2)
        
        # 통계 패널
        self._draw_stats_panel(annotated_frame, detections_info)
        
        return annotated_frame
    
    def _draw_stats_panel(self, frame, detections_info):
        """통계 패널 그리기"""
        # 배경
        panel_height = 150
        cv2.rectangle(frame, (0, 0), (400, panel_height), (0, 0, 0), -1)
        
        # 텍스트
        y = 25
        cv2.putText(frame, f'Objects: {len(detections_info)}', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        y += 25
        cv2.putText(frame, f'Total Tracks: {len(self.stats["total_tracks"])}', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        y += 25
        cv2.putText(frame, f'Alerts: {len(self.stats["alerts"])}', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        y += 25
        elapsed = time.time() - self.stats['start_time'] if self.stats['start_time'] else 0
        cv2.putText(frame, f'Runtime: {elapsed:.0f}s', (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
        
        # 클래스별 통계
        y += 25
        for cls_name, count in self.stats['class_counts'].items():
            cv2.putText(frame, f'{cls_name}: {count}', (10, y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
            y += 20
    
    def run(self, source=0):
        """시스템 실행"""
        print("관제 시스템 시작")
        print("=" * 60)
        print("[Q] 종료 | [S] 스크린샷 | [R] ROI 설정 | [P] 통계 출력")
        print("=" * 60 + "\n")
        
        cap = cv2.VideoCapture(source)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        if not cap.isOpened():
            print("카메라를 열 수 없습니다!")
            return
        
        self.stats['start_time'] = time.time()
        
        # ROI 설정 모드
        roi_points = []
        
        def mouse_callback(event, x, y, flags, param):
            nonlocal roi_points
            if event == cv2.EVENT_LBUTTONDOWN:
                roi_points.append((x, y))
                print(f"ROI 포인트 추가: ({x}, {y})")
        
        cv2.namedWindow('Surveillance System')
        cv2.setMouseCallback('Surveillance System', mouse_callback)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # 프레임 처리
            results, detections_info = self.process_frame(frame)
            
            # 시각화
            annotated_frame = self.draw_visualization(frame, results, detections_info)
            
            # ROI 설정 모드 표시
            if roi_points:
                for point in roi_points:
                    cv2.circle(annotated_frame, point, 5, (0, 0, 255), -1)
            
            cv2.imshow('Surveillance System', annotated_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # 스크린샷
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = self.output_dir / f'screenshot_{timestamp}.jpg'
                cv2.imwrite(str(filename), annotated_frame)
                print(f"✓ 스크린샷: {filename}")
            elif key == ord('r'):
                # ROI 설정
                if len(roi_points) >= 3:
                    self.set_roi(roi_points)
                    roi_points = []
                else:
                    print("최소 3개의 포인트가 필요합니다")
            elif key == ord('p'):
                # 통계 출력
                self.print_stats()
        
        cap.release()
        cv2.destroyAllWindows()
        
        # 최종 통계 및 저장
        self.print_stats()
        self.save_stats()
    
    def print_stats(self):
        """통계 출력"""
        print("\n" + "=" * 60)
        print("통계")
        print("=" * 60)
        print(f"총 검출: {self.stats['total_detections']}")
        print(f"고유 추적 ID: {len(self.stats['total_tracks'])}")
        print(f"알람 발생: {len(self.stats['alerts'])}")
        
        print("\n클래스별:")
        for cls_name, count in self.stats['class_counts'].items():
            print(f"  {cls_name}: {count}")
        
        if self.stats['alerts']:
            print("\n최근 알람:")
            for alert in self.stats['alerts'][-5:]:
                print(f"  {alert['type']} - ID {alert['track_id']}")
        
        print("=" * 60)
    
    def save_stats(self):
        """통계 저장"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        stats_file = self.output_dir / f'stats_{timestamp}.json'
        
        stats_data = {
            'config': self.config,
            'total_detections': self.stats['total_detections'],
            'total_tracks': len(self.stats['total_tracks']),
            'class_counts': dict(self.stats['class_counts']),
            'alerts': self.stats['alerts'],
            'runtime': time.time() - self.stats['start_time']
        }
        
        with open(stats_file, 'w') as f:
            json.dump(stats_data, f, indent=2)
        
        print(f"\n✓ 통계 저장: {stats_file}")


# 실행
def main():
    config = {
        'model': 'yolov8n.pt',
        'target_classes': ['person'],
        'confidence': 0.5,
        'tracker': 'botsort.yaml',
        'roi_enabled': False,
        'roi_points': [],
        'alert_conditions': {
            'max_objects': 5,
            'speed_threshold': 100,
            'size_min': 30,
            'size_max': 500
        }
    }
    
    system = SurveillanceSystem(config)
    system.run(source=0)

# if __name__ == '__main__':
#     main()
```

## 7. 학습 체크리스트

4단계를 완료하기 위한 체크리스트:

- [ ] 단일 클래스 필터링 구현
- [ ] 다중 클래스 필터링 구현
- [ ] Confidence 기반 필터링 이해
- [ ] ROI 설정 및 영역 내 객체만 검출
- [ ] 라인 크로싱 감지 구현
- [ ] 중심점 기반 간단한 추적 구현
- [ ] SORT 추적 알고리즘 이해
- [ ] Ultralytics 내장 추적 사용
- [ ] 크기 기반 필터링 구현
- [ ] 속도 기반 필터링 구현
- [ ] 종합 관제 시스템 프로토타입 구현

## 8. 다음 단계 준비

4단계를 완료했다면:

1. **데이터 수집**: 관제하고 싶은 환경의 영상 수집
2. **추적 성능 테스트**: 다양한 추적 알고리즘 비교
3. **이벤트 정의**: 실제 관제에 필요한 이벤트 조건 정리
4. **라벨링 도구 준비**: 5단계를 위한 데이터 라벨링 도구 설치

궁금한 점이나 오류가 발생하면 언제든 질문해주세요!
