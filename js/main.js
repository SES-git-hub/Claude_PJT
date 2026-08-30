/**
 * 홈(카드 허브) 진입점.
 * 카드는 순수 링크라 별도 로직이 없고, 공통 크롬만 초기화한다.
 */
import { initChrome, onReady } from "./common.js";

onReady(initChrome);
