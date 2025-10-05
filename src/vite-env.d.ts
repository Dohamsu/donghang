/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  readonly VITE_KAKAO_APP_KEY?: string;
  // 추가 환경변수가 필요하면 여기에 정의
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


