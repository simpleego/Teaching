import cv2
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import numpy as np

class VideoProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("영상 처리 프로그램")

        self.image = None
        self.processed_image = None

        # 버튼 영역
        btn_frame = tk.Frame(root)
        btn_frame.pack()

        tk.Button(btn_frame, text="영상 불러오기", command=self.load_image).grid(row=0, column=0, padx=5, pady=5)
        tk.Button(btn_frame, text="영상 저장하기", command=self.save_image).grid(row=0, column=1, padx=5, pady=5)
        tk.Button(btn_frame, text="크기 줄이기", command=self.resize_small).grid(row=0, column=2, padx=5, pady=5)
        tk.Button(btn_frame, text="크기 늘리기", command=self.resize_large).grid(row=0, column=3, padx=5, pady=5)
        tk.Button(btn_frame, text="밝기 증가", command=lambda: self.adjust_brightness(30)).grid(row=1, column=0, padx=5, pady=5)
        tk.Button(btn_frame, text="밝기 감소", command=lambda: self.adjust_brightness(-30)).grid(row=1, column=1, padx=5, pady=5)
        tk.Button(btn_frame, text="에지 검출", command=self.edge_detection).grid(row=1, column=2, padx=5, pady=5)
        tk.Button(btn_frame, text="임계값 분할", command=self.thresholding).grid(row=1, column=3, padx=5, pady=5)

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

    def resize_small(self):
        if self.processed_image is None: return
        h, w = self.processed_image.shape[:2]
        self.processed_image = cv2.resize(self.processed_image, (w//2, h//2))
        self.display_image(self.processed_image)

    def resize_large(self):
        if self.processed_image is None: return
        h, w = self.processed_image.shape[:2]
        self.processed_image = cv2.resize(self.processed_image, (w*2, h*2))
        self.display_image(self.processed_image)

    def adjust_brightness(self, value):
        if self.processed_image is None: return
        hsv = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        v = cv2.add(v, value)
        v = np.clip(v, 0, 255)
        hsv = cv2.merge((h, s, v))
        self.processed_image = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        self.display_image(self.processed_image)

    def edge_detection(self):
        if self.processed_image is None: return
        edges = cv2.Canny(self.processed_image, 100, 200)
        self.processed_image = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        self.display_image(self.processed_image)

    def thresholding(self):
        if self.processed_image is None: return
        gray = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        self.processed_image = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
        self.display_image(self.processed_image)

if __name__ == "__main__":
    root = tk.Tk()
    app = VideoProcessorApp(root)
    root.mainloop()