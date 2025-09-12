# 자바스크립트 AI API 요청
> 모델에게 문제뿐 아니라 정답과 해설도 함께 반환하도록 요청하고, 그 결과를 파싱해 HTML로 보여주는 Node.js 스크립트를 아래에 제공합니다.
> Node.js 18+ (global fetch) 환경을 가정합니다.

주요 변경점
- systemMessage를 모델에 "정확한 JSON 객체" 형태로 응답하라(각 항목에 question, answer, explanation 포함)고 강력히 지시
- 응답을 JSON으로 파싱하여 각 문제/정답/해설을 HTML에 표시. 정답/해설은 details/summary로 감춰두어 클릭하면 보이도록 구성
- JSON 파싱 실패 시 번호별 블럭(1. … Answer: … Explanation: … 또는 한글 레이블)을 정규식으로 추출하는 대체 파서 포함

사용법
1) OPENAI_API_KEY 환경변수 설정
   - macOS/Linux: export OPENAI_API_KEY="sk-..."
   - Windows (PowerShell): $env:OPENAI_API_KEY="sk-..."
2) 파일로 저장 (예: openai_quiz_with_answers.js) 후
   node openai_quiz_with_answers.js
3) 브라우저가 자동으로 열리고 http://localhost:8000 에서 확인

코드:
```javascript
// openai_quiz_with_answers.js
// Node.js 18+ 필요 (global fetch)

const http = require('http');
const fs = require('fs/promises');
const { exec } = require('child_process');
const path = require('path');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo'; // 필요시 변경 (gpt-4 사용 가능하면 변경)
const OUT_FILE = path.resolve(process.cwd(), 'problems_with_answers.html');
const PORT = 8000;

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('환경변수 OPENAI_API_KEY를 설정하세요.');
    process.exit(1);
  }

  // 모델에게 엄격히 JSON 형식으로 반환하도록 지시
  const systemMessage = `You are an assistant that MUST respond with exactly one JSON object and nothing else.
The JSON must contain a key "items" whose value is an array of 10 objects.
Each object must have these string keys: "question", "answer", "explanation".
Do NOT include any additional text, commentary, or metadata outside the JSON.
Provide Java basic-syntax questions in Korean. Do NOT include code execution or external links.`;

  const userMessage = '자바기초문법에 관한 문제를 10문제 제출해줘. 각 문제마다 정답(answer)과 해설(explanation)도 포함해서 JSON으로 반환해줘.';

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 1200,
    temperature: 0.2
  };

  let assistantText;
  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const status = res.status;
    const bodyText = await res.text();

    if (status !== 200) {
      console.error('OpenAI API 오류:', status);
      console.error(bodyText);
      process.exit(1);
    }

    const json = JSON.parse(bodyText);
    assistantText = json.choices?.[0]?.message?.content?.trim() ?? '';
    if (!assistantText) {
      console.error('모델 응답에서 내용을 읽어오지 못했습니다.');
      console.error(bodyText);
      process.exit(1);
    }
  } catch (err) {
    console.error('API 호출 중 오류:', err);
    process.exit(1);
  }

  const items = extractItemsFromJsonOrFallback(assistantText);
  if (items.length === 0) {
    console.error('아이템을 추출하지 못했습니다. 모델 응답:\n', assistantText);
    process.exit(1);
  }

  const html = buildHtml(items);
  await fs.writeFile(OUT_FILE, html, { encoding: 'utf8' });
  console.log('HTML 파일 생성됨:', OUT_FILE);

  startHttpServer(html, PORT);
  openBrowser(`http://localhost:${PORT}`);
}

// JSON 우선 파싱, 실패 시 번호별 블록 파싱(영문/한글 레이블 모두 시도)
function extractItemsFromJsonOrFallback(text) {
  // 1) Strict JSON parse
  try {
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed.items.map(normalizeItem).filter(Boolean);
    }
    // Some prompts used "questions" as key; accept that too
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      // if elements are strings, convert to objects with empty answer/explanation
      return parsed.questions.map(q => typeof q === 'string' ? ({ question: q, answer: '', explanation: '' }) : normalizeItem(q)).filter(Boolean);
    }
  } catch (e) {
    // ignore
  }

  // 2) Regex block parse: numbered blocks with question / answer / explanation
  // Supports English labels (Answer/Explanation) and Korean (정답/해설/답)
  const blocks = [];
  const blockRegex = /(?ms)^\s*\d+\s*[.)]\s*(.+?)(?=(?:\r?\n\s*(?:Answer|Explanation|정답|해설|답)\s*[:：])|(?:\r?\n\s*\d+\s*[.)]\s*)|$)/g;
  let m;
  const textLines = text.split(/\r?\n/);

  // Approach: iterate through lines and build sections per number
  // Simpler robust fallback: find segments starting with number and collect following lines until next number
  const segments = [];
  let current = null;
  for (const line of textLines) {
    const numMatch = line.match(/^\s*(\d+)\s*[.)]\s*(.*)$/);
    if (numMatch) {
      if (current) segments.push(current);
      current = numMatch[2] ? numMatch[2] + '\n' : '\n';
    } else {
      if (current !== null) current += line + '\n';
    }
  }
  if (current) segments.push(current);

  for (const seg of segments) {
    // Try to extract question, answer, explanation from segment
    // Patterns for answer and explanation lines
    const answerMatch = seg.match(/(?:\r?\n|^)\s*(?:Answer|정답|답)\s*[:：]\s*(.+?)(?=(?:\r?\n\s*(?:Explanation|해설)\s*[:：])|$)/is);
    const explMatch = seg.match(/(?:\r?\n|^)\s*(?:Explanation|해설)\s*[:：]\s*(.+?)$/is);
    const questionLine = seg.split(/\r?\n/)[0].trim();
    const question = questionLine || seg.trim();
    const answer = answerMatch ? answerMatch[1].trim() : '';
    const explanation = explMatch ? explMatch[1].trim() : '';
    if (question) blocks.push({ question, answer, explanation });
  }

  if (blocks.length > 0) return blocks.slice(0, 10).map(normalizeItem);

  // 3) 마지막 수단: 줄 단위로 10개 질문만 추출(정답/해설 빈값)
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidates = [];
  for (const line of lines) {
    // skip lines that look like "Answer:" etc
    if (/^(Answer|Explanation|정답|해설|답)\s*[:：]/i.test(line)) continue;
    // skip lines that are JSON-like or brackets
    if (/^[\{\[]/.test(line) || line.length < 8) continue;
    candidates.push({ question: line, answer: '', explanation: '' });
    if (candidates.length >= 10) break;
  }
  return candidates.slice(0, 10);
}

function normalizeItem(obj) {
  if (!obj) return null;
  const question = (obj.question || obj.q || '').toString().trim();
  const answer = (obj.answer || obj.a || '').toString().trim();
  const explanation = (obj.explanation || obj.explain || obj.ex || '').toString().trim();
  if (!question) return null;
  return { question, answer, explanation };
}

function escapeHtml(s) {
  return String(s || '').replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildHtml(items) {
  const now = new Date().toLocaleString();
  const list = items.map((it, idx) => {
    const q = escapeHtml(it.question);
    const a = escapeHtml(it.answer || '정답 없음');
    const e = escapeHtml(it.explanation || '해설 없음');
    return `<li>
  <div class="q"><strong>Q${idx + 1}.</strong> ${q}</div>
  <details class="ans">
    <summary>정답 및 해설 보기</summary>
    <div class="answer"><strong>정답:</strong> ${a}</div>
    <div class="explanation"><strong>해설:</strong><div class="ex-text">${e.replaceAll('\\n', '<br>')}</div></div>
  </details>
</li>`;
  }).join('\n');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>자바 기초문법 문제 - 정답/해설 포함</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; max-width:900px; margin:auto; color:#222; }
  h1 { color:#333; }
  ol { font-size:16px; padding-left:20px; }
  li { margin-bottom: 18px; }
  .q { margin-bottom:8px; }
  details.ans summary { cursor:pointer; padding:6px 8px; background:#f5f5f5; border-radius:4px; display:inline-block; }
  .answer, .explanation { margin-top:8px; padding:8px; background:#fcfcfc; border-left:3px solid #4CAF50; }
  .footer { margin-top:30px; color:#666; font-size:13px; }
  pre { white-space:pre-wrap; }
</style>
</head>
<body>
  <h1>자바 기초문법 문제 (정답 / 해설 포함)</h1>
  <ol>
  ${list}
  </ol>
  <div class="footer">생성일: ${escapeHtml(now)}</div>
</body>
</html>`;
}

function startHttpServer(html, port) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  server.listen(port, () => {
    console.log(`HTTP 서버 시작: http://localhost:${port}`);
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'darwin') cmd = `open "${url}"`;
  else if (platform === 'win32') cmd = `start "" "${url}"`;
  else cmd = `xdg-open "${url}"`;

  exec(cmd, (err) => {
    if (err) {
      console.warn('브라우저 자동 실행 실패:', err.message);
      console.log('다음 URL을 수동으로 여세요:', url);
    }
  });
}

main();
```

원하시면
- Express 기반 REST 엔드포인트 버전 (웹에서 API로 바로 호출 가능),
- React/클라이언트에서 동적으로 불러와 표시하는 예제,
- 문제 난이도별(초급/중급/고급) 분류 추가
중 어떤 것을 만들지 알려 주세요.
