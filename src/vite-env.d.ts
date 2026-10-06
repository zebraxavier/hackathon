/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL, e.g. https://api.example.com/api */
  readonly VITE_API_URL?: string;
  /** Support inbox shown on the Help & Support page */
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
