'use client'

import Link from 'next/link'
import {
  BarChart2,
  Layers,
  HelpCircle,
  Flame,
  Target,
  BookmarkPlus,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react'
import { useStudyStats } from '@/hooks/useStudyStats'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function StatsPage() {
  const { stats } = useStudyStats()
  const [savedIds] = useLocalStorage<string[]>('kpk_saved', [])

  const totalSessions = stats.flashcardSessions + stats.quizSessions
  const quizAccuracy =
    stats.quizQuestions > 0
      ? Math.round((stats.quizCorrect / stats.quizQuestions) * 100)
      : null

  const avgCardsPerSession =
    stats.flashcardSessions > 0
      ? Math.round(stats.flashcardCards / stats.flashcardSessions)
      : 0

  const avgCorrectPerQuiz =
    stats.quizSessions > 0
      ? Math.round(stats.quizQuestions / stats.quizSessions)
      : 0

  if (totalSessions === 0) {
    return (
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
    )
  }

  return (
    <>
      {/* Overview banner */}
      <div
        className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,45,120,0.12), rgba(123,97,255,0.12))',
          border: '1px solid rgba(255,45,120,0.2)',
        }}
      >
        <div className="flex-1">
          <p className="text-text-muted text-sm mb-1">Total Study Sessions</p>
          <p className="text-4xl font-bold text-text-primary">{totalSessions}</p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-brand-cyan">{stats.flashcardSessions}</p>
            <p className="text-text-muted text-xs mt-0.5">Flashcard</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-brand-pink">{stats.quizSessions}</p>
            <p className="text-text-muted text-xs mt-0.5">Quiz</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{savedIds.length}</p>
            <p className="text-text-muted text-xs mt-0.5">Saved</p>
          </div>
        </div>
      </div>

      {/* Flashcard stats */}
      {stats.flashcardSessions > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
            <Layers size={14} className="text-brand-cyan" /> Flashcard
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              icon={Layers}
              color="#00D4FF"
              label="Sessions"
              value={stats.flashcardSessions}
            />
            <StatCard
              icon={BookmarkPlus}
              color="#00D4FF"
              label="Total Cards"
              value={stats.flashcardCards}
            />
            <StatCard
              icon={TrendingUp}
              color="#00D4FF"
              label="Avg per Session"
              value={avgCardsPerSession}
              sub="cards"
            />
          </div>
        </section>
      )}

      {/* Quiz stats */}
      {stats.quizSessions > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
            <HelpCircle size={14} className="text-brand-pink" /> Quiz
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              icon={HelpCircle}
              color="#FF2D78"
              label="Sessions"
              value={stats.quizSessions}
            />
            <StatCard
              icon={Target}
              color="#FF2D78"
              label="Accuracy"
              value={quizAccuracy !== null ? `${quizAccuracy}%` : '—'}
              sub={`${stats.quizCorrect} / ${stats.quizQuestions} correct`}
            />
            <StatCard
              icon={Zap}
              color="#FF2D78"
              label="Avg Questions"
              value={avgCorrectPerQuiz}
              sub="per session"
            />
          </div>
        </section>
      )}

      {/* Streak */}
      {stats.bestStreak > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
            <Flame size={14} className="text-yellow-400" /> Streak
          </h2>
          <div
            className="rounded-2xl p-6 flex items-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,107,53,0.1))',
              border: '1px solid rgba(255,184,0,0.2)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'rgba(255,184,0,0.15)' }}
            >
              🔥
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{stats.bestStreak}</p>
              <p className="text-text-muted text-sm">Best streak — consecutive correct quiz answers</p>
            </div>
          </div>
        </section>
      )}

      {/* Badges */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <Award size={14} className="text-purple-400" /> Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Badge
            emoji="📚"
            label="First Session"
            unlocked={totalSessions >= 1}
          />
          <Badge
            emoji="🔟"
            label="10 Sessions"
            unlocked={totalSessions >= 10}
          />
          <Badge
            emoji="💯"
            label="100 Cards"
            unlocked={stats.flashcardCards >= 100}
          />
          <Badge
            emoji="🎯"
            label="80% Accuracy"
            unlocked={quizAccuracy !== null && quizAccuracy >= 80}
          />
        </div>
      </section>

      {/* CTA */}
      <div className="flex gap-3 justify-center mt-4">
        <Link
          href="/learn/flashcard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#00D4FF',
          }}
        >
          <Layers size={15} /> More Flashcards
        </Link>
        <Link
          href="/learn/quiz"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(255,45,120,0.12)',
            border: '1px solid rgba(255,45,120,0.3)',
            color: '#FF2D78',
          }}
        >
          <HelpCircle size={15} /> Take a Quiz
        </Link>
      </div>
    </>
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

function Badge({ emoji, label, unlocked }: { emoji: string; label: string; unlocked: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
      style={{
        background: unlocked ? 'rgba(123,97,255,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${unlocked ? 'rgba(123,97,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
        opacity: unlocked ? 1 : 0.45,
        filter: unlocked ? 'none' : 'grayscale(1)',
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs text-center font-medium" style={{ color: unlocked ? '#B4A4FF' : '#5A5A7A' }}>
        {label}
      </p>
    </div>
  )
}
