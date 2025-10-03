# Spring(Spring Boot) 앱을 **AWS Elastic Beanstalk(EB) 배포
> Spring(Spring Boot) 앱을 **AWS Elastic Beanstalk(EB)**에 올리면 인프라(EC2, LB, Auto Scaling 등)를 걱정하지 않고 앱 코드만 배포할 수 있어 초보자에게도 매우 편리합니다.
---

# 요약(한 문장)

Spring Boot 앱은 실행 가능한 **JAR**(또는 WAR)로 빌드해서 Elastic Beanstalk에 올리면 되며, 운영 DB는 Elastic Beanstalk 환경과 **분리(Decouple)**된 RDS(또는 Aurora)로 운영하는 것이 안전합니다. ([AWS 문서][1])

---

# 전제(준비물)

1. AWS 계정(사용자 IAM) — 프로그램 접근용 액세스키/리전 설정.
2. 개발 PC: Java JDK(예: 17), 빌드툴(Maven 또는 Gradle).
3. (권장) AWS CLI 설치 및 `aws configure`로 credentials 설정.
4. (편리) EB CLI 설치(선택) — `pip install awsebcli` 또는 설치 스크립트 사용. EB CLI로 배포하면 편리합니다. ([AWS 문서][2])

---

# 전체 흐름(요약)

1. Spring Boot 앱을 EB에 맞게 준비(포트 설정 등).
2. 빌드 → 실행 가능한 JAR 생성.
3. EB에 배포(콘솔 업로드 또는 EB CLI 사용).
4. DB는 별도 RDS 생성 → 보안그룹 열기 → EB 환경에 DB 정보(환경변수) 등록.
5. 모니터링·로그 확인, 보안(Secrets Manager) 적용.

아래에 단계별 상세 설명(또는 GUI 순서, 명령어 포함)을 드립니다.

---

# 상세 단계 — 코드/명령어로 따라하기

## 1) Spring Boot 애플리케이션 준비

* **포트**: Elastic Beanstalk의 프록시(Nginx)는 기본적으로 애플리케이션으로 트래픽을 포워딩할 때 **포트 5000**으로 연결합니다. 따라서 Spring Boot가 5000으로 들으도록 하거나(또는 EB 환경변수에 맞추세요). ([AWS 문서][3])

  `src/main/resources/application.properties` 예:

  ```properties
  # 기본: EB에서 SERVER_PORT 환경변수를 주면 사용, 없으면 5000 사용
  server.port=${SERVER_PORT:5000}

  # DB (환경변수로 주면 됩니다)
  spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&serverTimezone=UTC
  spring.datasource.username=${DB_USER}
  spring.datasource.password=${DB_PASS}

  # 개발 편의(처음엔 update, 프로덕션에선 신중히)
  spring.jpa.hibernate.ddl-auto=update
  ```

  * 위처럼 `${ENV_VAR:default}` 형식을 쓰면 EB 환경변수로 값을 주기만 하면 됩니다.

## 2) 빌드 (Maven / Gradle)

* Maven (프로젝트 루트에서):

  ```bash
  ./mvnw clean package -DskipTests
  ```

  또는

  ```bash
  mvn clean package -DskipTests
  ```

  결과물: `target/*.jar`

* Gradle:

  ```bash
  ./gradlew bootJar -x test
  ```

  결과물: `build/libs/*.jar`

## 3) (선택) Procfile — 커스텀 실행이 필요할 때

* 보통 단일 JAR만 올리면 EB가 자동으로 `application.jar`로 이름 바꿔 `java -jar application.jar`를 실행해 줍니다. (하지만 JVM 옵션을 추가하거나 여러 Jar가 있을 때 Procfile 사용) ([AWS 문서][1])

  `Procfile` 예:

  ```
  web: java -Xmx512m -Dspring.profiles.active=prod -jar application.jar
  ```

## 4) 배포 방법 — A: AWS 콘솔(웹) / B: EB CLI(명령어)

### A) AWS Console (GUI) — 초보자용

1. AWS 콘솔 → Elastic Beanstalk → **Create application**.
2. Application name 입력 → **Create environment** → **Web server environment** 선택.
3. Platform: **Java** (또는 Tomcat, Java SE 등; Spring Boot fat-jar면 Java SE 선택해도 됨).
4. Application code: **Upload** → 방금 빌드한 `your-app.jar` 파일 업로드.
5. Create 클릭 → 배포 진행(몇 분 소요).
   (자세한 단계는 AWS 튜토리얼에 가이드가 있습니다.) ([AWS 문서][4])

### B) EB CLI(권장: 반복 배포/CI용)

1. EB CLI 설치(설치 스크립트 또는 `pip install awsebcli`). ([AWS 문서][2])
2. 프로젝트 루트에서 초기화:

   ```bash
   eb init -p java my-spring-app
   ```

   (지역 선택, 키페어 등 묻습니다.)
3. 환경 생성 및 최초 배포:

   ```bash
   eb create my-spring-env
   ```
4. 코드 수정 후 배포:

   ```bash
   eb deploy
   ```
5. 환경 변수 설정(예: 포트, DB 정보):

   ```bash
   eb setenv SERVER_PORT=5000 DB_HOST=xxx.rds.amazonaws.com DB_PORT=3306 DB_NAME=mydb DB_USER=admin DB_PASS=비밀번호
   ```

   또는 콘솔 → Configuration → Software → Environment properties에서 설정 가능. ([AWS 문서][5])

---

# 데이터베이스(DB) 권장 방식 (초보자를 위한 권장 + 이유)

1. **개발/학습(작업용)**: Elastic Beanstalk에서 “Add database” (Beanstalk이 RDS를 함께 생성) 기능을 써서 빠르게 연결해 볼 수 있습니다. 다만 이 방법은 **환경을 삭제하면 DB도 삭제될 수 있음**(설정에 따라 달라짐). 따라서 실습용/테스트용으로만 권장합니다. ([AWS 문서][6])

2. **운영(프로덕션)** — **권장**: **RDS(독립 인스턴스)** 또는 **Amazon Aurora**를 별도로 생성(=Decouple). 이유:

   * EB 환경을 재생성/삭제해도 DB가 지워지지 않음 → 데이터 보존.
   * RDS는 Multi-AZ(고가용성), 자동 백업, 스냅샷 등 운영에 필요한 기능 제공. (운영 환경에서는 Multi-AZ를 권장) ([repost.aws][7])
   * 대규모/고성능이 필요하면 Aurora 고려(호환성: MySQL/Postgres). ([Amazon Web Services, Inc.][8])

### 운영 DB 세팅(초보자 친화적으로 요약)

1. AWS Console → RDS → DB 생성(엔진 선택: MySQL 또는 PostgreSQL 권장).
2. 네트워크(VPC)와 서브넷: EB 환경과 같은 VPC/서브넷에 두는 편이 연결이 쉬움.
3. 보안그룹: RDS 보안그룹의 Inbound에 **Elastic Beanstalk 인스턴스의 보안그룹**을 소스로 허용(포트 3306 등). → 이렇게 해야 EB 인스턴스에서 DB에 접근 가능. ([AWS 문서][9])
4. RDS endpoint(호스트), 포트, DB이름, 유저/비밀번호를 확보.
5. EB 환경에 환경변수로 등록(`eb setenv` 또는 콘솔) → `application.properties`에서 위 환경변수로 읽도록 설정. (앞 예시 참고)

**주의:** EB에서 RDS를 “환경 리소스로 생성”하면 EB가 환경 삭제 시 DB까지 제거할 수 있으니(기본 동작) 프로덕션 DB는 **별도 생성 후 연결**하세요. ([repost.aws][7])

---

# 비밀번호/민감정보 관리 (보안)

* **권장**: AWS Secrets Manager 또는 Systems Manager (Parameter Store)에 DB 패스워드 저장하고, EB가 **환경변수로 참조**하게 하세요. EB는 Secrets Manager / Parameter Store와 통합되어 부팅 시 값을 환경변수로 받아오는 기능을 제공합니다. (권한부여 필요) ([AWS 문서][10])
* EB 콘솔에서 Environment properties 추가 시 Source로 Secrets Manager/Parameter Store 선택 가능. (또는 EB 인스턴스에 읽기 권한 주고 애플리케이션이 직접 조회) ([AWS 문서][11])

---

# 보안그룹(연결 문제 자주 발생) — 간단 체크리스트

1. RDS의 보안그룹 Inbound에 EB 인스턴스 보안그룹을 허용했는가? (MySQL이면 포트 3306) ([AWS 문서][12])
2. EB 환경이 같은 VPC에 있나? (다르면 VPC 연결/라우팅 설정 필요) ([AWS 문서][13])
3. 애플리케이션 로그(502 Bad Gateway → 포트 설정 확인, DB 연결 실패 → security group 또는 credentials 확인) 확인: `eb logs` 또는 EB 콘솔의 로그 기능 사용.

---

# 자주 발생하는 문제 & 해결법 (초보자용)

* **502 Bad Gateway**: Spring이 EB가 포워딩하는 포트(기본 5000)로 listen하고 있지 않음 → `server.port=5000`으로 설정하거나 `eb setenv SERVER_PORT=5000`. ([AWS 문서][3])
* **DB 연결 실패**: RDS endpoint/포트/유저/비밀번호가 틀리거나 보안그룹이 닫혀있음 → RDS 보안그룹 Inbound에 EB 인스턴스 SG 추가, EB 환경변수 확인. ([AWS 문서][12])
* **배포후 로그 확인**: `eb logs` 또는 콘솔 → Logs → Request logs / Full logs 확인.

---

# 예시(요약) — 한 번에 따라하기 (정리)

1. `application.properties`에 `server.port=${SERVER_PORT:5000}` 추가.
2. `./mvnw clean package -DskipTests` → `target/myapp.jar` 생성.
3. (콘솔) Elastic Beanstalk → Create application → Platform: Java → Upload `myapp.jar` → Create.
   또는 (EB CLI)

   ```bash
   eb init -p java my-spring-app
   eb create my-spring-env
   eb setenv SERVER_PORT=5000
   eb deploy
   eb open   # 브라우저로 열기
   ```
4. RDS 생성 (MySQL), 보안그룹 설정 → EB에서 DB 접속정보(environment variables) 등록.
5. (선택) Secrets Manager에 비밀번호 저장 → EB 환경변수로 참조하도록 설정. ([AWS 문서][10])

---

# 운영 권장 옵션(요약)

* **개발/테스트**: EB에 RDS 같이 붙여서 빠르게 연동 가능(주의: 삭제시 DB 삭제 가능). ([AWS 문서][6])
* **프로덕션**: RDS(독립) + Multi-AZ 활성화 + Secrets Manager 사용. 필요하면 Aurora로 확장 고려. ([Amazon Web Services, Inc.][14])

---

# 참고(공식 문서 — 더 읽어보기)

* Elastic Beanstalk Java SE 플랫폼 문서(실행 방식, JAR 처리). ([AWS 문서][1])
* QuickStart: Java 앱 배포 가이드. ([AWS 문서][4])
* EB CLI 설치 및 사용법. ([AWS 문서][2])
* Elastic Beanstalk + RDS (연결/보안그룹/디커플 권장). ([AWS 문서][9])
* EB와 Secrets Manager / Parameter Store 통합(환경변수로 참조). ([AWS 문서][10])

---

[1]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/java-se-platform.html?utm_source=chatgpt.com "Using the Elastic Beanstalk Java SE platform"
[2]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html?utm_source=chatgpt.com "Setting up the EB command line interface (EB CLI) to ..."
[3]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/java-se-nginx.html?utm_source=chatgpt.com "Configuring the proxy server - AWS Elastic Beanstalk"
[4]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/java-quickstart.html?utm_source=chatgpt.com "QuickStart: Deploy a Java application to Elastic Beanstalk"
[5]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-setenv.html?utm_source=chatgpt.com "eb setenv - AWS Elastic Beanstalk"
[6]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html?utm_source=chatgpt.com "Adding a database to your Elastic Beanstalk environment"
[7]: https://repost.aws/knowledge-center/decouple-rds-from-beanstalk?utm_source=chatgpt.com "Decouple Amazon RDS instances from Elastic Beanstalk ..."
[8]: https://aws.amazon.com/rds/aurora/faqs/?utm_source=chatgpt.com "Modern Relational Database Service – Amazon Aurora FAQs"
[9]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/AWSHowTo.RDS.html?utm_source=chatgpt.com "Using Elastic Beanstalk with Amazon RDS"
[10]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/AWSHowTo.secrets.html?utm_source=chatgpt.com "Using Elastic Beanstalk with AWS Secrets Manager and ..."
[11]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/AWSHowTo.secrets.env-vars.html?utm_source=chatgpt.com "Fetching secrets and parameters to Elastic Beanstalk ..."
[12]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/rds-external-defaultvpc.html?utm_source=chatgpt.com "Launching and connecting to an external Amazon RDS ..."
[13]: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/vpc-rds.html?utm_source=chatgpt.com "Launching an Elastic Beanstalk in a VPC with Amazon RDS"
[14]: https://aws.amazon.com/rds/features/multi-az/?utm_source=chatgpt.com "Amazon RDS Multi AZ Deployments"
