# Mermaid 도형과 화살표 완전 가이드

## 1. 노드(Node) 도형 종류

### 기본 도형들

```mermaid
flowchart LR
    A["사각형<br>기본 형태"] 
    B("라운드 사각형<br>소괄호 ()")
    C(["알약 모양<br>대괄호+소괄호 []"])
    D[("실린더<br>데이터베이스")]
    E{{"육각형<br>중괄호 2개 {{}}"}}
    F{"마름모<br>의사결정"}
    G(("원형<br>이중 소괄호"))
    H((("이중 원형<br>트리플 소괄호")))
    I[/"사다리꼴 1<br>왼쪽 기울기"/]
    J[\ "사다리꼴 2<br>오른쪽 기울기"\]
    K[/"평행사변형 1"/]
    L[\ "평행사변형 2"\]
```

### 서브루틴 및 특수 도형

```mermaid
flowchart LR
    A[["서브루틴<br>이중 대괄호 [[]]"]]
    B>"플래그 1<br>왼쪽 화살표 >"]
    C<"플래그 2<br>오른쪽 화살표 <"]
    D[/"트래피조이드<br>기울기 /"\]
    E[\ "트래피조이드<br>기울기 \"/]
```

---

## 2. 화살표(Edge) 종류

### 기본 화살표

```mermaid
flowchart LR
    A["기본 화살표"] --> B["-->"]
    B --> C["단순 연결"]
    C ---> D["---> 긴 화살표"]
```

### 다양한 화살표 스타일

```mermaid
flowchart LR
    A["시작점"] 
    
    A --> B["1. 기본 화살표<br>A --> B"]
    A -.- B2["2. 점선<br>A -.- B"]
    A ==> C["3. 두꺼운 화살표<br>A ==> C"]
    A --- D["4. 실선(화살표 없음)<br>A --- D"]
    A -.-> E["5. 점선 화살표<br>A -.-> E"]
    A ==x F["6. 두꺼운 X 화살표<br>A ==x F"]
    A --o G["7. 원형 화살표<br>A --o G"]
    A --x H["8. X 화살표<br>A --x H"]
```

### 양방향 화살표

```mermaid
flowchart LR
    A["A"] <--> B["양방향<br><-->"]
    B <---> C["양방향(길게)<br><--->"]
    C <.-.-> D["양방향 점선<br><.-.->"]
    D <===> E["양방향 두꺼움<br><===>"]
```

---

## 3. 완전 종합 예제

### 예제 1: 시스템 아키텍처 (다양한 도형 활용)

```mermaid
flowchart TB
    User(("👤 사용자"))
    
    subgraph "프론트엔드"
        Web[/"🌐 웹 브라우저"/]
        Mobile["📱 모바일 앱"]
    end
    
    subgraph "백엔드"
        LB{{"️ 로드밸런서"}}
        API[["🔌 API 서버"]]
        Auth[["🔐 인증 서버"]]
    end
    
    subgraph "데이터"
        DB[("💾 메인 DB")]
        Cache[("⚡ 캐시 서버")]
        Storage[("📦 스토리지")]
    end
    
    User --> Web
    User --> Mobile
    Web --> LB
    Mobile --> LB
    LB --> API
    API --> Auth
    API --> Cache
    API --> DB
    DB -.-> Storage
    Cache --o API
```

### 예제 2: 의사결정 흐름도 (마름모 활용)

```mermaid
flowchart TD
    Start(("시작")) --> Q1{"로그인<br>했나요?"}
    
    Q1 -->|아니오 | Login[/"로그인<br>페이지"/]
    Q1 -->|예 | Q2{"권한이<br>있나요?"}
    
    Login --> End(("끝"))
    
    Q2 -->|아니오 | Deny{{"접근<br>거부"}}
    Q2 -->|예 | Q3{"데이터<br>유효한가?"}
    
    Deny --> End
    
    Q3 -->|아니오 | Error[/"에러<br>처리"/]
    Q3 -->|예 | Process[["데이터<br>처리"]]
    
    Error --> End
    Process --> Save[("DB<br>저장")]
    Save --> End
```

### 예제 3: 데이터 흐름도 (다양한 화살표)

```mermaid
flowchart LR
    Client[" 클라이언트"]
    
    subgraph "API Gateway"
        GW{{"🚪 게이트웨이"}}
        Auth["🔐 인증"]
        Rate["⚡ Rate Limiting"]
    end
    
    subgraph "Services"
        S1[["서비스 A"]]
        S2[["서비스 B"]]
        S3[["서비스 C"]]
    end
    
    subgraph "Data Layer"
        DB1[("DB 1")]
        DB2[("DB 2")]
        Cache[("Redis")]
    end
    
    Client ==> GW
    GW --x Auth
    GW -.-> Rate
    Rate ==> S1
    Rate ==> S2
    Rate ==> S3
    S1 <--> DB1
    S2 <--> DB2
    S1 -.-> Cache
    S2 -.-> Cache
    S3 -.-> Cache
```

---

## 4. 도형과 화살표 참조표

### 노드 도형 문법

| 도형 | 문법 | 예시 |
|------|------|------|
| 사각형 | `A["text"]` | `A["사각형"]` |
| 라운드 사각형 | `A("text")` | `B("라운드")` |
| 알약 모양 | `A["text"]` | `C["알약"]` |
| 마름모 | `A{"text"}` | `D{"의사결정"}` |
| 육각형 | `A{{"text"}}` | `E{{"육각형"}}` |
| 원형 | `A(("text"))` | `F(("원"))` |
| 이중 원 | `A((("text")))` | `G((("이중원")))` |
| 실린더 | `A[("text")]` | `H[("DB")]` |
| 서브루틴 | `A[["text"]]` | `I[["서브루틴"]]` |
| 사다리꼴 | `A[/"text"\]` | `J[/"사다리꼴"/]` |
| 플래그 | `A>"text"]` | `K>"플래그"]` |

### 화살표 문법

| 화살표 | 문법 | 설명 |
|--------|------|------|
| → | `-->` | 기본 화살표 |
| - | `---` | 실선 (화살표 없음) |
| ··· | `-.-` | 점선 (화살표 없음) |
| ⇢ | `-.->` | 점선 화살표 |
| ⇒ | `==>` | 두꺼운 화살표 |
| ⟷ | `<-->` | 양방향 화살표 |
| -o | `--o` | 원형 끝 |
| -x | `--x` | X 표시 끝 |

---

## 5. 실전 템플릿

### 템플릿 1: 클라우드 아키텍처

```mermaid
flowchart TB
    User(("👥 사용자"))
    
    CDN[/"🌍 CDN"/]
    LB{{"⚖️ 로드밸런서"}}
    
    subgraph "Application Tier"
        App1[["App Server 1"]]
        App2[["App Server 2"]]
        App3[["App Server 3"]]
    end
    
    subgraph "Data Tier"
        Master[("📊 Master DB")]
        Slave[(" Slave DB")]
        Cache[(" Redis")]
    end
    
    User ==> CDN
    CDN --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    App1 <--> Master
    App2 <--> Master
    App3 -.-> Slave
    App1 -.-> Cache
    App2 -.-> Cache
    App3 -.-> Cache
```

### 템플릿 2: 비즈니스 프로세스

```mermaid
flowchart TD
    Start(("시작")) --> Validate{"데이터<br>유효성<br>검사"}
    
    Validate -->|실패 | Error1[/"에러<br>로깅"/]
    Validate -->|성공 | Process{{"비즈니스<br>로직 처리"}}
    
    Error1 --> Notify1["관리자<br>알림"]
    
    Process --> Q1{"승인<br>필요?"}
    
    Q1 -->|예 | Approve[/"승인<br>대기"/]
    Q1 -->|아니오 | Save[("DB<br>저장")]
    
    Approve --> Q2{"승인<br>승락?"}
    Q2 -->|거부 | Reject["거부<br>처리"]
    Q2 -->|승락 | Save
    
    Save --> Notify2["완료<br>알림"]
    Notify2 --> End(("종료"))
    Reject --> End
    Notify1 --> End
```

이 가이드를 참고하여 Mermaid로 다양한 다이어그램을 만들어보세요! 🎨
