좋습니다 👍 AWS RDS에서 MySQL을 설치하고, 새로운 데이터베이스를 만든 뒤 해당 DB에 모든 권한을 가진 사용자를 생성하는 과정을 단계별로 정리해드릴게요.

---

## 1️⃣ RDS 인스턴스 생성
1. **AWS Management Console → RDS 서비스**로 이동  
2. **데이터베이스 생성(Create database)** 클릭  
3. **엔진 선택**: MySQL 선택  
4. **템플릿**: 프로덕션/개발용 중 선택  
5. **DB 인스턴스 크기, 스토리지, VPC 설정** 등 환경에 맞게 구성  
6. **마스터 사용자 이름과 비밀번호 설정** (이 계정은 root 권한을 가짐)  
7. 생성 완료 후 엔드포인트를 확인 (예: `mydb.xxxxx.rds.amazonaws.com`)

---

## 2️⃣ MySQL 클라이언트로 접속
로컬 PC나 EC2에서 MySQL 클라이언트를 이용해 접속합니다:

```bash
mysql -h mydb.xxxxx.rds.amazonaws.com -u masteruser -p
```

---

## 3️⃣ 데이터베이스 생성
마스터 계정으로 접속 후 원하는 DB를 생성합니다:

```sql
CREATE DATABASE mydatabase;
```

---

## 4️⃣ 사용자 생성
새로운 사용자 계정을 만들고 비밀번호를 설정합니다:

```sql
CREATE USER 'myuser'@'%' IDENTIFIED BY 'mypassword';
```

- `'%'` → 모든 호스트에서 접속 가능  
- 필요 시 특정 IP나 도메인으로 제한 가능 (예: `'myuser'@'192.168.1.%'`)

---

## 5️⃣ 권한 부여
해당 DB에 모든 권한을 부여합니다:

```sql
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'%';
```

---

## 6️⃣ 권한 적용
권한 변경 사항을 적용합니다:

```sql
FLUSH PRIVILEGES;
```

---

## 7️⃣ 확인
권한이 잘 적용되었는지 확인:

```sql
SHOW GRANTS FOR 'myuser'@'%';
```

---

✅ 이제 `myuser` 계정은 `mydatabase`에 대해 모든 권한을 가지며, 애플리케이션에서 이 계정을 사용해 접속할 수 있습니다.  
💡 보안상 실제 운영 환경에서는 `GRANT ALL PRIVILEGES` 대신 필요한 권한만 부여하는 것이 권장됩니다.

---

혹시 제가 단계별로 **실제 예시 SQL 스크립트**를 완성형으로 만들어드릴까요, 아니면 **보안 모범 사례(최소 권한 원칙)**까지 포함해서 정리해드릴까요?
