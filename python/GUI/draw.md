import tkinter as tk
import turtle

def draw_shape(shape):
    # turtle 초기화
    t.clear()
    t.penup()
    t.goto(0,0)
    t.pendown()

    if shape == "삼각형":
        sides = 3
    elif shape == "사각형":
        sides = 4
    elif shape == "오각형":
        sides = 5
    else:
        return

    for _ in range(sides):
        t.forward(100)
        t.left(360 / sides)

# Tkinter 윈도우 생성
root = tk.Tk()
root.title("도형 그리기 프로그램")

# turtle 캔버스 생성
canvas = turtle.ScrolledCanvas(root, width=400, height=400)
canvas.grid(row=0, column=0, columnspan=3)
t = turtle.RawTurtle(canvas)
t.speed(3)

# 버튼 생성
btn_triangle = tk.Button(root, text="삼각형", command=lambda: draw_shape("삼각형"))
btn_triangle.grid(row=1, column=0, padx=10, pady=10)

btn_square = tk.Button(root, text="사각형", command=lambda: draw_shape("사각형"))
btn_square.grid(row=1, column=1, padx=10, pady=10)

btn_pentagon = tk.Button(root, text="오각형", command=lambda: draw_shape("오각형"))
btn_pentagon.grid(row=1, column=2, padx=10, pady=10)

root.mainloop()
