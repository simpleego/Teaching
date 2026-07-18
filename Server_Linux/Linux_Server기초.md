# 리눅스 서버 구축 및 실습
> 가장 직접적인 방법은 **Google Cloud의 Compute Engine에서 Ubuntu 가상머신(VM)을 생성하는 것**입니다.
> 생성 즉시 실제 인터넷상의 리눅스 서버가 되며, 강사는 웹 브라우저로 접속하고 학생은 SSH로 접속할 수 있습니다.

```text
Google Cloud
└── Compute Engine VM
    ├── Ubuntu Linux
    ├── 공인 IP 또는 IAP 접속
    ├── OpenSSH Server
    ├── teacher 계정
    ├── student01 계정
    └── student02 계정
```

# 1. 가장 쉬운 구성

수업용으로는 다음 구성이 적합합니다.

| 설정      |            개인 실습 |           여러 학생 접속 |
| ------- | ---------------: | -----------------: |
| 운영체제    | Ubuntu 24.04 LTS |   Ubuntu 24.04 LTS |
| 머신 유형   |       `e2-micro` |     `e2-medium` 이상 |
| 부팅 디스크  |          20~30GB |            30~50GB |
| 접속 방식   |         브라우저 SSH | 외부 IP+SSH 키 또는 IAP |
| 계정      |            강사 1명 |             학생별 계정 |
| 사용 후 처리 |               중지 |           중지 또는 삭제 |

Google Cloud 공식 생성 절차에서도 Compute Engine VM의 부팅 디스크로 Ubuntu 24.04 LTS를 선택하고, 생성 후 VM 목록의 **SSH** 버튼으로 접속하는 방식을 안내합니다. ([Google Cloud Documentation][1])

---

# 2. Google Cloud 가입과 프로젝트 생성

## 2.1 Google Cloud Console 접속

Google 계정으로 Google Cloud Console에 로그인합니다.

처음 사용하는 경우 다음 과정이 필요합니다.

1. 결제 계정 등록
2. 프로젝트 생성
3. Compute Engine API 활성화

새 사용자에게는 일정 기간 사용할 수 있는 무료 체험 크레딧이 제공될 수 있으며, 무료 등급에는 조건에 맞는 `e2-micro` 사용량도 포함됩니다. 다만 무료 혜택과 한도는 계정과 지역 조건에 따라 달라질 수 있습니다. ([Google Cloud][2])

## 2.2 프로젝트 생성

상단의 프로젝트 선택 메뉴에서 다음과 같이 생성합니다.

```text
프로젝트 이름: linux-class
프로젝트 ID: 자동 생성 또는 직접 지정
```

수업용 프로젝트를 별도로 만들면 다른 Google Cloud 자원과 비용을 분리해서 관리하기 쉽습니다.

---

# 3. Compute Engine VM 생성

메뉴에서 다음으로 이동합니다.

```text
Google Cloud Console
→ Compute Engine
→ VM 인스턴스
→ 인스턴스 만들기
```

## 3.1 기본 설정

```text
이름: linux-lab-server
리전: asia-northeast3
영역: asia-northeast3-a
```

`asia-northeast3`는 서울 리전이므로 국내 학생이 접속할 때 지연시간 측면에서 유리합니다.

단, 무료 등급의 `e2-micro`는 서울 리전이 아니라 지정된 미국 리전에서만 적용됩니다. 공식 무료 등급은 `us-west1`, `us-central1`, `us-east1` 같은 지원 리전을 대상으로 합니다. ([Google Cloud Documentation][3])

따라서 선택은 다음과 같습니다.

```text
접속 속도 우선: 서울 리전, 유료
비용 절감 우선: 미국 무료 등급 지원 리전
```

## 3.2 머신 유형

### 강사 혼자 실습

```text
시리즈: E2
머신 유형: e2-micro
```

`e2-micro`는 간단한 `ls`, `grep`, `find`, `chmod`, Bash 스크립트 실습에는 사용할 수 있지만 메모리가 작아 다중 사용자에게는 적합하지 않습니다.

### 학생 여러 명 접속

실무적인 시작 권장값은 다음과 같습니다.

|            동시 접속 | 권장 시작 사양                  |
| ---------------: | ------------------------- |
|             1~3명 | `e2-small` 또는 `e2-medium` |
|            5~10명 | `e2-medium`               |
|           10~20명 | `e2-standard-2`           |
| Python·Docker 병행 | `e2-standard-4` 이상 검토     |

위 표는 기본 리눅스 명령어 중심 수업을 전제로 한 운영 권장값입니다. 학생들이 Python 패키지 설치, 컴파일, Docker, AI 모델 실행을 동시에 하면 더 많은 메모리와 CPU가 필요합니다.

`e2-micro`는 공유 CPU 유형으로 지속적으로 사용할 수 있는 CPU 비율이 제한되므로 가벼운 실습에 적합합니다. ([Google Cloud Documentation][4])

## 3.3 운영체제와 디스크

**OS 및 스토리지 → 변경**을 선택합니다.

```text
운영체제: Ubuntu
버전: Ubuntu 24.04 LTS
부팅 디스크 유형: 표준 영구 디스크
크기: 30GB
```

Linux 기초 실습만 한다면 30GB로 충분합니다.

Docker와 데이터 분석까지 진행한다면 50GB 이상을 고려합니다.

## 3.4 방화벽

SSH 실습만 한다면 다음 옵션은 선택하지 않아도 됩니다.

```text
□ HTTP 트래픽 허용
□ HTTPS 트래픽 허용
```

이 옵션은 웹 서버 실습에서만 필요합니다.

설정이 끝나면 **만들기**를 누릅니다.

---

# 4. 브라우저에서 바로 접속

VM이 생성되면 VM 인스턴스 목록에 다음 정보가 나타납니다.

```text
이름: linux-lab-server
내부 IP: 10.x.x.x
외부 IP: 34.x.x.x
상태: 실행 중
```

오른쪽의 **SSH** 버튼을 누릅니다.

```text
VM 인스턴스
→ linux-lab-server
→ SSH
```

새 브라우저 창에서 Ubuntu 터미널이 열립니다. Google Cloud Console의 SSH 기능은 필요한 SSH 키를 자동으로 생성·관리할 수 있습니다. ([Google Cloud Documentation][5])

접속 후 확인합니다.

```bash
whoami
hostname
pwd
uname -a
cat /etc/os-release
```

기본 패키지를 설치합니다.

```bash
sudo apt update
sudo apt upgrade -y
```

```bash
sudo apt install -y \
    tree \
    curl \
    wget \
    git \
    nano \
    vim \
    zip \
    unzip \
    htop \
    net-tools
```

---

# 5. 학생별 리눅스 계정 생성

강사 계정으로 접속한 후 학생 계정을 만듭니다.

```bash
sudo adduser student01
sudo adduser student02
sudo adduser student03
```

계정 생성 과정에서 각 학생의 비밀번호를 지정합니다.

학생 홈 디렉터리는 자동 생성됩니다.

```text
/home/student01
/home/student02
/home/student03
```

확인:

```bash
ls -al /home
```

```bash
getent passwd | grep student
```

## 여러 계정 한 번에 생성

학생 10명을 생성하는 예입니다.

```bash
for number in $(seq -w 1 10)
do
    username="student${number}"
    sudo useradd -m -s /bin/bash "$username"
    echo "$username:Linux1234!" | sudo chpasswd
done
```

확인:

```bash
getent passwd | grep student
```

다만 모든 학생에게 같은 비밀번호를 오래 사용하게 하면 안 됩니다. 첫 로그인 후 비밀번호를 바꾸게 하려면 다음과 같이 설정합니다.

```bash
for number in $(seq -w 1 10)
do
    sudo chage -d 0 "student${number}"
done
```

학생은 최초 로그인할 때 비밀번호 변경을 요구받습니다.

---

# 6. 학생이 외부에서 SSH로 접속

## 6.1 외부 IP 확인

Google Cloud Console의 VM 목록에서 외부 IP를 확인합니다.

예:

```text
34.64.100.20
```

## 6.2 Windows PowerShell 접속

학생 PC에서 다음과 같이 실행합니다.

```powershell
ssh student01@34.64.100.20
```

처음 접속할 때 다음 질문이 나오면:

```text
Are you sure you want to continue connecting?
```

다음을 입력합니다.

```text
yes
```

비밀번호 또는 SSH 키로 인증하면 접속됩니다.

```text
student01@linux-lab-server:~$
```

## 6.3 접속 확인

```bash
whoami
pwd
hostname
```

예상 결과:

```text
student01
/home/student01
linux-lab-server
```

각 학생은 서로 다른 홈 디렉터리에서 실습합니다.

---

# 7. SSH 방화벽 설정

외부 IP를 사용하려면 VPC 방화벽에서 TCP 22번을 허용해야 합니다.

일반적인 설정은 다음과 같습니다.

```text
VPC 네트워크
→ 방화벽
→ 방화벽 정책 또는 규칙 만들기
```

```text
이름: allow-linux-class-ssh
방향: 수신
대상: 지정된 대상 태그
대상 태그: linux-class
소스 IPv4 범위: 학생 접속 IP 범위
프로토콜 및 포트: TCP 22
```

VM 네트워크 태그에도 다음을 추가합니다.

```text
linux-class
```

## 모든 인터넷에서 SSH를 허용하는 설정

```text
소스 IPv4 범위: 0.0.0.0/0
포트: tcp:22
```

이 설정은 어디서든 접속할 수 있어 편하지만 공격 시도에도 노출됩니다. Google Cloud에서 외부 IP로 SSH 연결하려면 방화벽이 해당 SSH 트래픽을 허용해야 합니다. ([Google Cloud Documentation][6])

가능하면 다음 방법 중 하나를 사용합니다.

* 강의실이나 기관의 공인 IP만 허용
* 학생별 SSH 키 사용
* OS Login 사용
* 외부 IP 없이 IAP 사용

---

# 8. 비밀번호보다 SSH 키 사용 권장

학생 PC의 PowerShell에서 키를 생성합니다.

```powershell
ssh-keygen -t ed25519
```

기본 위치는 다음과 같습니다.

```text
C:\Users\사용자이름\.ssh\id_ed25519
C:\Users\사용자이름\.ssh\id_ed25519.pub
```

공개키 확인:

```powershell
type $HOME\.ssh\id_ed25519.pub
```

학생은 `.pub` 내용만 강사에게 전달합니다. 개인키인 `id_ed25519` 파일은 절대 전달하면 안 됩니다.

서버에서 등록합니다.

```bash
sudo mkdir -p /home/student01/.ssh
sudo nano /home/student01/.ssh/authorized_keys
```

학생의 공개키를 붙여 넣은 후 권한을 설정합니다.

```bash
sudo chown -R student01:student01 /home/student01/.ssh
sudo chmod 700 /home/student01/.ssh
sudo chmod 600 /home/student01/.ssh/authorized_keys
```

학생 접속:

```powershell
ssh student01@34.64.100.20
```

Compute Engine은 OS Login 방식 또는 VM·프로젝트 메타데이터 방식으로 SSH 키를 관리할 수 있으며, 다수 사용자 환경에서는 OS Login이 권장됩니다. ([Google Cloud Documentation][7])

---

# 9. 더 안전한 방식: 외부 IP 없이 IAP 접속

Google Cloud에서는 VM에 외부 공인 IP를 부여하지 않고 **IAP(Identity-Aware Proxy)**를 통해 SSH로 접속할 수도 있습니다.

```text
학생 Google 계정
       │
       ▼
Google IAM 인증
       │
       ▼
IAP 터널
       │
       ▼
내부 IP만 가진 Ubuntu VM
```

장점:

* VM에 외부 IP가 필요 없음
* SSH 22번을 인터넷 전체에 공개하지 않음
* Google 계정과 IAM 권한으로 접속 제어
* 학생 권한을 수업 종료 후 회수 가능

IAP는 외부 IP가 없는 VM의 내부 IP로 SSH 트래픽을 터널링할 수 있습니다. ([Google Cloud Documentation][8])

학생 PC에서 Google Cloud CLI를 설치한 후 다음 형식으로 접속합니다.

```powershell
gcloud compute ssh linux-lab-server `
    --zone=asia-northeast3-a `
    --tunnel-through-iap
```

Linux 또는 macOS에서는:

```bash
gcloud compute ssh linux-lab-server \
    --zone=asia-northeast3-a \
    --tunnel-through-iap
```

다만 IAP 방식은 각 학생에게 Google 계정과 IAM 권한을 설정해야 하므로 **초급 Linux 수업에서는 외부 IP+SSH 키 방식이 더 단순**합니다.

---

# 10. Cloud Shell 명령으로 VM 생성

Google Cloud Console 상단의 **Cloud Shell 열기**를 누르면 브라우저에서 `gcloud` 명령을 사용할 수 있습니다.

다음 명령은 Ubuntu 24.04 VM을 생성하는 예입니다.

```bash
gcloud compute instances create linux-lab-server \
    --zone=asia-northeast3-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2404-lts-amd64 \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-standard \
    --tags=linux-class
```

SSH 접속:

```bash
gcloud compute ssh linux-lab-server \
    --zone=asia-northeast3-a
```

외부 IP 확인:

```bash
gcloud compute instances describe linux-lab-server \
    --zone=asia-northeast3-a \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

VM 목록 확인:

```bash
gcloud compute instances list
```

---

# 11. 수업용 초기화 스크립트

VM 생성 후 다음 스크립트를 실행하면 학생 계정과 실습 폴더를 한 번에 만들 수 있습니다.

```bash
cat > setup_classroom.sh <<'EOF'
#!/bin/bash

STUDENT_COUNT=10
DEFAULT_PASSWORD="Linux1234!"

apt update

apt install -y \
    tree \
    curl \
    wget \
    git \
    nano \
    vim \
    zip \
    unzip \
    htop \
    net-tools

for number in $(seq -w 1 "$STUDENT_COUNT")
do
    username="student${number}"

    if id "$username" >/dev/null 2>&1
    then
        echo "[SKIP] $username 계정이 이미 존재합니다."
    else
        useradd -m -s /bin/bash "$username"
        echo "$username:$DEFAULT_PASSWORD" | chpasswd
        chage -d 0 "$username"

        mkdir -p "/home/$username/linux_lab"
        chown -R "$username:$username" "/home/$username/linux_lab"

        echo "[OK] $username 계정 생성 완료"
    fi
done

echo
echo "전체 학생 계정:"
getent passwd | grep '^student'
EOF
```

실행:

```bash
chmod +x setup_classroom.sh
sudo ./setup_classroom.sh
```

---

# 12. 비용 관리

## 12.1 예산 알림 설정

다음 메뉴로 이동합니다.

```text
결제
→ 예산 및 알림
→ 예산 만들기
```

예:

```text
월 예산: 10,000원
알림: 50%, 90%, 100%
```

Google Cloud 예산 알림은 실제 비용을 예산과 비교하여 이메일로 알려주지만, 기본 설정만으로 VM을 자동 종료시키는 강제 지출 한도는 아닙니다. 자동 비용 제어에는 추가 자동화가 필요합니다. ([Google Cloud Documentation][9])

## 12.2 수업 후 VM 중지

콘솔에서:

```text
Compute Engine
→ VM 인스턴스
→ linux-lab-server 선택
→ 중지
```

명령어로:

```bash
gcloud compute instances stop linux-lab-server \
    --zone=asia-northeast3-a
```

중지된 VM은 CPU·메모리 사용 요금은 발생하지 않지만, 영구 디스크와 일부 IP 자원은 계속 비용이 발생할 수 있습니다. ([Google Cloud Documentation][10])

임시 외부 IP는 VM을 중지하면 해제되고 다시 시작할 때 다른 주소가 부여될 수 있습니다. ([Google Cloud Documentation][11])

## 12.3 수업 종료 후 완전 삭제

더 이상 사용하지 않는다면 VM을 삭제합니다.

```bash
gcloud compute instances delete linux-lab-server \
    --zone=asia-northeast3-a
```

삭제할 때 부팅 디스크도 함께 삭제되는지 반드시 확인합니다. VM과 연결 자원이 남아 있으면 일부 비용이 계속 발생할 수 있습니다. ([Google Cloud Documentation][12])

---

# 13. 강의 상황별 최종 권장안

## 개인 연습용

```text
리전: us-west1 또는 무료 등급 지원 리전
머신: e2-micro
OS: Ubuntu 24.04 LTS
디스크: 30GB 표준 영구 디스크
접속: 브라우저 SSH
```

무료 등급 한도 안에서 기본 Linux 명령어를 연습하는 구성입니다. 무료 등급은 VM 시간, 디스크, 네트워크 사용량 등의 제한을 함께 확인해야 합니다. ([Google Cloud][2])

## 5~10명 원격 수업

```text
리전: asia-northeast3
머신: e2-medium
OS: Ubuntu 24.04 LTS
디스크: 30~50GB
접속: 외부 IP + 학생별 SSH 키
계정: student01~student10
```

## 보안을 중시한 원격 수업

```text
리전: asia-northeast3
머신: e2-medium 이상
외부 IP: 없음
접속: IAP + OS Login
인증: 학생 Google 계정과 IAM
```

가장 간단한 실습 시작 방식은 **Compute Engine에서 Ubuntu VM 한 대를 생성하고, 학생별 Linux 계정과 SSH 공개키를 등록한 뒤 외부 IP로 접속시키는 구성**입니다. 보안과 사용자 관리까지 교육하려면 다음 단계에서 **OS Login과 IAP 방식**으로 확장하면 됩니다.

[1]: https://docs.cloud.google.com/compute/docs/create-linux-vm-instance?utm_source=chatgpt.com "Create a Linux VM instance in Compute Engine"
[2]: https://cloud.google.com/products/compute?utm_source=chatgpt.com "Compute Engine"
[3]: https://docs.cloud.google.com/free/docs/free-cloud-features?authuser=3&utm_source=chatgpt.com "Free Google Cloud features and trial offer  |  Google Cloud Free Program  |  Google Cloud Documentation"
[4]: https://docs.cloud.google.com/compute/docs/general-purpose-machines?utm_source=chatgpt.com "General-purpose machine family for Compute Engine"
[5]: https://docs.cloud.google.com/compute/docs/connect/standard-ssh?utm_source=chatgpt.com "Connect to Linux VMs | Compute Engine"
[6]: https://docs.cloud.google.com/compute/docs/connect/ssh-in-browser?utm_source=chatgpt.com "SSH-in-browser  |  Compute Engine  |  Google Cloud Documentation"
[7]: https://docs.cloud.google.com/compute/docs/instances/access-overview?utm_source=chatgpt.com "Choose an access method | Compute Engine"
[8]: https://docs.cloud.google.com/compute/docs/connect/ssh-internal-ip?utm_source=chatgpt.com "Choose a connection option for internal-only VMs  |  Compute Engine  |  Google Cloud Documentation"
[9]: https://docs.cloud.google.com/billing/docs/how-to/budgets?utm_source=chatgpt.com "Create, edit, or delete budgets and budget alerts"
[10]: https://docs.cloud.google.com/compute/docs/reference/rest/v1/instances/stop?utm_source=chatgpt.com "Method: instances.stop  |  Compute Engine  |  Google Cloud Documentation"
[11]: https://docs.cloud.google.com/compute/docs/instances/suspend-stop-reset-instances-overview?utm_source=chatgpt.com "Suspend, stop, or reset Compute Engine instances  |  Google Cloud Documentation"
[12]: https://docs.cloud.google.com/compute/docs/instances/deleting-instance?utm_source=chatgpt.com "Delete a Compute Engine instance  |  Google Cloud Documentation"
