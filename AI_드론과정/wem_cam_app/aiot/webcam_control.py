import cv2

def main():
    # 웹캠 열기 (0: 기본 카메라)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("웹캠을 열 수 없습니다.")
        return

    # 배경 차분기 생성 (MOG2 사용)
    back_sub = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=50, detectShadows=True)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 프레임 크기 조정 (선택)
        frame = cv2.resize(frame, (640, 480))

        # 배경 차분 적용
        fg_mask = back_sub.apply(frame)

        # 노이즈 제거를 위한 이진화 & 모폴로지 연산
        _, thresh = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
        thresh = cv2.dilate(thresh, kernel, iterations=2)

        # 윤곽선 찾기
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            # 너무 작은 영역은 무시
            area = cv2.contourArea(cnt)
            if area < 500:
                continue

            x, y, w, h = cv2.boundingRect(cnt)
            # 검출된 영역에 사각형 표시
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # 결과 출력
        cv2.imshow("Webcam - Detected Motion", frame)
        cv2.imshow("Foreground Mask", thresh)

        # q 키를 누르면 종료
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()