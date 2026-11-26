import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import { env } from '@/lib/env'
import { siteConfigSchema, type AdminSiteConfig } from '@/schemas/admin-site-config'

export async function getAdminSiteConfig(): Promise<AdminSiteConfig> {
  const response = await fetch(`${env.API_URL}/site-config/public`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Không tải được cấu hình trang chủ (HTTP ${response.status}).`)
  }
  const json: unknown = await response.json()
  return parseOrThrow(siteConfigSchema, json, '/site-config/public')
}

export async function saveAdminSiteConfig(input: AdminSiteConfig): Promise<AdminSiteConfig> {
  await authFetch<unknown>('/site-config', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return input
}
