import type { Metadata } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR, Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KPop Korean — Learn Korean Through Artists You Love',
  description:
    'Learn Korean with real expressions from your favorite K-pop artists — TXT, TWICE, aespa, NewJeans, and BTS.',
  keywords: 'Korean learning, K-pop, Korean expressions, TXT, TWICE, aespa, NewJeans, BTS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSansKR.variable} ${notoSerifKR.variable} ${bebasNeue.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-bg-base text-text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
            <p className="font-display tracking-widest text-lg text-brand-pink mb-2">KPOP KOREAN</p>
            <p>Learn Korean through the artists you love. © 2026 KPop Korean</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
