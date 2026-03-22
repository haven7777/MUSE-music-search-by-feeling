import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Syne } from 'next/font/google'
import './globals.css'
import { AudioProvider } from '@/components/shared/AudioContext'
import { DynamicBackground } from '@/components/shared/DynamicBackground'
import { ToastProvider } from '@/components/shared/Toast'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '700', '800'],
})

export const metadata: Metadata = {
  title: 'MUSE — Describe a feeling. Discover its soundtrack.',
  description:
    'MUSE translates your feelings into music using AI, pulling from mainstream and underground sources with emotional precision.',
  openGraph: {
    title: 'MUSE — Describe a feeling. Discover its soundtrack.',
    description: 'Type a feeling. Get a playlist tuned to your exact emotional frequency.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MUSE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MUSE — Describe a feeling. Discover its soundtrack.',
    description: 'Type a feeling. Get a playlist tuned to your exact emotional frequency.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#080810',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased`}>
        <ToastProvider>
          <AudioProvider>
            <DynamicBackground />
            {children}
          </AudioProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
