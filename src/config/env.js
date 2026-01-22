// Vite 환경변수 접근
// VITE_ 접두사가 붙은 변수만 클라이언트에서 접근 가능

export const env = {
  VITE_MONDAY_KEY: import.meta.env.VITE_MONDAY_KEY,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
}

// 환경변수 존재 여부 확인
export function getEnv(key) {
  const value = import.meta.env[`VITE_${key}`]
  if (!value) {
    console.warn(`Environment variable VITE_${key} is not defined`)
  }
  return value || ''
}
