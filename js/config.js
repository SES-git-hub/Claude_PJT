/**
 * 앱 전역 설정.
 *
 * 여기에는 공개돼도 안전한 값만 둡니다. (정적 사이트의 JS는 브라우저에서
 * 누구나 열람할 수 있으므로 API 키·시크릿·토큰을 절대 넣지 마세요.)
 * 비밀 값이 필요하면 별도 백엔드나 서버리스 함수 뒤에 두고 호출하세요.
 */
export const config = Object.freeze({
  appName: "Claude_PJT",
  version: "0.2.0",
  repoUrl: "https://github.com/SES-git-hub/Claude_PJT",
  storageKeys: Object.freeze({
    theme: "cpjt:theme",
    calcAngle: "cpjt:calc:angle",
    timer: "cpjt:timer",
  }),
});
