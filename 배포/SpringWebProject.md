# SpringWebProject AWS 배포

아래는 **“AWS에 웹 프로젝트 + DB를 가장 간단하게 배포하는 방법”**을 **복잡한 아키텍처 없이 최소한으로** 구성하는 기준으로 설명한 버전입니다.
(초보자/학습 프로젝트 기준, 운영환경 고급 설정은 제외)

---

# ✅ 가장 간단한 배포 구조

웹 서버 + DB를 다음과 같이 구성하면 가장 쉬움:

**EC2 (웹 서버 + WAS)**
**RDS (DB)**
→ 둘만 있으면 기본적인 운영이 가능.

---

# ✅ 단계별 가장 쉬운 배포 방법

## 1) EC2 인스턴스 생성 (웹 서버)

1. AWS Console → EC2 → **인스턴스 생성**

2. Amazon Linux 2023 또는 Ubuntu 선택

3. 인스턴스 유형 t2.micro (프리티어)

4. 키페어 생성/다운로드

5. 보안그룹 설정

   * HTTP: 80 (from anywhere)
   * HTTPS: 443 (선택)
   * SSH: 22 (본인 IP)

6. 인스턴스 시작

---

## 2) EC2에 웹 애플리케이션 배포

프레임워크별 예시:

### ✔ 스프링(Gradle/Maven) 프로젝트라면

1. 로컬에서 `./gradlew build` 또는 `mvn package`
2. `build/libs/*.jar` 파일 생성
3. SSH 접속 후 EC2에 업로드

   ```bash
   scp -i mykey.pem ./build/libs/myapp.jar ec2-user@<EC2-IP>:/home/ec2-user/
   ```
4. EC2에서 실행

   ```bash
   java -jar myapp.jar
   ```
5. (선택) 백그라운드 실행

   ```bash
   nohup java -jar myapp.jar > app.log 2>&1 &
   ```

### ✔ Node.js 프로젝트라면

```
git clone <repo>
npm install
npm run start
```

---

# 3) RDS 생성 (DB 서버)

1. AWS Console → RDS → 데이터베이스 생성
2. 엔진 선택: MySQL / PostgreSQL
3. 템플릿: 프리티어
4. DB 인스턴스 ID / 계정 / 비밀번호 입력
5. 퍼블릭 액세스 → **No (보안상 권장)**
6. VPC / 서브넷 자동 설정
7. 보안그룹 설정

   * EC2 인스턴스 보안그룹에서만 접속 허용
     → RDS 보안그룹 inbound: MySQL 3306 → EC2-SG

---

# 4) EC2에서 RDS 접속 확인

RDS 엔드포인트를 복사 후 EC2에서 접속 테스트

### MySQL

```bash
mysql -h <RDS-endpoint> -u admin -p
```

---

# 5) 웹 애플리케이션 설정에 RDS 연결 정보 입력

## 스프링 예시 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://<RDS-endpoint>:3306/mydb
    username: admin
    password: yourpassword
```

Node.js 예시

```js
const pool = mysql.createPool({
  host: '<RDS-endpoint>',
  user: 'admin',
  password: 'password',
  database: 'mydb'
});
```

---

# 6) 도메인 연결 (선택)

1. Route53에서 도메인 구매 또는 연결
2. EC2 Elastic IP 발급 후 고정
3. Route53 레코드 → A 레코드 → Elastic IP 연결

---

# 7) 보안 및 운영 최소 설정

* EC2 보안그룹: 80만 외부허용
* RDS 보안그룹: 오직 EC2만 허용
* 자동 백업: RDS 기본 7일 유지
* 로그: CloudWatch로 연결 가능

---

# 🎯 전체 구성 요약

가장 간단한 형태는 아래 두 개:

| 구성 요소   | 역할                          |
| ------- | --------------------------- |
| **EC2** | 웹 서버(WAS), 프론트엔드 정적 파일, API |
| **RDS** | DB(MySQL, PostgreSQL 등)     |

이 방식은 **초보자 또는 학습용**으로 가장 단순하며, 실제 많은 중소규모 서비스도 사용하는 전통적인 구성입니다.

---

# ❓ 더 간단한 대체 방법도 있을까?

## 🔹 가능: Elastic Beanstalk(Managed EC2)

* 자동 배포 / 자동 스케일링
* RDS도 옵션으로 같이 생성 가능
  → 하지만 내부적으로 EC2를 쓰므로 개념을 알고 있는 게 좋음.

## 🔹 정적 페이지(React 등)라면 더 쉬운 방법:

* S3 + CloudFront 조합이 최고로 쉽고 빠름
  (백엔드만 EC2/RDS 사용)

---

필요하면 **실제 예제 프로젝트 기준으로 단계별 배포 가이드**도 만들어 드릴게요!
