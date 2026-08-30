# Claude_PJT

빌드 도구 없이 순수 HTML / CSS / ES 모듈로 만든 정적 사이트입니다.
홈은 카드 허브이고, 카드를 누르면 각 도구 페이지가 열립니다.
`main` 브랜치 루트에서 그대로 GitHub Pages로 배포됩니다.

## 페이지

| 경로 | 내용 |
| --- | --- |
| `index.html` | 카드 허브(홈) |
| `about.html` | 소개 |
| `calculator.html` | 공학용 계산기 (삼각함수·로그·거듭제곱·팩토리얼, DEG/RAD, `eval` 미사용 파서) |
| `timer.html` | 카운트다운 타이머 (프리셋, 종료 시 소리·깜빡임) |

## 프로젝트 구조

```
.
├── index.html          카드 허브(홈)
├── about.html          소개
├── calculator.html     공학용 계산기
├── timer.html          타이머
├── .nojekyll           GitHub Pages의 Jekyll 처리 비활성화
├── .gitignore          비밀 파일 / 빌드 산출물 제외 규칙
├── .env.example        필요한 환경 변수 템플릿 (실제 .env는 커밋 안 됨)
├── LICENSE             MIT
├── assets/
│   └── favicon.svg
├── css/
│   └── styles.css      디자인 토큰 → 레이아웃 → 컴포넌트 순서
└── js/
    ├── main.js         홈/소개 진입점 (공통 크롬만 초기화)
    ├── common.js       테마 적용·토글, 푸터 연도 — 모든 페이지 공용
    ├── config.js       공개 가능한 전역 설정만
    ├── storage.js      localStorage 얇은 래퍼
    ├── theme.js        라이트/다크 테마 제어
    ├── calculator.js   수식 토크나이저 + 재귀 하강 파서 + 키패드 UI
    └── timer.js        카운트다운 로직 (목표 시각 기준, 오차 보정)
```

## 로컬에서 실행

`index.html`을 브라우저로 바로 열어도 되지만, ES 모듈은 `file://`에서
CORS 제약을 받을 수 있으므로 간단한 정적 서버 사용을 권장합니다.

```bash
# 아무거나 하나
python -m http.server 8000
npx serve .
```

그 후 http://localhost:8000 접속.

## GitHub Pages 배포

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)` 선택 후 **Save**
4. 1~2분 뒤 `https://ses-git-hub.github.io/Claude_PJT/` 에서 확인

`main`에 push할 때마다 자동으로 다시 배포됩니다.

## 확장 방법

- 새 도구는 루트에 `xxx.html` 한 장 + `js/xxx.js` 한 개로 추가하고,
  `index.html`의 `.card-grid`에 `<a class="card">` 카드를 하나 더 넣는다 (라우터 불필요)
- 각 페이지 스크립트는 `common.js`의 `onReady`/`initChrome`를 먼저 호출
- 스타일은 `css/styles.css` 상단 `:root` 토큰을 먼저 조정
- 소개 문구는 `about.html`에서 직접 편집

## 비밀 정보 취급

- `.env`, `*.key`, `credentials*.json` 등은 `.gitignore`로 커밋이 차단됩니다.
- 정적 사이트의 JS에 넣은 값은 **모두 공개**됩니다. API 키·토큰은
  서버 또는 서버리스 함수 뒤에 두고 호출하세요.
