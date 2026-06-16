import type { Metadata } from 'next'
import './globals.css'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import FeedbackWidget from '@/components/FeedbackWidget'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
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
        {children}
        <FloatingChatWrapper />
        <FeedbackWidget siteName="PlaySmart" />
      </body>
    </html>
  )
}
