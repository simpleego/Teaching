import cv2
import datetime

def main():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("웹캠을 열 수 없습니다.")
        return

    back_sub = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=50, detectShadows=True)

    # 로그 파일 열기
    log_file = open("detections_log.txt", "w", encoding="utf-8")
    log_file.write("time,x,y,w,h,area\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (640, 480))

        fg_mask = back_sub.apply(frame)

        _, thresh = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
        thresh = cv2.dilate(thresh, kernel, iterations=2)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 800:
                continue

            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # 현재 시간 + 좌표/크기 로그 기록
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_line = f"{now},{x},{y},{w},{h},{area}\n"
            log_file.write(log_line)

        cv2.imshow("Motion Detection with Logging (press x to exit)", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('x'):
            break

    log_file.close()
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()