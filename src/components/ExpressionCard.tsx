'use client'

import Link from 'next/link'
import { Heart, BookmarkPlus, Volume2 } from 'lucide-react'
import { Expression, Artist } from '@/types'
import { SourceBadge, DifficultyBadge, ArtistBadge } from './Badge'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ExpressionCardProps {
  expression: Expression
  artist?: Artist
  compact?: boolean
}

export default function ExpressionCard({ expression, artist, compact = false }: ExpressionCardProps) {
  const [savedIds, setSavedIds] = useLocalStorage<string[]>('kpk_saved', [])
  const isSaved = savedIds.includes(expression.id)

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedIds((prev) =>
      prev.includes(expression.id) ? prev.filter((id) => id !== expression.id) : [...prev, expression.id],
    )
  }
  if (compact) {
    return (
      <Link href={`/expressions/${expression.id}`}>
        <div className="expression-card p-5 cursor-pointer h-full flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {artist && <ArtistBadge name={artist.shortName} color={artist.color} />}
            <SourceBadge type={expression.sourceType} />
            <DifficultyBadge level={expression.difficulty} />
          </div>

          <p className="text-xl font-serif text-text-primary leading-snug">
            {expression.korean}
          </p>

          <p className="text-text-secondary text-sm line-clamp-2 flex-1">
            {expression.meaningEn}
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-text-muted">
              <Heart size={12} /> {expression.likes.toLocaleString()}
            </span>
            <button
              onClick={toggleSave}
              className="flex items-center gap-1 transition-colors"
              style={{ color: isSaved ? '#00D4FF' : '#5A5A7A' }}
              aria-label={isSaved ? 'Unsave' : 'Save'}
            >
              <BookmarkPlus size={12} fill={isSaved ? '#00D4FF' : 'none'} strokeWidth={isSaved ? 0 : 2} />
              {isSaved ? 'Saved' : expression.saves.toLocaleString()}
            </button>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/expressions/${expression.id}`}>
      <div className="expression-card p-6 cursor-pointer flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {artist && <ArtistBadge name={artist.shortName} color={artist.color} />}
            <SourceBadge type={expression.sourceType} />
          </div>
          <DifficultyBadge level={expression.difficulty} />
        </div>

        {/* Korean text */}
        <div>
          <p className="text-2xl font-serif text-text-primary leading-snug mb-1">
            {expression.korean}
          </p>
          <p className="text-text-muted text-sm font-mono">{expression.romanization}</p>
        </div>

        {/* Meaning */}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 flex-1">
          {expression.meaningEn}
        </p>

        {/* Source */}
        <p className="text-text-muted text-xs truncate">{expression.sourceDetail}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-text-muted">
              <Heart size={13} /> {expression.likes.toLocaleString()}
            </span>
            <button
              onClick={toggleSave}
              className="flex items-center gap-1 transition-colors"
              style={{ color: isSaved ? '#00D4FF' : '#5A5A7A' }}
              aria-label={isSaved ? 'Unsave' : 'Save'}
            >
              <BookmarkPlus size={13} fill={isSaved ? '#00D4FF' : 'none'} strokeWidth={isSaved ? 0 : 2} />
              {isSaved ? 'Saved' : expression.saves.toLocaleString()}
            </button>
          </div>
          <Volume2 size={16} className="text-brand-cyan opacity-60" />
        </div>
      </div>
    </Link>
  )
}
