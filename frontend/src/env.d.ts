/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BFF_URL: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
