export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  APP_URL:
    process.env.NODE_ENV === 'production'
      ? getEnvVar('NEXT_PUBLIC_APP_URL')
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  API_URL:
    process.env.NODE_ENV === 'production'
      ? getEnvVar('NEXT_PUBLIC_API_URL')
      : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const
