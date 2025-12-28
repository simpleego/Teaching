# static 클래스/메서드/멤버
- Static Member
- Static Method
- Static Class
 
> 일반적인 클래스는 객체를 생성해야만 사용하는데 객체를 생성하지 않고도
> 사용할 수 있도록 지원하며 주로 클래스의 공통멤버, 공통기능 등을 지원하고자 이용된다.

# 🟦 1. static 멤버란?

static 멤버는 **클래스에 속하는 멤버**야.  
즉, 객체가 아니라 **클래스 자체가 공유하는 변수와 메서드**를 말해.

### ✔ static 멤버 종류
- **static 변수(정적 변수)**  
- **static 메서드(정적 메서드)**

---

# 🟦 2. static 변수(정적 변수)의 특징

### ✔ (1) 모든 객체가 **하나의 값을 공유**
객체마다 따로 존재하는 것이 아니라  
**클래스 로딩 시 단 한 번만 생성**됨.

### ✔ (2) 객체 없이도 사용 가능
```java
ClassName.variableName
```

### ✔ (3) 공통 데이터 저장에 적합
예: 전체 객체 수, 공용 설정값 등

---

# 🟦 3. static 메서드의 특징

### ✔ (1) 객체 없이 호출 가능
```java
ClassName.methodName()
```

### ✔ (2) static 변수만 접근 가능  
객체의 인스턴스 변수는 사용할 수 없음.

### ✔ (3) 공통 기능(유틸리티 기능)에 적합  
예: Math.random(), Integer.parseInt()

---

# 🚀 4. static 멤버를 잘 보여주는 예제  
## 🎯 예제: **학생(Student) 객체가 생성될 때마다 전체 학생 수를 세는 프로그램**

### 🔹 Student 클래스

```java
class Student {

    private String name;

    // static 변수: 모든 Student 객체가 공유
    private static int count = 0;

    public Student(String name) {
        this.name = name;
        count++;  // 객체가 생성될 때마다 증가
    }

    public String getName() {
        return name;
    }

    // static 메서드: 객체 없이 호출 가능
    public static int getCount() {
        return count;
    }
}
```

---

### 🔹 테스트 코드

```java
public class StudentTest {
    public static void main(String[] args) {
        Student s1 = new Student("철수");
        Student s2 = new Student("영희");
        Student s3 = new Student("민수");

        System.out.println("총 학생 수: " + Student.getCount());
    }
}
```

---

### ✔ 출력 결과

```
총 학생 수: 3
```

---

# 🎯 5. 이 예제가 static 멤버를 잘 보여주는 이유

| 기능 | static 사용 이유 |
|------|------------------|
| 학생 수 count | 모든 객체가 공유해야 하는 값 |
| getCount() | 객체 없이 전체 학생 수를 알고 싶기 때문 |

---

# 🟦 6. static 멤버를 언제 사용하면 좋을까?

### ✔ (1) 모든 객체가 공유해야 하는 값이 있을 때  
- 전체 객체 수  
- 공용 설정값  
- 게임 점수(전역 점수)

### ✔ (2) 객체와 무관한 기능을 만들 때  
- 단위 변환기  
- 수학 계산기  
- 문자열 유틸리티

### ✔ (3) 싱글톤 패턴 구현 시  
- static 변수로 단 하나의 객체를 저장  
- static 메서드로 객체 반환

---

# 🟦 7. static 멤버 사용 시 주의점

### ❗ (1) 남용하면 객체지향성이 약해짐  
모든 걸 static으로 만들면 “전역 변수”처럼 되어버림.

### ❗ (2) 인스턴스 변수에 접근 불가  
static 메서드 안에서는 this 사용 불가.

### ❗ (3) 멀티스레드 환경에서는 동기화 필요  
공유 자원이기 때문에 충돌 가능.

---

# 🎉 핵심 요약

- **static 변수**: 모든 객체가 공유하는 변수  
- **static 메서드**: 객체 없이 호출하는 공통 기능  
- **클래스 로딩 시 단 한 번 생성**  
- 공통 데이터, 유틸리티 기능, 싱글톤 등에 적합

---

# 🟦 1. **static 메서드의 역할**

static 메서드는 **객체를 만들지 않고도 호출할 수 있는 메서드**야.  
즉, **클래스 자체에 속하는 기능**을 만들 때 사용해.

### ✔ static 메서드가 필요한 상황
- 객체마다 다른 값이 필요하지 않을 때  
- 공통 기능(유틸리티 기능)을 제공할 때  
- 계산기, 변환기, 수학 함수처럼 “상태가 필요 없는 기능”을 만들 때

---

# 🚀 2. static 메서드의 역할을 잘 보여주는 예제  
## 🎯 예제: **단위 변환기(UnitConverter)**

단위 변환은 객체를 만들 필요가 없어.  
그냥 “기능”만 있으면 되기 때문에 static 메서드가 딱 맞아.

```java
class UnitConverter {

    // cm → m 변환
    public static double cmToMeter(double cm) {
        return cm / 100.0;
    }

    // kg → g 변환
    public static double kgToGram(double kg) {
        return kg * 1000;
    }

    // 화씨 → 섭씨 변환
    public static double fahrenheitToCelsius(double f) {
        return (f - 32) * 5 / 9.0;
    }
}
```

---

## 🔹 사용 예시

```java
public class Test {
    public static void main(String[] args) {
        System.out.println(UnitConverter.cmToMeter(180));      // 1.8
        System.out.println(UnitConverter.kgToGram(70));        // 70000
        System.out.println(UnitConverter.fahrenheitToCelsius(98.6)); // 37
    }
}
```

### ✔ 특징
- 객체 생성 없이 바로 호출  
- 상태가 필요 없는 기능  
- 공통 기능을 모아두기 좋음  
- Math 클래스와 같은 구조

---

# 🟦 3. static 클래스(정적 클래스)란?

자바에서 “static 클래스”라고 하면 **두 가지 의미**가 있어.  
학생들이 가장 많이 헷갈리는 부분이라 정확히 정리해줄게.

---

# ✔ (1) **자바는 최상위 클래스에 static을 붙일 수 없다**

❌ 아래 코드는 불가능

```java
static class MyClass { }  // 오류
```

---

# ✔ (2) **static 클래스는 ‘static 중첩 클래스(static nested class)’를 의미한다**

즉, **클래스 안에 있는 클래스(inner class)** 중  
`static`을 붙일 수 있는 형태를 말해.

```java
class Outer {
    static class Inner {
        void hello() {
            System.out.println("정적 중첩 클래스입니다.");
        }
    }
}
```

---

# 🟦 4. static 중첩 클래스의 특징

| 특징 | 설명 |
|------|------|
| **외부 클래스의 인스턴스 없이 사용 가능** | `new Outer.Inner()` 가능 |
| **외부 클래스의 인스턴스 변수에 접근 불가** | static이므로 |
| **유틸리티 클래스 그룹화에 좋음** | 관련 기능을 묶을 때 사용 |

---

# 🚀 5. static 클래스(정적 중첩 클래스) 예제

## 🎯 예제: 자동차(Car) 안에 엔진(Engine) 정의

```java
class Car {

    private String model;

    public Car(String model) {
        this.model = model;
    }

    // 정적 중첩 클래스
    static class Engine {
        public void start() {
            System.out.println("엔진이 시동을 겁니다.");
        }
    }
}
```

---

## 🔹 사용 예시

```java
public class Test2 {
    public static void main(String[] args) {
        Car.Engine engine = new Car.Engine();  // Car 객체 없이 생성 가능
        engine.start();
    }
}
```

### ✔ 왜 static을 붙일까?
- Engine은 Car의 내부 구조이지만  
  **Car 객체가 없어도 독립적으로 동작할 수 있기 때문**

---

# 🎯 6. static 메서드 vs static 클래스 요약

| 구분 | static 메서드 | static 클래스(중첩 클래스) |
|------|---------------|-----------------------------|
| 의미 | 객체 없이 호출 가능한 메서드 | 외부 클래스의 인스턴스 없이 사용 가능한 내부 클래스 |
| 목적 | 공통 기능 제공 | 관련 클래스를 논리적으로 묶기 |
| 사용 예 | Math.random(), Integer.parseInt() | Map.Entry, Car.Engine |
| 객체 필요 여부 | 필요 없음 | 외부 클래스 객체 필요 없음 |

---

# 🎉 핵심 정리

- **static 메서드**는 “객체 없이 사용하는 기능”을 만들 때 사용  
- **static 클래스(정적 중첩 클래스)**는 “외부 클래스와 관련된 보조 클래스”를 만들 때 사용  
- 둘 다 “객체 없이 사용 가능”하다는 공통점이 있음  
- 하지만 목적은 다름  
  - static 메서드 → 기능  
  - static 클래스 → 구조

---
