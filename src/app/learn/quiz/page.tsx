'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { getAllExpressions, getAllArtists } from '@/lib/data'
import { Expression } from '@/types'
import { CheckCircle, XCircle, Flame, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ArtistBadge } from '@/components/Badge'
import { useStudyStats } from '@/hooks/useStudyStats'

type Stage = 'setup' | 'quiz' | 'result'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestions(expressions: Expression[], count: number) {
  const pool = shuffle(expressions).slice(0, count)
  return pool.map((expr) => {
    const wrong = shuffle(expressions.filter((e) => e.id !== expr.id))
      .slice(0, 3)
      .map((e) => e.meaningEn)
    const options = shuffle([expr.meaningEn, ...wrong])
    return { expression: expr, answer: expr.meaningEn, options }
  })
}

export default function QuizPage() {
  const allExpressions = getAllExpressions()
  const artists = getAllArtists()
  const { recordQuiz } = useStudyStats()

  const [stage, setStage] = useState<Stage>('setup')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<ReturnType<typeof buildQuestions>>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [statsSaved, setStatsSaved] = useState(false)

  const startQuiz = useCallback(() => {
    const qs = buildQuestions(allExpressions, questionCount)
    setQuestions(qs)
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setStatsSaved(false)
    setStage('quiz')
  }, [allExpressions, questionCount])

  useEffect(() => {
    if (stage === 'result' && !statsSaved && questions.length > 0) {
      recordQuiz(questions.length, score, maxStreak)
      setStatsSaved(true)
    }
  }, [stage, statsSaved, questions.length, score, maxStreak, recordQuiz])

  const handleSelect = useCallback(
    (option: string) => {
      if (selected !== null) return
      setSelected(option)
      const correct = option === questions[current].answer
      if (correct) {
        setScore((s) => s + 1)
        setStreak((s) => {
          const next = s + 1
          setMaxStreak((m) => Math.max(m, next))
          return next
        })
      } else {
        setStreak(0)
      }
    },
    [selected, questions, current]
  )

  const next = useCallback(() => {
    if (current + 1 >= questions.length) {
      setStage('result')
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }, [current, questions.length])

  if (stage === 'setup') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Study Modes
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mb-8">Quiz Setup</h1>

        <div className="mb-8">
          <label className="text-text-secondary text-sm font-semibold mb-3 block">Questions</label>
          <div className="flex gap-3">
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: questionCount === n ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${questionCount === n ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
                  color: questionCount === n ? '#FF2D78' : '#9090B0',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg, #FF2D78, #7B61FF)', boxShadow: '0 0 24px rgba(255,45,120,0.3)' }}
        >
          Start Quiz
        </button>
      </div>
    )
  }

  if (stage === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const grade = pct >= 90 ? 'Legend 🏆' : pct >= 70 ? 'K-Pop Star ⭐' : pct >= 50 ? 'K-Pop Idol 🎤' : 'K-Pop Rookie 🌱'
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">{pct >= 80 ? '🎉' : '💪'}</div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Quiz Complete!</h2>
        <p className="text-text-muted mb-8">{score} out of {questions.length} correct</p>

        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-5xl font-display text-text-primary mb-1">{pct}%</div>
          <div className="text-brand-pink font-semibold mt-1">{grade}</div>
          {maxStreak > 0 && (
            <div className="flex items-center justify-center gap-1 mt-3 text-warning text-sm">
              <Flame size={16} /> Best streak: {maxStreak}
            </div>
          )}
          <div className="w-full h-2 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: pct >= 80 ? '#00CC66' : pct >= 50 ? '#FFB800' : '#FF2D78' }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStage('setup')}
            className="flex-1 py-3 rounded-xl font-semibold text-text-primary"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            New Setup
          </button>
          <button
            onClick={startQuiz}
            className="flex-1 py-3 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #FF2D78, #7B61FF)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const cardArtist = artists.find((a) => a.id === q.expression.artistId)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-muted text-sm">{current + 1} / {questions.length}</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-success font-semibold">✓ {score}</span>
          {streak >= 2 && (
            <span className="flex items-center gap-1 text-warning font-bold">
              <Flame size={14} /> {streak}
            </span>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${((current) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #FF2D78, #7B61FF)' }}
        />
      </div>

      {/* Question */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #12121A, #1A1A2E)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-4">What does this expression mean?</p>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {cardArtist && <ArtistBadge name={cardArtist.shortName} color={cardArtist.color} />}
        </div>
        <p className="text-3xl font-serif text-text-primary">{q.expression.korean}</p>
        <p className="text-text-muted font-mono text-sm mt-2">{q.expression.romanization}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-6">
        {q.options.map((option) => {
          const isCorrect = option === q.answer
          const isSelected = option === selected

          let borderColor = 'rgba(255,255,255,0.08)'
          let bg = 'rgba(255,255,255,0.03)'
          let textColor = '#9090B0'
          let icon = null

          if (selected !== null) {
            if (isCorrect) {
              borderColor = '#00CC66'
              bg = 'rgba(0,204,102,0.1)'
              textColor = '#00CC66'
              icon = <CheckCircle size={18} className="text-success flex-shrink-0" />
            } else if (isSelected && !isCorrect) {
              borderColor = '#FF4466'
              bg = 'rgba(255,68,102,0.1)'
              textColor = '#FF4466'
              icon = <XCircle size={18} className="text-error flex-shrink-0" />
            }
          } else if (isSelected) {
            borderColor = '#FF2D78'
            bg = 'rgba(255,45,120,0.1)'
            textColor = '#FF2D78'
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3"
              style={{ background: bg, border: `1px solid ${borderColor}`, color: textColor }}
            >
              {icon}
              <span className="flex-1">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Next button */}
      {selected !== null && (
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg, #FF2D78, #7B61FF)' }}
        >
          {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  )
}
