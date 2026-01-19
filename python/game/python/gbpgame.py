import tkinter as tk
import random

# GUI 구성 먼저
root = tk.Tk()
root.title("가위·바위·보 게임")

# 이미지 불러오기 (root 생성 이후에 해야 함)
rock_img = tk.PhotoImage(file="rock.png")
paper_img = tk.PhotoImage(file="paper.png")
scissors_img = tk.PhotoImage(file="scissors.png")

choices = {
    "rock": rock_img,
    "paper": paper_img,
    "scissors": scissors_img
}

# 플레이어 선택 저장
player1_choice = None
player2_choice = None

# 승부 판정 함수
def judge(p1, p2):
    if p1 == p2:
        return "무승부!"
    elif (p1 == "rock" and p2 == "scissors") or \
         (p1 == "scissors" and p2 == "paper") or \
         (p1 == "paper" and p2 == "rock"):
        return "플레이어 1 승리!"
    else:
        return "플레이어 2 승리!"

# 플레이어 선택 함수
def select_choice(player, choice):
    global player1_choice, player2_choice
    if player == 1:
        player1_choice = choice
        p1_label.config(image=choices[choice])
    else:
        player2_choice = choice
        p2_label.config(image=choices[choice])
    
    # 두 명 다 선택했을 때 결과 출력
    if player1_choice and player2_choice:
        result = judge(player1_choice, player2_choice)
        result_label.config(text=result)

# 플레이어 1
tk.Label(root, text="플레이어 1").grid(row=0, column=0)
p1_label = tk.Label(root)
p1_label.grid(row=1, column=0)

tk.Button(root, text="가위", command=lambda: select_choice(1, "scissors")).grid(row=2, column=0)
tk.Button(root, text="바위", command=lambda: select_choice(1, "rock")).grid(row=3, column=0)
tk.Button(root, text="보", command=lambda: select_choice(1, "paper")).grid(row=4, column=0)

# 플레이어 2
tk.Label(root, text="플레이어 2").grid(row=0, column=2)
p2_label = tk.Label(root)
p2_label.grid(row=1, column=2)

tk.Button(root, text="가위", command=lambda: select_choice(2, "scissors")).grid(row=2, column=2)
tk.Button(root, text="바위", command=lambda: select_choice(2, "rock")).grid(row=3, column=2)
tk.Button(root, text="보", command=lambda: select_choice(2, "paper")).grid(row=4, column=2)

# 결과 출력
result_label = tk.Label(root, text="", font=("Arial", 14))
result_label.grid(row=5, column=0, columnspan=3)

root.mainloop()