import tkinter as tk
import random
import time
import threading

# 로또 번호 생성 함수
def generate_lotto_numbers():
    numbers = list(range(1, 46))  # 1~45까지 리스트
    random.shuffle(numbers)       # 리스트 섞기
    return sorted(numbers[:6])    # 앞에서 6개 뽑아 정렬

# 추첨 실행 함수
def run_lotto():
    try:
        money = int(entry.get())
    except ValueError:
        result_label.config(text="숫자를 입력하세요!")
        return
    
    count = money // 1000  # 1000원당 1게임
    if count <= 0:
        result_label.config(text="최소 1000원 이상 입력하세요!")
        return
    
    result_label.config(text="추첨 시작...")
    
    # 쓰레드로 실행 (GUI 멈춤 방지)
    def draw():
        all_results = []
        for i in range(count):
            lotto = generate_lotto_numbers()
            all_results.append(lotto)
            
            # 번호를 하나씩 출력
            display = []
            for num in lotto:
                display.append(num)
                result_label.config(text=f"{i+1}번째 게임: {display}")
                time.sleep(0.5)  # 0.5초 간격으로 출력
            
            time.sleep(1)  # 게임 간격
    
        result_label.config(text=f"총 {count}게임 완료!\n{all_results}")
    
    threading.Thread(target=draw).start()

# GUI 구성
root = tk.Tk()
root.title("로또 추첨 프로그램")

tk.Label(root, text="구입 금액 입력 (1000원 단위):").pack(pady=5)
entry = tk.Entry(root)
entry.pack(pady=5)

tk.Button(root, text="추첨하기", command=run_lotto).pack(pady=10)

result_label = tk.Label(root, text="")
result_label.pack(pady=10)

root.mainloop()
