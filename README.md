# Claude_PJT

GitHub Pages로 배포되는 정적 웹앱 스타터입니다. 빌드 도구 없이 순수
HTML / CSS / ES 모듈로 구성되어 있으며, `main` 브랜치 루트에서 그대로 서비스됩니다.

## 프로젝트 구조

```
.
├── index.html          진입점 (GitHub Pages가 최초로 로드하는 파일)
├── .nojekyll           GitHub Pages의 Jekyll 처리 비활성화
├── .gitignore          비밀 파일 / 빌드 산출물 제외 규칙
├── .env.example        필요한 환경 변수 템플릿 (실제 .env는 커밋 안 됨)
├── LICENSE             MIT
├── assets/
│   └── favicon.svg
├── css/
│   └── styles.css      디자인 토큰 → 레이아웃 → 컴포넌트 순서
└── js/
    ├── main.js         진입점: DOM을 찾아 각 모듈을 연결
    ├── config.js       공개 가능한 전역 설정만
    ├── storage.js      localStorage 얇은 래퍼
    ├── theme.js        라이트/다크 테마 제어
    └── counter.js      상태 관리 최소 예시 위젯
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

- 새 기능은 `js/`에 모듈 하나로 추가하고 `main.js`에서 `init` 호출
- 스타일은 `css/styles.css` 상단 `:root` 토큰을 먼저 조정
- 페이지가 늘어나면 루트에 `about.html` 같은 파일을 추가 (라우터 불필요)

## 비밀 정보 취급

- `.env`, `*.key`, `credentials*.json` 등은 `.gitignore`로 커밋이 차단됩니다.
- 정적 사이트의 JS에 넣은 값은 **모두 공개**됩니다. API 키·토큰은
  서버 또는 서버리스 함수 뒤에 두고 호출하세요.
