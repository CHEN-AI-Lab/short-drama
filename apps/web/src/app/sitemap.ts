import type { MetadataRoute } from 'next'

const locales = ['zh-CN', 'en']
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://short-drama.vercel.app'

const pages = ['', '/pricing', '/sign-in', '/sign-up', '/success']

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.7,
      })
    }
  }

  return entries
}
