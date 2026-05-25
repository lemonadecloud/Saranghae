'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookmarkPlus, BarChart2 } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useStudyStats } from '@/hooks/useStudyStats'

const tabs = [
  { href: '/my/saved', label: 'Saved', icon: BookmarkPlus },
  { href: '/my/stats', label: 'Stats', icon: BarChart2 },
]

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [savedIds] = useLocalStorage<string[]>('kpk_saved', [])
  const { stats } = useStudyStats()

  const totalSessions = stats.flashcardSessions + stats.quizSessions

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-1">My Page</h1>
        <p className="text-text-muted text-sm">
          {savedIds.length} saved · {totalSessions} study sessions
        </p>
      </div>

      <div
        className="flex gap-1 p-1 rounded-xl mb-8 w-fit"
        style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: active ? 'rgba(255,45,120,0.15)' : 'transparent',
                color: active ? '#FF2D78' : '#5A5A7A',
                border: active ? '1px solid rgba(255,45,120,0.3)' : '1px solid transparent',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
