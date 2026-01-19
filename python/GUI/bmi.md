import tkinter as tk
from tkinter import messagebox

def calculate_bmi():
    try:
        height = float(entry_height.get()) / 100  # cm → m 변환
        weight = float(entry_weight.get())
        bmi = weight / (height ** 2)

        # BMI 평가
        if bmi < 18.5:
            result = "저체중"
        elif 18.5 <= bmi < 23:
            result = "정상"
        elif 23 <= bmi < 25:
            result = "과체중"
        else:
            result = "비만"

        label_result.config(text=f"BMI: {bmi:.2f} ({result})")
    except ValueError:
        messagebox.showerror("입력 오류", "숫자를 올바르게 입력하세요.")

# Tkinter 윈도우 생성
root = tk.Tk()
root.title("BMI 계산기")

# 키 입력
label_height = tk.Label(root, text="키 (cm):")
label_height.grid(row=0, column=0, padx=10, pady=10)
entry_height = tk.Entry(root)
entry_height.grid(row=0, column=1, padx=10, pady=10)

# 몸무게 입력
label_weight = tk.Label(root, text="몸무게 (kg):")
label_weight.grid(row=1, column=0, padx=10, pady=10)
entry_weight = tk.Entry(root)
entry_weight.grid(row=1, column=1, padx=10, pady=10)

# 버튼
btn_calculate = tk.Button(root, text="BMI 계산", command=calculate_bmi)
btn_calculate.grid(row=2, column=0, columnspan=2, pady=10)

# 결과 출력
label_result = tk.Label(root, text="결과가 여기에 표시됩니다.")
label_result.grid(row=3, column=0, columnspan=2, pady=10)

root.mainloop()
