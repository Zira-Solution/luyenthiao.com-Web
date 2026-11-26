import { describe, expect, it } from 'vitest'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { mergeSiteConfig, resolveMapText, resolveSiteAsset } from '@/lib/site-config'

describe('site-config helpers', () => {
  it('merges partial API payload safely with defaults', () => {
    const merged = mergeSiteConfig({
      defaultLanguage: 'en',
      homeAssets: {
        background: 'https://cdn.example.com/custom-sky.webp',
        topbarIcons: { challenge: 'https://cdn.example.com/custom-challenge.png' },
        bottomNavIcons: {},
      },
    })

    expect(merged.defaultLanguage).toBe('en')
    expect(merged.homeAssets.background).toBe('https://cdn.example.com/custom-sky.webp')
    expect(merged.homeAssets.topbarIcons.challenge).toBe(
      'https://cdn.example.com/custom-challenge.png',
    )
    expect(merged.homeAssets.topbarIcons.writing).toBe(
      DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons.writing,
    )
    expect(merged.mapAssets.backButton).toBe(DEFAULT_SITE_CONFIG_CLIENT.mapAssets.backButton)
  })

  it('prefers upgraded UI art over uncustomized legacy placeholder, and honors custom admin URL', () => {
    const placeholder = DEFAULT_SITE_CONFIG_CLIENT.homeAssets.background
    const upgraded = '/assets/homepage/background/universe-background.webp'

    expect(resolveSiteAsset(placeholder, placeholder, upgraded)).toBe(upgraded)
    expect(resolveSiteAsset('', placeholder, upgraded)).toBe(upgraded)
    expect(resolveSiteAsset('https://cdn.example.com/tet.jpg', placeholder, upgraded)).toBe(
      'https://cdn.example.com/tet.jpg',
    )
  })

  it('resolves localized mapTexts and variable placeholders', () => {
    const cfg = mergeSiteConfig({
      mapTexts: {
        examLabel: { vi: 'Đề {n}', en: 'Exam {n}' },
      },
    })

    expect(resolveMapText(cfg, 'back', 'en')).toBe('Back')
    expect(resolveMapText(cfg, 'examLabel', 'en', { n: 3 })).toBe('Exam 3')
    expect(resolveMapText(cfg, 'examLabel', 'vi', { n: 2 })).toBe('Đề 2')
  })
})
