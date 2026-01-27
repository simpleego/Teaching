import cv2
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import numpy as np

class VideoProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("영상 처리 프로그램 (사용자 입력 버전)")

        self.image = None
        self.processed_image = None

        # 버튼 영역
        btn_frame = tk.Frame(root)
        btn_frame.pack()

        tk.Button(btn_frame, text="영상 불러오기", command=self.load_image).grid(row=0, column=0, padx=5, pady=5)
        tk.Button(btn_frame, text="영상 저장하기", command=self.save_image).grid(row=0, column=1, padx=5, pady=5)

        # 크기 조절 입력
        tk.Label(btn_frame, text="크기 비율 (예: 0.5)").grid(row=1, column=0)
        self.scale_entry = tk.Entry(btn_frame, width=5)
        self.scale_entry.insert(0, "0.5")
        self.scale_entry.grid(row=1, column=1)
        tk.Button(btn_frame, text="크기 조절", command=self.resize_custom).grid(row=1, column=2, padx=5, pady=5)

        # 밝기 조절 입력
        tk.Label(btn_frame, text="밝기 값 (+/-)").grid(row=2, column=0)
        self.brightness_entry = tk.Entry(btn_frame, width=5)
        self.brightness_entry.insert(0, "30")
        self.brightness_entry.grid(row=2, column=1)
        tk.Button(btn_frame, text="밝기 조정", command=self.adjust_brightness).grid(row=2, column=2, padx=5, pady=5)

        # 임계값 입력
        tk.Label(btn_frame, text="임계값 (0~255)").grid(row=3, column=0)
        self.threshold_entry = tk.Entry(btn_frame, width=5)
        self.threshold_entry.insert(0, "127")
        self.threshold_entry.grid(row=3, column=1)
        tk.Button(btn_frame, text="임계값 분할", command=self.thresholding).grid(row=3, column=2, padx=5, pady=5)

        # 에지 검출 버튼
        tk.Button(btn_frame, text="에지 검출", command=self.edge_detection).grid(row=4, column=0, padx=5, pady=5)

        # 영상 표시 영역
        self.panel = tk.Label(root)
        self.panel.pack()

    def load_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg;*.png;*.bmp;*.tif")])
        if not file_path:
            return
        self.image = cv2.imread(file_path)
        self.processed_image = self.image.copy()
        self.display_image(self.image)

    def save_image(self):
        if self.processed_image is None:
            messagebox.showwarning("경고", "저장할 영상이 없습니다.")
            return
        file_path = filedialog.asksaveasfilename(defaultextension=".jpg",
                                                 filetypes=[("JPEG", "*.jpg"), ("PNG", "*.png"), ("BMP", "*.bmp")])
        if file_path:
            cv2.imwrite(file_path, self.processed_image)
            messagebox.showinfo("저장 완료", f"{file_path} 에 저장되었습니다.")

    def display_image(self, img):
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        im_pil = Image.fromarray(img_rgb)
        imgtk = ImageTk.PhotoImage(image=im_pil)
        self.panel.imgtk = imgtk
        self.panel.configure(image=imgtk)

    def resize_custom(self):
        if self.processed_image is None: return
        try:
            scale = float(self.scale_entry.get())
            h, w = self.processed_image.shape[:2]
            new_size = (int(w * scale), int(h * scale))
            self.processed_image = cv2.resize(self.processed_image, new_size)
            self.display_image(self.processed_image)
        except ValueError:
            messagebox.showerror("입력 오류", "올바른 숫자를 입력하세요.")

    def adjust_brightness(self):
        if self.processed_image is None: return
        try:
            value = int(self.brightness_entry.get())
            hsv = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            v = cv2.add(v, value)
            v = np.clip(v, 0, 255)
            hsv = cv2.merge((h, s, v))
            self.processed_image = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
            self.display_image(self.processed_image)
        except ValueError:
            messagebox.showerror("입력 오류", "올바른 숫자를 입력하세요.")

    def edge_detection(self):
        if self.processed_image is None: return
        edges = cv2.Canny(self.processed_image, 100, 200)
        self.processed_image = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        self.display_image(self.processed_image)

    def thresholding(self):
        if self.processed_image is None: return
        try:
            thresh_val = int(self.threshold_entry.get())
            gray = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY)
            self.processed_image = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
            self.display_image(self.processed_image)
        except ValueError:
            messagebox.showerror("입력 오류", "0~255 범위의 숫자를 입력하세요.")

if __name__ == "__main__":
    root = tk.Tk()
    app = VideoProcessorApp(root)
    root.mainloop()