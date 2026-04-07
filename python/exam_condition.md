요구사항을 정확히 반영해서 구성했습니다.

* **if / while / for 각각 10문제 (총 30문제)**
* **리스트, 딕셔너리 활용 포함**
* **난이도: 기초 / 중급 / 고급 혼합 구성**
* **정답은 마지막에 일괄 제공**

---

# ✅ 1. if 조건문 문제 (10문제)

### 🟢 기초

1. 정수를 입력받아 짝수인지 홀수인지 출력하시오.
2. 리스트 `[10, 20, 30]`의 첫 번째 값이 10이면 `"정상"` 출력.
3. 점수(score)를 입력받아 60 이상이면 `"합격"` 아니면 `"불합격"` 출력.

### 🟡 중급

4. 딕셔너리 `{"name":"Tom", "age":17}`에서 나이가 20 이상이면 `"성인"` 출력.
5. 리스트 `[5, 15, 25]`에서 첫 번째 값이 10보다 작으면 `"작다"` 출력.
6. 문자열이 `"admin"`이면 `"관리자입니다"` 출력.

### 🔴 고급

7. 딕셔너리에서 key `"salary"`가 존재하면 값 출력, 없으면 `"없음"` 출력.
8. 리스트 `[3, 6, 9]`에서 모든 값이 3의 배수이면 `"통과"` 출력.
9. 두 숫자를 입력받아 둘 다 양수이면 `"둘 다 양수"` 출력.
10. 리스트에서 최대값이 100 이상이면 `"큰 값 존재"` 출력.

---

# ✅ 2. while 반복문 문제 (10문제)

### 🟢 기초

11. 1부터 10까지 출력하시오.
12. 1부터 10까지의 합을 구하시오.
13. 리스트 `[1,2,3,4]`를 while문으로 출력하시오.

### 🟡 중급

14. 리스트에서 짝수만 출력하시오.
15. 리스트 `[10,20,30]`의 모든 요소 합 구하기
16. 딕셔너리 `{"a":1, "b":2}`의 value만 출력하기

### 🔴 고급

17. 리스트에서 20보다 큰 값이 나오면 반복 종료
18. 사용자 입력을 받아 `"exit"` 입력 시 종료
19. 리스트 `[3,6,9,12]`에서 3의 배수 개수 세기
20. 딕셔너리 값의 합이 50 이상이면 반복 중단

---

# ✅ 3. for 반복문 문제 (10문제)

### 🟢 기초

21. 리스트 `[1,2,3,4,5]` 출력
22. 리스트의 합 구하기
23. 리스트에서 짝수만 출력

### 🟡 중급

24. 리스트 `[10,20,30]`에서 각 값에 2를 곱한 리스트 생성
25. 딕셔너리의 key만 출력
26. 문자열 `"python"`에서 모음 개수 세기

### 🔴 고급

27. 리스트에서 최대값 찾기
28. 딕셔너리에서 value가 10 이상인 key만 출력
29. 리스트 `[1,2,3,4]`를 뒤집어서 출력
30. 리스트에서 중복 제거 후 출력

---

# ✅ ✅ 정답 (모든 문제)

```python
# -------------------
# 1. if
# -------------------
# 1
num = int(input())
if num % 2 == 0:
    print("짝수")
else:
    print("홀수")

# 2
lst = [10,20,30]
if lst[0] == 10:
    print("정상")

# 3
score = int(input())
if score >= 60:
    print("합격")
else:
    print("불합격")

# 4
d = {"name":"Tom", "age":17}
if d["age"] >= 20:
    print("성인")

# 5
lst = [5,15,25]
if lst[0] < 10:
    print("작다")

# 6
user = "admin"
if user == "admin":
    print("관리자입니다")

# 7
d = {"name":"Tom"}
if "salary" in d:
    print(d["salary"])
else:
    print("없음")

# 8
lst = [3,6,9]
if all(x % 3 == 0 for x in lst):
    print("통과")

# 9
a, b = 3, 5
if a > 0 and b > 0:
    print("둘 다 양수")

# 10
lst = [10,50,120]
if max(lst) >= 100:
    print("큰 값 존재")

# -------------------
# 2. while
# -------------------
# 11
i = 1
while i <= 10:
    print(i)
    i += 1

# 12
i = 1
s = 0
while i <= 10:
    s += i
    i += 1
print(s)

# 13
lst = [1,2,3,4]
i = 0
while i < len(lst):
    print(lst[i])
    i += 1

# 14
lst = [1,2,3,4]
i = 0
while i < len(lst):
    if lst[i] % 2 == 0:
        print(lst[i])
    i += 1

# 15
lst = [10,20,30]
i = 0
s = 0
while i < len(lst):
    s += lst[i]
    i += 1
print(s)

# 16
d = {"a":1, "b":2}
keys = list(d.keys())
i = 0
while i < len(keys):
    print(d[keys[i]])
    i += 1

# 17
lst = [10,20,30,40]
i = 0
while i < len(lst):
    if lst[i] > 20:
        break
    print(lst[i])
    i += 1

# 18
while True:
    text = input()
    if text == "exit":
        break

# 19
lst = [3,6,9,12]
i = 0
cnt = 0
while i < len(lst):
    if lst[i] % 3 == 0:
        cnt += 1
    i += 1
print(cnt)

# 20
d = {"a":10, "b":20, "c":30}
keys = list(d.keys())
i = 0
s = 0
while i < len(keys):
    s += d[keys[i]]
    if s >= 50:
        break
    i += 1
print(s)

# -------------------
# 3. for
# -------------------
# 21
lst = [1,2,3,4,5]
for x in lst:
    print(x)

# 22
lst = [1,2,3,4,5]
print(sum(lst))

# 23
for x in [1,2,3,4]:
    if x % 2 == 0:
        print(x)

# 24
lst = [10,20,30]
new_lst = []
for x in lst:
    new_lst.append(x*2)
print(new_lst)

# 25
d = {"a":1, "b":2}
for k in d:
    print(k)

# 26
s = "python"
cnt = 0
for c in s:
    if c in "aeiou":
        cnt += 1
print(cnt)

# 27
lst = [10,30,20]
max_val = lst[0]
for x in lst:
    if x > max_val:
        max_val = x
print(max_val)

# 28
d = {"a":5, "b":15, "c":20}
for k, v in d.items():
    if v >= 10:
        print(k)

# 29
lst = [1,2,3,4]
for x in reversed(lst):
    print(x)

# 30
lst = [1,2,2,3,3,4]
result = []
for x in lst:
    if x not in result:
        result.append(x)
print(result)
```

---

필요하면 다음 단계로
👉 **“시험용 (객관식 + 서술형)”**
👉 **“학생 과제용 PDF / 카페 업로드용 포맷”**
👉 **“자동 채점 코드 (테스트케이스 포함)”**

까지 확장해서 만들어 줄 수 있습니다.
