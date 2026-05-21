'use client'

import { useState, useCallback, useEffect } from 'react'
import { getAllExpressions, getAllArtists } from '@/lib/data'
import { Expression } from '@/types'
import { Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ArtistBadge, SourceBadge, DifficultyBadge } from '@/components/Badge'
import AudioButton from '@/components/AudioButton'
import { useStudyStats } from '@/hooks/useStudyStats'

type Stage = 'setup' | 'study' | 'result'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function FlashcardPage() {
  const allExpressions = getAllExpressions()
  const artists = getAllArtists()
  const { recordFlashcard } = useStudyStats()

  const [stage, setStage] = useState<Stage>('setup')
  const [cardCount, setCardCount] = useState(10)
  const [selectedArtist, setSelectedArtist] = useState('')
  const [deck, setDeck] = useState<Expression[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<string[]>([])
  const [unknown, setUnknown] = useState<string[]>([])
  const [statsSaved, setStatsSaved] = useState(false)

  const startStudy = useCallback(() => {
    let pool = selectedArtist ? allExpressions.filter((e) => e.artistId === selectedArtist) : allExpressions
    const shuffled = shuffle(pool).slice(0, cardCount)
    setDeck(shuffled)
    setIndex(0)
    setFlipped(false)
    setKnown([])
    setUnknown([])
    setStage('study')
  }, [allExpressions, selectedArtist, cardCount])

  const handleKnow = useCallback(() => {
    setKnown((prev) => [...prev, deck[index].id])
    if (index + 1 >= deck.length) setStage('result')
    else { setIndex(index + 1); setFlipped(false) }
  }, [deck, index])

  const handleUnknown = useCallback(() => {
    setUnknown((prev) => [...prev, deck[index].id])
    if (index + 1 >= deck.length) setStage('result')
    else { setIndex(index + 1); setFlipped(false) }
  }, [deck, index])

  const restart = () => {
    setStage('setup')
    setFlipped(false)
    setIndex(0)
    setStatsSaved(false)
  }

  useEffect(() => {
    if (stage === 'result' && !statsSaved) {
      recordFlashcard(deck.length)
      setStatsSaved(true)
    }
  }, [stage, statsSaved, deck.length, recordFlashcard])

  if (stage === 'setup') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Study Modes
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mb-8">Flashcard Setup</h1>

        {/* Artist select */}
        <div className="mb-6">
          <label className="text-text-secondary text-sm font-semibold mb-3 block">Artist</label>
          <div className="flex flex-wrap gap-2">
            {[{ id: '', shortName: 'All', color: '#9090B0' }, ...artists].map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedArtist(a.id)}
                className="text-sm px-4 py-2 rounded-full transition-all"
                style={{
                  background: selectedArtist === a.id ? `${a.color}22` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedArtist === a.id ? a.color : 'rgba(255,255,255,0.08)'}`,
                  color: selectedArtist === a.id ? a.color : '#9090B0',
                }}
              >
                {a.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Card count */}
        <div className="mb-8">
          <label className="text-text-secondary text-sm font-semibold mb-3 block">Card Count</label>
          <div className="flex gap-3">
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setCardCount(n)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: cardCount === n ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${cardCount === n ? '#00D4FF' : 'rgba(255,255,255,0.08)'}`,
                  color: cardCount === n ? '#00D4FF' : '#9090B0',
                }}
              >
                {n} cards
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startStudy}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg, #FF2D78, #FF6B35)', boxShadow: '0 0 24px rgba(255,45,120,0.3)' }}
        >
          Start Studying
        </button>
      </div>
    )
  }

  if (stage === 'result') {
    const score = Math.round((known.length / deck.length) * 100)
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">{score >= 80 ? '🎉' : score >= 50 ? '💪' : '📚'}</div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Session Complete!</h2>
        <p className="text-text-muted mb-8">You knew {known.length} of {deck.length} cards</p>

        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-5xl font-display text-text-primary mb-1">{score}%</div>
          <div className="text-text-muted text-sm">Score</div>
          <div className="w-full h-2 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${score}%`, background: score >= 80 ? '#00CC66' : score >= 50 ? '#FFB800' : '#FF2D78' }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex-1 py-3 rounded-xl font-semibold text-text-primary transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            New Setup
          </button>
          <button
            onClick={startStudy}
            className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(90deg, #FF2D78, #FF6B35)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Study stage
  const card = deck[index]
  const cardArtist = artists.find((a) => a.id === card.artistId)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-text-muted text-sm">{index + 1} / {deck.length}</span>
        <div className="flex gap-2 text-xs">
          <span className="text-success">✓ {known.length}</span>
          <span className="text-error">✗ {unknown.length}</span>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${((index) / deck.length) * 100}%`, background: 'linear-gradient(90deg, #FF2D78, #00D4FF)' }}
        />
      </div>

      {/* Card */}
      <div
        className="rounded-2xl cursor-pointer select-none mb-6 overflow-hidden"
        style={{ perspective: '1000px', minHeight: '320px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="w-full h-full transition-all duration-500 relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '320px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
              border: '1px solid rgba(255,45,120,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              {cardArtist && <ArtistBadge name={cardArtist.shortName} color={cardArtist.color} />}
              <SourceBadge type={card.sourceType} />
            </div>
            <p className="text-4xl font-serif text-text-primary mb-4">{card.korean}</p>
            <p className="text-text-muted text-sm">Tap to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-8 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #1A1A2E, #12121A)',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
          >
            <div className="flex items-center justify-between">
              <DifficultyBadge level={card.difficulty} />
              <div onClick={(e) => e.stopPropagation()}>
                <AudioButton text={card.korean} />
              </div>
            </div>
            <div className="text-center">
              <p
                className="font-mono text-brand-cyan text-base mb-2 px-3 py-2 rounded-lg inline-block"
                style={{ background: 'rgba(0,212,255,0.06)', borderLeft: '3px solid #00D4FF' }}
              >
                {card.romanization}
              </p>
              <p className="text-text-primary text-lg leading-relaxed mt-4">{card.meaningEn}</p>
            </div>
            <p className="text-text-muted text-xs text-center">{card.sourceDetail}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleUnknown}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-error transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)' }}
        >
          <RotateCcw size={18} /> Review Again
        </button>
        <button
          onClick={handleKnow}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-success transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}
        >
          <Check size={18} /> Got it!
        </button>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-center gap-4 mt-4 text-text-muted text-sm">
        <button
          onClick={() => { if (index > 0) { setIndex(index - 1); setFlipped(false) } }}
          disabled={index === 0}
          className="flex items-center gap-1 disabled:opacity-30 hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => { if (index < deck.length - 1) { setIndex(index + 1); setFlipped(false) } }}
          disabled={index === deck.length - 1}
          className="flex items-center gap-1 disabled:opacity-30 hover:text-text-primary transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
