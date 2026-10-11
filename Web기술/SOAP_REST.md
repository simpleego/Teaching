단순히 **XML vs JSON의 차이만 있는 것은 아닙니다.**  
SOAP와 REST의 핵심 차이는 **“데이터 형식”보다 “통신 방식과 설계 철학”**에 있습니다.

쉽게 말하면:

> **SOAP = 정해진 규칙과 계약을 엄격하게 따르는 메시지 통신 프로토콜**  
> **REST = HTTP의 기능을 그대로 활용하는 자원(Resource) 중심의 설계 방식**

| 구분 | SOAP | REST |
|---|---|---|
| 성격 | **프로토콜(Protocol)** | **아키텍처 스타일** |
| 데이터 형식 | 거의 항상 **XML** | 주로 **JSON**, XML도 가능 |
| 통신 방식 | SOAP Envelope라는 정해진 메시지 구조 | HTTP 요청/응답 구조를 그대로 활용 |
| URL 의미 | 서비스/기능 호출 중심 | **자원(Resource)** 중심 |
| 동작 표현 | XML 내부에 수행할 작업을 기술 | **GET, POST, PUT, PATCH, DELETE** 활용 |
| 인터페이스 정의 | 주로 **WSDL** 사용 | OpenAPI/Swagger 등을 많이 사용하지만 필수는 아님 |
| 규칙 | 엄격함 | 비교적 단순하고 유연함 |
| 메시지 크기 | XML 때문에 상대적으로 큼 | JSON 사용 시 상대적으로 작음 |
| 보안/트랜잭션 | WS-Security, WS-AtomicTransaction 등 강력한 표준 존재 | HTTPS, JWT, OAuth2 등을 조합 |
| 사용 분야 | 금융, 공공, 기업 시스템, 레거시 시스템 | 웹, 모바일, MSA, FastAPI 등 현대 웹 API |

예를 들어 **회원번호 100번 회원 조회**를 생각하면 차이가 더 명확합니다.

REST에서는 보통 이렇게 합니다.

```http
GET /users/100
```

서버 응답:

```json
{
  "id": 100,
  "name": "홍길동",
  "email": "hong@test.com"
}
```

여기서 이미 `GET`이라는 HTTP 메서드가 **“조회한다”**는 의미를 가지고 있고,

```text
/users/100
```

은 **“100번 사용자라는 자원”**을 의미합니다.

즉 구조가 매우 직관적입니다.

```text
GET    /users/100       조회
POST   /users           등록
PUT    /users/100       전체 수정
PATCH  /users/100       일부 수정
DELETE /users/100       삭제
```

반면 SOAP는 조금 다릅니다. URL 자체보다 **SOAP 메시지 안에 어떤 작업을 요청하는지가 중요**합니다.

```http
POST /UserService
Content-Type: text/xml
```

```xml
<soap:Envelope>
    <soap:Body>
        <GetUser>
            <UserId>100</UserId>
        </GetUser>
    </soap:Body>
</soap:Envelope>
```

여기서는 XML 안에

```xml
<GetUser>
```

가 들어가 있으므로 **“사용자 조회 기능을 실행하라”**는 의미가 됩니다.

따라서 둘의 사고방식은 다음처럼 다릅니다.

```text
SOAP

Client
  │
  │ "GetUser라는 기능을 실행해 주세요"
  │ SOAP XML Message
  ▼
UserService
  │
  ▼
GetUser()
  │
  ▼
XML Response
```

반면 REST는:

```text
REST

Client
  │
  │ GET /users/100
  │
  ▼
Resource
/users/100
  │
  ▼
HTTP GET
  │
  ▼
JSON Response
```

가장 중요한 차이를 한 문장으로 정리하면:

> **SOAP는 "어떤 기능을 실행할 것인가" 중심이고, REST는 "어떤 자원을 어떻게 처리할 것인가" 중심입니다.**

학생들에게는 다음 비유가 꽤 이해하기 쉽습니다.

**SOAP는 은행 창구 업무**와 비슷합니다.

```text
"계좌 조회 업무를 요청합니다."

요청서 작성
↓
정해진 양식
↓
정해진 절차
↓
처리
↓
정해진 형식으로 결과 반환
```

양식과 규칙이 엄격합니다.

반면 REST는 **웹에서 주소로 물건을 찾아가는 방식**과 비슷합니다.

```text
/users/100

GET       → 보여주세요
POST      → 새로 만들어 주세요
PUT       → 바꿔 주세요
DELETE    → 삭제해 주세요
```

그래서 REST를 이해할 때 중요한 것은 JSON보다 오히려 이 구조입니다.

```text
REST = Resource + URI + HTTP Method + Representation
```

예를 들어:

```text
Resource        회원
URI             /users/100
HTTP Method     GET
Representation  JSON
```

즉 JSON은 REST의 본질이 아니라 **자원을 표현하는 형식(Representation)** 중 하나입니다.

REST에서도 XML을 사용할 수 있습니다.

```http
GET /users/100
Accept: application/xml
```

응답:

```xml
<user>
    <id>100</id>
    <name>홍길동</name>
</user>
```

이것도 여전히 REST 방식입니다.

반대로 다음처럼 기억하면 정확합니다.

```text
SOAP → XML이 거의 필수

REST → JSON 필수 아님
       JSON을 가장 많이 사용할 뿐
```

강의에서는 아래 4가지만 강조해도 충분합니다.

> **SOAP = 프로토콜 + XML + 엄격한 계약 + 기능 호출 중심**  
> **REST = 설계방식 + Resource + HTTP Method + 보통 JSON**

특히 **FastAPI를 배우는 과정에서는 REST의 핵심을 `JSON`이라고 가르치기보다 `URL(Resource) + HTTP Method`라고 설명하는 것이 훨씬 정확합니다.**
