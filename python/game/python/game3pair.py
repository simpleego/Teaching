import tkinter as tk
import random
import time
import threading

# GUI 생성
root = tk.Tk()
root.title("슬롯머신 게임")

# 이미지 불러오기 (root 생성 이후에 해야 함)
apple_img = tk.PhotoImage(file="apple.png")
banana_img = tk.PhotoImage(file="banana.png")
cherry_img = tk.PhotoImage(file="cherry.png")

fruits = ["apple", "banana", "cherry"]
fruit_images = {
    "apple": apple_img,
    "banana": banana_img,
    "cherry": cherry_img
}

# 슬롯 라벨
slot_labels = [tk.Label(root), tk.Label(root), tk.Label(root)]
for i, lbl in enumerate(slot_labels):
    lbl.grid(row=0, column=i, padx=10, pady=10)

# 결과 라벨
result_label = tk.Label(root, text="", font=("Arial", 14))
result_label.grid(row=1, column=0, columnspan=3)

# 슬롯 돌리기 함수
def spin_slots():
    def spin():
        result_label.config(text="돌리는 중...")
        slots = []
        for i in range(3):
            # 애니메이션 효과: 여러 번 바뀌다가 멈춤
            for _ in range(10):
                choice = random.choice(fruits)
                slot_labels[i].config(image=fruit_images[choice])
                root.update()
                time.sleep(0.1)
            final_choice = random.choice(fruits)
            slot_labels[i].config(image=fruit_images[final_choice])
            slots.append(final_choice)
        
        # 결과 판정
        if slots[0] == slots[1] == slots[2]:
            result_label.config(text="🎉 승리! 과일 3개 일치!")
        else:
            result_label.config(text="😢 실패! 다시 도전하세요.")
    
    threading.Thread(target=spin).start()

# 버튼
spin_button = tk.Button(root, text="슬롯 돌리기", command=spin_slots)
spin_button.grid(row=2, column=0, columnspan=3, pady=10)

root.mainloop()
