Codex는 **코드 작성·수정·리뷰·테스트 실행까지 도와주는 OpenAI 코딩 에이전트**입니다. 단순히 “코드만 답변”하는 ChatGPT와 달리, 프로젝트 폴더나 GitHub 저장소를 읽고 파일을 수정하며 명령어도 실행할 수 있습니다. OpenAI 공식 문서 기준으로 Codex는 ChatGPT Free, Go, Plus, Pro, Business, Edu, Enterprise 플랜에서 사용할 수 있고, 사용량 제한은 플랜마다 다릅니다. ([OpenAI Help Center][1])

## 1. Codex를 쓰는 3가지 방식

### ① Codex Web, 가장 쉬운 방식

브라우저에서 쓰는 방식입니다. GitHub 저장소를 연결하면 Codex가 클라우드 환경에서 코드를 읽고 수정하고, 필요하면 PR까지 만들 수 있습니다. 공식 문서에서는 Codex Web을 통해 Codex가 클라우드에서 병렬 작업도 수행할 수 있다고 설명합니다. ([OpenAI 개발자][2])

사용 흐름은 다음과 같습니다.

1. ChatGPT 계정으로 로그인
2. Codex Web 접속
3. GitHub 계정 연결
4. 저장소 선택
5. 작업 지시 입력
6. Codex가 수정안 생성
7. 변경 내용 검토 후 적용 또는 PR 생성

예시 프롬프트:

```text
이 FastAPI 프로젝트의 구조를 분석해줘. 
회원가입, 로그인, JWT 인증, Todo CRUD 흐름을 설명하고 
보안상 개선할 부분도 함께 찾아줘.
```

```text
이 프로젝트에서 로그인 후 Todo 목록이 안 보이는 문제를 찾아서 수정해줘.
수정 전 원인 설명, 수정한 파일 목록, 테스트 방법을 함께 정리해줘.
```

---

### ② Codex CLI, 개발자용 추천 방식

터미널에서 프로젝트 폴더를 열고 Codex를 실행하는 방식입니다. Codex CLI는 로컬 컴퓨터에서 실행되며, 선택한 디렉터리 안의 코드를 읽고 수정하고 명령어를 실행할 수 있습니다. 공식 문서에 따르면 CLI는 macOS, Windows, Linux에서 사용할 수 있습니다. ([OpenAI 개발자][3])

Windows에서는 PowerShell에서 다음 명령으로 설치할 수 있습니다. OpenAI 공식 GitHub README에 안내된 명령입니다. ([GitHub][4])

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
```

macOS/Linux는 다음 명령입니다.

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

또는 npm으로 설치할 수도 있습니다.

```bash
npm install -g @openai/codex
```

설치 후 프로젝트 폴더에서 실행합니다.

```bash
cd my-project
codex
```

처음 실행하면 ChatGPT 계정 또는 API Key로 로그인합니다. Codex CLI와 IDE Extension은 ChatGPT 로그인과 API Key 로그인을 모두 지원하지만, Codex Cloud는 ChatGPT 로그인이 필요합니다. ([OpenAI 개발자][5])

---

### ③ Codex App, 데스크톱 앱 방식

Codex App은 macOS와 Windows에서 사용할 수 있는 데스크톱 앱입니다. 여러 Codex 작업 스레드를 병렬로 다루고, Git worktree, 자동화, Git 기능을 함께 사용할 수 있는 작업 환경입니다. ([OpenAI 개발자][6])

초보자는 **Codex Web 또는 Codex App**, 개발 실습이나 수업용 프로젝트에는 **Codex CLI**가 가장 좋습니다.

---

## 2. 가장 기본적인 사용 패턴

Codex를 잘 쓰려면 “코드를 만들어줘”보다 **프로젝트 맥락 + 목표 + 제약조건 + 검증방법**을 같이 주는 것이 좋습니다.

나쁜 예:

```text
Todo 앱 만들어줘.
```

좋은 예:

```text
현재 FastAPI 백엔드가 있습니다.
기능은 회원가입, 로그인, JWT 인증, Todo CRUD입니다.

프론트엔드 HTML/CSS/JS를 생성해 주세요.
조건:
1. 로그인 성공 시 access_token을 localStorage에 저장
2. Todo 목록 조회 시 Authorization: Bearer 토큰 사용
3. Todo 추가, 수정, 삭제 기능 구현
4. 백엔드 코드는 수정하지 말 것
5. 수정한 파일과 실행 방법을 마지막에 정리할 것
```

이렇게 작성하면 Codex가 단순 코드 조각이 아니라 **실제 프로젝트에 맞는 수정 작업**을 수행하기 쉬워집니다.

---

## 3. Codex CLI 실습 예시

예를 들어 FastAPI Todo 프로젝트가 있다고 가정하면 다음처럼 사용할 수 있습니다.

```bash
cd todo-api-project
codex
```

Codex 창에서 다음과 같이 입력합니다.

```text
이 프로젝트의 전체 구조를 분석해줘.
각 파일의 역할을 설명하고, 실행 순서와 API 엔드포인트 목록을 표로 정리해줘.
아직 코드는 수정하지 마.
```

그다음:

```text
JWT 인증이 적용된 프론트엔드 index.html, app.js, style.css를 생성해줘.
백엔드 API 구조는 현재 프로젝트 코드를 기준으로 맞춰줘.
수정 후 실행 방법도 작성해줘.
```

또는 오류 수정:

```text
로그인 후 Todo 목록 조회 시 401 에러가 발생한다.
원인을 찾아서 최소 수정으로 해결해줘.
수정 전에 어떤 파일을 확인했는지 설명하고,
수정 후 테스트 명령어를 실행해줘.
```

---

## 4. 수업/강의에서 쓰기 좋은 Codex 활용법

강의에서는 Codex를 “정답 생성기”로 쓰기보다 **코드 리뷰 조교**처럼 쓰는 것이 좋습니다.

예를 들면:

```text
다음 학생 코드에서 오류 가능성이 있는 부분을 찾아줘.
정답 코드를 바로 주지 말고, 힌트 → 원인 → 수정 방향 순서로 설명해줘.
```

```text
이 코드를 비전공자 학생에게 설명한다고 가정하고,
1단계: 전체 흐름
2단계: 함수별 역할
3단계: 실행 순서
4단계: 자주 나는 오류
순서로 설명해줘.
```

```text
이 FastAPI 코드를 기반으로 실습 문제 5개를 만들어줘.
각 문제는 난이도 하/중/상으로 구분하고,
학생이 직접 수정해야 하는 파일명을 포함해줘.
```

---

## 5. 사용할 때 주의할 점

Codex는 실제 파일을 수정하거나 명령어를 실행할 수 있으므로, 처음에는 반드시 **Git 저장소에서 사용**하는 것이 좋습니다. 작업 전에는 다음처럼 커밋해 두는 습관이 안전합니다.

```bash
git add .
git commit -m "before codex changes"
```

또한 API Key, 비밀번호, `.env` 파일, 개인정보가 들어 있는 파일은 Codex에 노출하지 않는 것이 좋습니다. OpenAI 문서에서도 Codex 인증 정보가 로컬에 캐시될 수 있으므로 인증 파일을 공유하거나 커밋하지 말라고 안내합니다. ([OpenAI 개발자][5])

---

## 결론

처음 시작한다면 이 순서가 가장 좋습니다.

1. **Codex Web**으로 GitHub 저장소 연결 후 간단한 코드 분석 실습
2. **Codex CLI** 설치 후 로컬 프로젝트에서 코드 수정 실습
3. Git으로 변경사항 확인
4. “설명 → 수정 → 테스트 → 요약” 형식으로 Codex에게 작업 지시
5. 강의에서는 코드 작성보다 코드 분석, 오류 수정, 리팩터링, 실습 문제 생성에 활용

Windows 기준으로 바로 시작하려면 PowerShell에서 설치 후 프로젝트 폴더에서 `codex`를 실행하면 됩니다.

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
```

```powershell
cd 프로젝트폴더
codex
```

[1]: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan "Using Codex with your ChatGPT plan | OpenAI Help Center"
[2]: https://developers.openai.com/codex/cloud "Web – Codex | OpenAI Developers"
[3]: https://developers.openai.com/codex/cli "CLI – Codex | OpenAI Developers"
[4]: https://github.com/openai/codex "GitHub - openai/codex: Lightweight coding agent that runs in your terminal · GitHub"
[5]: https://developers.openai.com/codex/auth "Authentication – Codex | OpenAI Developers"
[6]: https://developers.openai.com/codex/app "App – Codex | OpenAI Developers"
