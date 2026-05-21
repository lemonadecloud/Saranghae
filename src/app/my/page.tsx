'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookmarkPlus, BarChart2, Layers, HelpCircle, Flame, Target, ArrowRight } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useStudyStats } from '@/hooks/useStudyStats'
import { getAllExpressions, getAllArtists } from '@/lib/data'
import ExpressionCard from '@/components/ExpressionCard'

type Tab = 'saved' | 'stats'

export default function MyPage() {
  const [tab, setTab] = useState<Tab>('saved')
  const [savedIds] = useLocalStorage<string[]>('kpk_saved', [])
  const { stats } = useStudyStats()

  const allExpressions = getAllExpressions()
  const artists = getAllArtists()

  const savedExpressions = savedIds
    .map((id) => allExpressions.find((e) => e.id === id))
    .filter(Boolean) as typeof allExpressions

  const quizAccuracy =
    stats.quizQuestions > 0
      ? Math.round((stats.quizCorrect / stats.quizQuestions) * 100)
      : null

  const totalSessions = stats.flashcardSessions + stats.quizSessions

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-1">My Page</h1>
        <p className="text-text-muted text-sm">
          {savedExpressions.length} saved · {totalSessions} study sessions
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-8 w-fit"
        style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {([
          { id: 'saved' as Tab, label: 'Saved', icon: BookmarkPlus },
          { id: 'stats' as Tab, label: 'Stats', icon: BarChart2 },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === id ? 'rgba(255,45,120,0.15)' : 'transparent',
              color: tab === id ? '#FF2D78' : '#5A5A7A',
              border: tab === id ? '1px solid rgba(255,45,120,0.3)' : '1px solid transparent',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Saved tab */}
      {tab === 'saved' && (
        <>
          {savedExpressions.length === 0 ? (
            <div className="text-center py-24">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
              >
                <BookmarkPlus size={28} className="text-brand-cyan opacity-60" />
              </div>
              <p className="text-text-primary font-semibold text-lg mb-2">No saved expressions yet</p>
              <p className="text-text-muted text-sm mb-8">
                Hit the <span className="text-brand-cyan font-medium">Save</span> button on any expression card to keep it here.
              </p>
              <Link
                href="/expressions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(90deg, #FF2D78, #FF6B35)' }}
              >
                Browse Expressions <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <p className="text-text-muted text-sm mb-4">{savedExpressions.length} expressions saved</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedExpressions.map((expr) => {
                  const artist = artists.find((a) => a.id === expr.artistId)
                  return <ExpressionCard key={expr.id} expression={expr} artist={artist} />
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <>
          {totalSessions === 0 ? (
            <div className="text-center py-24">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)' }}
              >
                <BarChart2 size={28} className="text-brand-pink opacity-60" />
              </div>
              <p className="text-text-primary font-semibold text-lg mb-2">No study data yet</p>
              <p className="text-text-muted text-sm mb-8">
                Complete a flashcard or quiz session to see your stats here.
              </p>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(90deg, #FF2D78, #FF6B35)' }}
              >
                Start Studying <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Flashcard sessions */}
              <StatCard
                icon={Layers}
                color="#00D4FF"
                label="Flashcard Sessions"
                value={stats.flashcardSessions}
              />
              {/* Cards studied */}
              <StatCard
                icon={BookmarkPlus}
                color="#00D4FF"
                label="Cards Studied"
                value={stats.flashcardCards}
              />
              {/* Quiz sessions */}
              <StatCard
                icon={HelpCircle}
                color="#FF2D78"
                label="Quiz Sessions"
                value={stats.quizSessions}
              />
              {/* Quiz accuracy */}
              <StatCard
                icon={Target}
                color="#FF2D78"
                label="Quiz Accuracy"
                value={quizAccuracy !== null ? `${quizAccuracy}%` : '—'}
                sub={stats.quizQuestions > 0 ? `${stats.quizCorrect} / ${stats.quizQuestions} correct` : undefined}
              />
              {/* Best streak */}
              <StatCard
                icon={Flame}
                color="#FFB800"
                label="Best Streak"
                value={stats.bestStreak > 0 ? `🔥 ${stats.bestStreak}` : '—'}
                sub="consecutive correct answers"
              />
              {/* Total sessions */}
              <StatCard
                icon={BarChart2}
                color="#7B61FF"
                label="Total Sessions"
                value={totalSessions}
                sub={`${stats.flashcardSessions} FC · ${stats.quizSessions} Quiz`}
              />
            </div>
          )}

          {totalSessions > 0 && (
            <div className="mt-8 flex gap-3 justify-center">
              <Link
                href="/learn/flashcard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}
              >
                <Layers size={15} /> More Flashcards
              </Link>
              <Link
                href="/learn/quiz"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)', color: '#FF2D78' }}
              >
                <HelpCircle size={15} /> Take a Quiz
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  color: string
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
        border: `1px solid ${color}22`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, color }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-text-muted text-xs mt-0.5">{label}</p>
        {sub && <p className="text-text-muted text-xs mt-1 opacity-60">{sub}</p>}
      </div>
    </div>
  )
}
