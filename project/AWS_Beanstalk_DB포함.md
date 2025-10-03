# AWS Elastic Beanstalk_배포_DB
> 스프링 프로젝트를 AWS Elastic Beanstalk(EB)에 배포하는 것은 서버 인프라 관리에 대한 부담을 줄이면서 애플리케이션을 손쉽게 배포하고 확장할 수 있는 효과적인 방법입니다.
> 배포 절차와 데이터베이스(DB) 연동하는 방법은 다음과 같습니다.

## 스프링 프로젝트 Elastic Beanstalk 배포 절차

Elastic Beanstalk 배포는 크게 **애플리케이션 준비**, **Elastic Beanstalk 환경 생성**, 그리고 **애플리케이션 배포**의 3단계로 진행됩니다.

-----

### 1단계: 스프링 부트 애플리케이션 준비

배포할 스프링 부트 프로젝트를 실행 가능한 JAR 파일로 만들어야 합니다.

1.  **`application.properties` 포트 설정:** Elastic Beanstalk의 기본 Java SE 플랫폼은 80번 포트로 오는 요청을 애플리케이션의 **5000번 포트**로 전달합니다. 따라서 애플리케이션이 5000번 포트에서 실행되도록 설정하는 것이 가장 간단합니다.

    ```properties
    server.port=5000
    ```

2.  **실행 가능한 JAR 파일 빌드:** Maven 또는 Gradle을 사용하여 프로젝트를 빌드합니다.

      * **Maven:**
        ```bash
        ./mvnw clean package
        ```
      * **Gradle:**
        ```bash
        ./gradlew clean build
        ```

    빌드가 완료되면 `build/libs` 디렉토리 안에 `프로젝트명-0.0.1-SNAPSHOT.jar`와 같은 JAR 파일이 생성됩니다.

-----

### 2단계: AWS Elastic Beanstalk 환경 생성

이제 스프링 부트 애플리케이션을 실행할 AWS 환경을 구성합니다.

1.  **AWS 콘솔 접속:** [AWS Management Console](https://aws.amazon.com/console/)에 로그인한 후, 서비스 검색창에서 **Elastic Beanstalk**를 검색하여 이동합니다.

2.  **새 애플리케이션 생성:**

      * 우측 상단의 '애플리케이션 생성' 버튼을 클릭합니다.
      * **애플리케이션 이름**을 입력합니다. (예: `my-spring-app`)

3.  **환경 생성:**

      * 애플리케이션 생성 후, '환경 생성' 화면으로 이동합니다.
      * **환경 티어**는 '웹 서버 환경'을 선택합니다.
      * **환경 이름**을 지정하고 원하는 **도메인**을 입력합니다. (입력하지 않으면 자동으로 생성됩니다.)
      * **플랫폼** 섹션에서 '관리형 플랫폼'을 선택하고, **플랫폼**은 'Java'를, **플랫폼 브랜치**는 프로젝트에 사용한 Java 버전에 맞는 Amazon Corretto 버전을 선택합니다. (예: `Corretto 17 running on 64bit Amazon Linux 2`)
      * **애플리케이션 코드** 섹션에서는 '코드 업로드'를 선택합니다.
      * '소스 코드 오리진'에서 '로컬 파일'을 선택하고, '파일 선택' 버튼을 눌러 **1단계에서 빌드한 JAR 파일을 업로드**합니다.

4.  **환경 생성 시작:**

      * '환경 생성' 버튼을 클릭하면 AWS가 필요한 리소스(EC2 인스턴스, 보안 그룹 등)를 프로비저닝하고 애플리케이션 배포를 시작합니다. 이 과정은 몇 분 정도 소요될 수 있습니다.
      * 배포가 완료되면 환경 대시보드 상단에 표시되는 URL을 통해 애플리케이션에 접속할 수 있습니다.

-----

## 데이터베이스(DB) 연동 권장 방안

Elastic Beanstalk 환경에서 데이터베이스를 사용하는 가장 좋은 방법은 **Amazon RDS(Relational Database Service)를 연동**하는 것입니다. 애플리케이션이 실행되는 EC2 인스턴스에 직접 DB를 설치하는 방식은 인스턴스가 교체되거나 확장될 때 데이터가 유실될 수 있어 권장되지 않습니다.

### Amazon RDS 연동 방법

Elastic Beanstalk 환경 구성 시 데이터베이스를 함께 프로비저닝할 수 있어 매우 편리합니다.

1.  **환경 구성에서 DB 추가:**

      * Elastic Beanstalk 환경 생성 시 '추가 옵션 구성'을 클릭하거나, 이미 생성된 환경의 '구성' 메뉴로 이동합니다.
      * **'데이터베이스'** 카드에서 '편집' 버튼을 클릭합니다.
      * DB 엔진(MySQL, PostgreSQL 등), 인스턴스 사양, 스토리지 등을 선택합니다.
      * **마스터 사용자 이름**과 **암호**를 설정합니다. **이 정보는 반드시 안전하게 기록해 두어야 합니다.**

2.  **스프링 부트 애플리케이션에 DB 정보 연동:**

      * Elastic Beanstalk가 RDS 인스턴스를 생성하면, 데이터베이스 연결 정보를 **환경 변수**로 애플리케이션에 자동으로 주입해 줍니다.
      * `application.properties` 파일에서 이 환경 변수들을 참조하도록 설정합니다.

    <!-- end list -->

    ```properties
    # application.properties

    # DB 연결 정보
    spring.datasource.url=jdbc:mysql://${RDS_HOSTNAME}:${RDS_PORT}/${RDS_DB_NAME}
    spring.datasource.username=${RDS_USERNAME}
    spring.datasource.password=${RDS_PASSWORD}
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

    # JPA 설정 (옵션)
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    ```

      * `RDS_HOSTNAME`, `RDS_PORT`, `RDS_DB_NAME`, `RDS_USERNAME`, `RDS_PASSWORD`는 Elastic Beanstalk가 자동으로 설정해주는 환경 변수명입니다.

3.  **보안 그룹 설정:**

      * Elastic Beanstalk가 RDS를 함께 생성하면, 애플리케이션 서버(EC2)가 RDS에 접근할 수 있도록 **보안 그룹 규칙을 자동으로 설정**해 줍니다.
      * 만약 RDS 인스턴스를 별도로 생성했다면, RDS의 보안 그룹 인바운드 규칙에 Elastic Beanstalk 환경의 보안 그룹 ID를 추가하여 DB 포트(예: MySQL의 3306) 접근을 허용해야 합니다.

이러한 절차를 통해 스프링 프로젝트를 안정적으로 배포하고, 관리형 데이터베이스 서비스를 통해 데이터의 안정성과 확장성을 확보할 수 있습니다.
