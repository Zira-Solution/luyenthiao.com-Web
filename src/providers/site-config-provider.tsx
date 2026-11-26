'use client'

import { useQuery } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { queryKeys } from '@/lib/query-keys'
import {
  fetchPublicSiteConfigClient,
  resolveMapText,
  resolveSiteAsset,
  type SiteLanguage,
} from '@/lib/site-config'
import type { AdminSiteConfig } from '@/schemas/admin-site-config'

const LANG_STORAGE_KEY = 'lta.site.lang'

interface SiteConfigContextValue {
  config: AdminSiteConfig
  language: SiteLanguage
  setLanguage: (lang: SiteLanguage) => void
  resolveAsset: (
    configured: string | undefined,
    defaultPlaceholder: string,
    preferredAsset?: string,
  ) => string
  mapText: (key: string, vars?: Record<string, string | number>) => string
}

const DEFAULT_CONTEXT: SiteConfigContextValue = {
  config: DEFAULT_SITE_CONFIG_CLIENT,
  language: DEFAULT_SITE_CONFIG_CLIENT.defaultLanguage,
  setLanguage: () => {},
  resolveAsset: resolveSiteAsset,
  mapText: (key, vars) =>
    resolveMapText(DEFAULT_SITE_CONFIG_CLIENT, key, DEFAULT_SITE_CONFIG_CLIENT.defaultLanguage, vars),
}

const SiteConfigContext = createContext<SiteConfigContextValue>(DEFAULT_CONTEXT)

function readInitialLanguage(): SiteLanguage | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY)
    return raw === 'vi' || raw === 'en' ? raw : null
  } catch {
    return null
  }
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { data } = useQuery({
    queryKey: queryKeys.publicSiteConfig(),
    queryFn: fetchPublicSiteConfigClient,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const config = data ?? DEFAULT_SITE_CONFIG_CLIENT
  const [overrideLang, setOverrideLang] = useState<SiteLanguage | null>(() => readInitialLanguage())
  const language: SiteLanguage = overrideLang ?? config.defaultLanguage ?? 'vi'

  const setLanguage = useCallback((next: SiteLanguage) => {
    setOverrideLang(next)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, next)
      } catch {
        // ignore storage restrictions
      }
    }
  }, [])

  const value = useMemo<SiteConfigContextValue>(
    () => ({
      config,
      language,
      setLanguage,
      resolveAsset: resolveSiteAsset,
      mapText: (key, vars) => resolveMapText(config, key, language, vars),
    }),
    [config, language, setLanguage],
  )

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig(): SiteConfigContextValue {
  return useContext(SiteConfigContext)
}
