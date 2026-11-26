import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { parseOrThrow } from '@/lib/api/parse'
import { apiFetch } from '@/lib/api-client'
import { siteConfigSchema, type AdminSiteConfig } from '@/schemas/admin-site-config'

export type SiteLanguage = 'vi' | 'en'

/** Merge partial config from API safely over complete client defaults so missing nested keys never leave undefined fields. */
export function mergeSiteConfig(raw: Partial<AdminSiteConfig> | undefined): AdminSiteConfig {
  if (!raw) return DEFAULT_SITE_CONFIG_CLIENT
  return {
    ...DEFAULT_SITE_CONFIG_CLIENT,
    ...raw,
    mapAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.mapAssets, ...raw.mapAssets },
    mapTexts: { ...DEFAULT_SITE_CONFIG_CLIENT.mapTexts, ...raw.mapTexts },
    languages:
      raw.languages && raw.languages.length > 0
        ? raw.languages
        : DEFAULT_SITE_CONFIG_CLIENT.languages,
    globalAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.globalAssets, ...raw.globalAssets },
    authAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.authAssets, ...raw.authAssets },
    homeAssets: {
      background: raw.homeAssets?.background || DEFAULT_SITE_CONFIG_CLIENT.homeAssets.background,
      topbarIcons: {
        ...DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons,
        ...raw.homeAssets?.topbarIcons,
      },
      bottomNavIcons: {
        ...DEFAULT_SITE_CONFIG_CLIENT.homeAssets.bottomNavIcons,
        ...raw.homeAssets?.bottomNavIcons,
      },
    },
    speakingAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.speakingAssets, ...raw.speakingAssets },
    writingAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.writingAssets, ...raw.writingAssets },
    challengeAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.challengeAssets, ...raw.challengeAssets },
    checkpointAssets: { ...DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets, ...raw.checkpointAssets },
  }
}

export async function fetchPublicSiteConfigClient(): Promise<AdminSiteConfig> {
  const raw = await apiFetch<unknown>('/site-config/public')
  const parsed = parseOrThrow(siteConfigSchema, raw, '/site-config/public')
  return mergeSiteConfig(parsed)
}

/**
 * Resolve an asset URL from SiteConfig:
 * - Uses `configured` whenever it is non-empty AND (if `preferredAsset` differs from `defaultPlaceholder`) was customized away from the legacy placeholder.
 * - Falls back safely to `preferredAsset ?? defaultPlaceholder` otherwise.
 */
export function resolveSiteAsset(
  configured: string | undefined,
  defaultPlaceholder: string,
  preferredAsset?: string,
): string {
  const value = configured?.trim()
  if (preferredAsset && (!value || value === defaultPlaceholder)) {
    return preferredAsset
  }
  return value || preferredAsset || defaultPlaceholder
}

export function resolveMapText(
  config: AdminSiteConfig,
  key: string,
  lang: SiteLanguage,
  vars?: Record<string, string | number>,
): string {
  const entry = config.mapTexts[key] ?? DEFAULT_SITE_CONFIG_CLIENT.mapTexts[key]
  let text = entry ? entry[lang] || entry.vi || entry.en : key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}
