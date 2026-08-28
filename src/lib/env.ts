export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

function resolveApiUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return getEnvVar('NEXT_PUBLIC_API_URL')
  }
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn(
      '[env] NEXT_PUBLIC_API_URL is not set — falling back to http://localhost:3000/api. Set it in .env if the backend runs elsewhere.',
    )
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
}

export const env = {
  APP_URL:
    process.env.NODE_ENV === 'production'
      ? getEnvVar('NEXT_PUBLIC_APP_URL')
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  API_URL: resolveApiUrl(),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const
