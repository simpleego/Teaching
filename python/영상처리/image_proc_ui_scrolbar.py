import cv2
import tkinter as tk
from tkinter import filedialog, messagebox, Toplevel
from PIL import Image, ImageTk
import numpy as np

class VideoProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("영상 처리 프로그램 (스크롤 지원)")

        self.image = None
        self.processed_image = None
        self.history = []

        # 메뉴 생성
        menubar = tk.Menu(root)
        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="영상 불러오기", command=self.load_image)
        file_menu.add_command(label="영상 저장하기", command=self.save_image)
        file_menu.add_separator()
        file_menu.add_command(label="Undo", command=self.undo)
        file_menu.add_command(label="결과 별도 윈도우", command=self.show_in_new_window)
        menubar.add_cascade(label="파일", menu=file_menu)

        filter_menu = tk.Menu(menubar, tearoff=0)
        filter_menu.add_command(label="에지 검출", command=self.edge_detection)
        menubar.add_cascade(label="필터", menu=filter_menu)

        segment_menu = tk.Menu(menubar, tearoff=0)
        segment_menu.add_command(label="임계값 분할", command=self.thresholding)
        menubar.add_cascade(label="영상 분할", menu=segment_menu)

        image_menu = tk.Menu(menubar, tearoff=0)
        image_menu.add_command(label="크기 조절", command=self.resize_custom)
        image_menu.add_command(label="밝기 조정", command=self.adjust_brightness)
        menubar.add_cascade(label="이미지 처리", menu=image_menu)

        root.config(menu=menubar)

        # 입력창 영역
        control_frame = tk.Frame(root)
        control_frame.pack()

        tk.Label(control_frame, text="크기 비율").grid(row=0, column=0)
        self.scale_entry = tk.Entry(control_frame, width=5)
        self.scale_entry.insert(0, "0.5")
        self.scale_entry.grid(row=0, column=1)

        tk.Label(control_frame, text="밝기 값 (+/-)").grid(row=1, column=0)
        self.brightness_entry = tk.Entry(control_frame, width=5)
        self.brightness_entry.insert(0, "30")
        self.brightness_entry.grid(row=1, column=1)

        tk.Label(control_frame, text="임계값 (0~255)").grid(row=2, column=0)
        self.threshold_entry = tk.Entry(control_frame, width=5)
        self.threshold_entry.insert(0, "127")
        self.threshold_entry.grid(row=2, column=1)

        # 스크롤 가능한 캔버스 생성
        self.canvas = tk.Canvas(root, bg="gray")
        self.canvas.pack(fill=tk.BOTH, expand=True)

        self.hbar = tk.Scrollbar(root, orient=tk.HORIZONTAL, command=self.canvas.xview)
        self.hbar.pack(side=tk.BOTTOM, fill=tk.X)
        self.vbar = tk.Scrollbar(root, orient=tk.VERTICAL, command=self.canvas.yview)
        self.vbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.canvas.configure(xscrollcommand=self.hbar.set, yscrollcommand=self.vbar.set)

    def load_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg;*.png;*.bmp;*.tif")])
        if not file_path: return
        self.image = cv2.imread(file_path)
        self.processed_image = self.image.copy()
        self.history.clear()
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

        # 캔버스에 이미지 표시
        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor="nw", image=imgtk)
        self.canvas.imgtk = imgtk

        # 스크롤 영역 설정
        self.canvas.config(scrollregion=self.canvas.bbox("all"))

    def push_history(self):
        if self.processed_image is not None:
            self.history.append(self.processed_image.copy())

    def undo(self):
        if self.history:
            self.processed_image = self.history.pop()
            self.display_image(self.processed_image)
        else:
            messagebox.showinfo("Undo", "되돌릴 작업이 없습니다.")

    def show_in_new_window(self):
        if self.processed_image is None: return
        new_win = Toplevel(self.root)
        new_win.title("처리 결과")
        canvas = tk.Canvas(new_win, bg="gray")
        canvas.pack(fill=tk.BOTH, expand=True)

        hbar = tk.Scrollbar(new_win, orient=tk.HORIZONTAL, command=canvas.xview)
        hbar.pack(side=tk.BOTTOM, fill=tk.X)
        vbar = tk.Scrollbar(new_win, orient=tk.VERTICAL, command=canvas.yview)
        vbar.pack(side=tk.RIGHT, fill=tk.Y)
        canvas.configure(xscrollcommand=hbar.set, yscrollcommand=vbar.set)

        img_rgb = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2RGB)
        im_pil = Image.fromarray(img_rgb)
        imgtk = ImageTk.PhotoImage(image=im_pil)
        canvas.create_image(0, 0, anchor="nw", image=imgtk)
        canvas.imgtk = imgtk
        canvas.config(scrollregion=canvas.bbox("all"))

    def resize_custom(self):
        if self.processed_image is None: return
        try:
            scale = float(self.scale_entry.get())
            h, w = self.processed_image.shape[:2]
            self.push_history()
            self.processed_image = cv2.resize(self.processed_image, (int(w * scale), int(h * scale)))
            self.display_image(self.processed_image)
        except ValueError:
            messagebox.showerror("입력 오류", "올바른 숫자를 입력하세요.")

    def adjust_brightness(self):
        if self.processed_image is None: return
        try:
            value = int(self.brightness_entry.get())
            self.push_history()
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
        self.push_history()
        edges = cv2.Canny(self.processed_image, 100, 200)
        self.processed_image = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        self.display_image(self.processed_image)

    def thresholding(self):
        if self.processed_image is None: return
        try:
            thresh_val = int(self.threshold_entry.get())
            self.push_history()
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