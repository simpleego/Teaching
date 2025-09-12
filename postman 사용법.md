# PostMan 
> Postman의 기능
> **API 테스트의 기본부터 실제 스프링부트 API 연동까지** 

---

## 🕒 **2시간 수업 구성안: "Postman으로 배우는 스프링부트 API 테스트"**

### 🔹 **[0:00 ~ 0:15] 오리엔테이션 및 개요**
- Postman이란 무엇인가?  
- REST API와의 관계  
- 스프링부트와 Postman의 연동 목적  
- 실습 환경 소개 (IDE, Postman 설치, 프로젝트 구조)

---

### 🔹 **[0:15 ~ 0:45] 스프링부트 기본 API 만들기**
- `Spring Initializr`로 프로젝트 생성  
- `@RestController`와 `@GetMapping`, `@PostMapping` 기본 예제  
- 간단한 DTO와 Service 계층 구성  
- 예: `/hello`, `/user`, `/product` 등 샘플 API

```java
@RestController
@RequestMapping("/api")
public class HelloController {
    @GetMapping("/hello")
    public String sayHello() {
        return "Hello from Spring Boot!";
    }
}
```

---

### 🔹 **[0:45 ~ 1:15] Postman 기본 기능 실습**
- GET, POST, PUT, DELETE 요청 보내기  
- Path Variable, Query Parameter, Body 설정 방법  
- Header 설정 및 Content-Type 이해  
- 예제: 사용자 등록, 조회, 수정, 삭제 API 테스트

📌 실습 예시:
- `POST /api/user` → JSON Body로 사용자 등록  
- `GET /api/user?id=1` → Query Param으로 조회  
- `PUT /api/user/1` → Path Variable로 수정  
- `DELETE /api/user/1` → 삭제 요청

---

### 🔹 **[1:15 ~ 1:45] 고급 기능 및 자동화**
- Postman Collection 만들기  
- 환경 변수 설정 (baseUrl 등)  
- 테스트 스크립트 작성 (`pm.test`)  
- Pre-request Script 활용  
- 예: 로그인 후 토큰 저장 → 이후 요청에 자동 삽입

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

---

### 🔹 **[1:45 ~ 2:00] 마무리 및 Q&A**
- Postman을 활용한 API 테스트 자동화 전략  
- 실무에서의 활용 사례 (CI/CD 연동, QA 자동화 등)  
- 수업 요약 및 질의응답  
- 다음 단계 제안: Swagger 연동, Mock Server, Newman CLI 등

---

## 📚 준비물 및 사전 요구사항
- Java & SpringBoot 기본 지식  
- Postman 설치 (무료 버전으로 충분)  
- IDE (IntelliJ 또는 VS Code)  
- JDK 17 이상 권장

---


좋습니다, 박종천 님!  
Postman과 [JSONPlaceholder](https://jsonplaceholder.typicode.com/)를 활용해 **user 서비스 API를 테스트하는 방법**을 단계별로 정리해드릴게요. JSONPlaceholder는 실제 서버 없이도 API 테스트를 할 수 있는 **무료 Mock API 서비스**입니다.

---

## 🧰 1. 준비 단계

### ✅ Postman 설치
- [Postman 공식 사이트](https://www.postman.com/downloads/)에서 운영체제에 맞는 버전 다운로드
- 설치 후 실행

### ✅ JSONPlaceholder 소개
- URL: `https://jsonplaceholder.typicode.com`
- 주요 엔드포인트:
  - `/users` – 사용자 목록
  - `/users/{id}` – 특정 사용자 조회
  - `/posts`, `/comments`, `/todos` 등도 제공

---

## 🔍 2. GET 요청: 사용자 목록 조회

### 📌 요청 정보
- **Method**: `GET`  
- **URL**: `https://jsonplaceholder.typicode.com/users`

### 📦 응답 예시
```json
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    ...
  },
  ...
]
```

### 🛠 Postman 사용법
1. Postman 실행 후 `+ New Request`
2. Method를 `GET`으로 설정
3. URL 입력 후 `Send` 클릭
4. 하단 `Response` 영역에서 JSON 결과 확인

---

## 📝 3. POST 요청: 사용자 등록 (실제 저장은 안됨)

### 📌 요청 정보
- **Method**: `POST`  
- **URL**: `https://jsonplaceholder.typicode.com/users`  
- **Body**: `raw` → `JSON` 선택

```json
{
  "name": "박종천",
  "username": "jongcheon",
  "email": "jongcheon@example.com"
}
```

### 📦 응답 예시
```json
{
  "id": 11,
  "name": "박종천",
  "username": "jongcheon",
  "email": "jongcheon@example.com"
}
```

> ⚠️ JSONPlaceholder는 실제로 데이터를 저장하지 않으며, 응답만 시뮬레이션합니다.

---

## ✏️ 4. PUT / PATCH 요청: 사용자 정보 수정

### ✅ PUT (전체 덮어쓰기)
- URL: `https://jsonplaceholder.typicode.com/users/1`
- Body:
```json
{
  "name": "박종천 수정",
  "username": "jongcheon_updated",
  "email": "jongcheon_updated@example.com"
}
```

### ✅ PATCH (일부 수정)
- URL: 동일
- Body:
```json
{
  "email": "newemail@example.com"
}
```

---

## 🗑️ 5. DELETE 요청: 사용자 삭제

- URL: `https://jsonplaceholder.typicode.com/users/1`
- Method: `DELETE`
- 응답: `200 OK` (실제 삭제는 되지 않음)

---

## 🧪 6. Postman 팁

| 기능 | 설명 |
|------|------|
| **Params 탭** | 쿼리 파라미터 입력 (`?id=1`) |
| **Headers 탭** | `Content-Type: application/json` 설정 |
| **Tests 탭** | 응답 검증 스크립트 작성 (`pm.response.to.have.status(200);`) |
| **Collections** | 요청들을 그룹화하여 저장 및 재사용 가능 |
| **Mock Server** | 실제 서버 없이 API 시뮬레이션 가능 |

---

이렇게 하면 Postman과 JSONPlaceholder를 활용해 **API 설계, 테스트, 디버깅**까지 손쉽게 실습할 수 있어요.  
혹시 이걸 기반으로 실습 과제나 수업 자료로 구성해드릴까요? 아니면 실제 DB 연동 API와 비교하는 예제도 만들어볼까요?

이 커리큘럼은 **초중급 개발자**를 대상으로 하며, 실습을 통해 Postman의 핵심 기능을 직접 체험하고 스프링부트 API 테스트에 자신감을 갖게 하는 데 초점을 맞췄어요. 필요하다면 **수업 자료용 PPT나 실습 코드 샘플**도 함께 구성해드릴 수 있어요. 원하시나요?
