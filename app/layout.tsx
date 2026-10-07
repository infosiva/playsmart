import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import { getSiteFlags } from '@/lib/flags'
import FeedbackWidget from '@/components/FeedbackWidget'
import { AnimatedBg } from '@/components/AnimatedBg'
import Telemetry from '@/components/Telemetry'
import { loadSiteTheme, buildThemeStyleTag, buildGa4Snippet } from '@/lib/theme-loader'

import { MotionProvider } from "@infosiva/shared-ui/modern";
export const metadata: Metadata = {
  metadataBase: new URL('https://playsmart.app'),
  title: 'PlaySmart — AI Sports Coaching Videos for Badminton, Tennis, Football',
  description: 'AI-generated drill videos for real-world sports. Pick your sport, choose your level, and get personalized coaching videos for badminton, tennis, football, cricket, and basketball.',
  openGraph: {
    title: 'PlaySmart — AI Sports Coaching Videos',
    description: 'AI-generated drill videos for real-world sports. Badminton, tennis, football, cricket, basketball.',
    url: 'https://playsmart.app',
    siteName: 'PlaySmart',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlaySmart — AI Sports Coaching Videos',
    description: 'AI-generated drill videos for your sport and skill level.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await getSiteFlags('playsmart')
  const theme = await loadSiteTheme('playsmart')
  const ga4 = buildGa4Snippet(theme)
  return (
    <html lang="en" data-layout={theme?.layout?.archetype ?? 'default'}>
      <head>
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: buildThemeStyleTag(theme) }} />
        {ga4 && <script dangerouslySetInnerHTML={{ __html: ga4 }} />}
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <Script
                  async
                  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4237294630161176"
                  crossOrigin="anonymous"
                  strategy="afterInteractive"
                />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'PlaySmart',
              url: 'https://playsmart.app',
              description: 'AI-generated sports coaching drill videos',
              applicationCategory: 'SportsApplication',
            }),
          }}
        />
      </head>
      <body>
        <AnimatedBg theme={theme} fallback="mesh" />
        <Telemetry />
        <MotionProvider>{children}</MotionProvider>
        {flags.chatbot && <FloatingChatWrapper />}
        <FeedbackWidget siteName="PlaySmart" position="left" />
      </body>
    </html>
  )
}
