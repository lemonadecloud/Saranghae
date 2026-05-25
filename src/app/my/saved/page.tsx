'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookmarkPlus, ArrowRight, Search, X } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getAllExpressions, getAllArtists } from '@/lib/data'
import ExpressionCard from '@/components/ExpressionCard'
import { Difficulty } from '@/types'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '🟢 Beginner',
  elementary: '🟡 Elementary',
  intermediate: '🟠 Intermediate',
}

export default function SavedPage() {
  const [savedIds] = useLocalStorage<string[]>('kpk_saved', [])
  const [query, setQuery] = useState('')
  const [artistFilter, setArtistFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | ''>('')

  const allExpressions = getAllExpressions()
  const artists = getAllArtists()

  const savedExpressions = useMemo(
    () =>
      savedIds
        .map((id) => allExpressions.find((e) => e.id === id))
        .filter(Boolean) as typeof allExpressions,
    [savedIds, allExpressions],
  )

  const savedArtistIds = useMemo(
    () => [...new Set(savedExpressions.map((e) => e.artistId))],
    [savedExpressions],
  )

  const filtered = useMemo(() => {
    let result = savedExpressions
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.korean.includes(q) ||
          e.meaningEn.toLowerCase().includes(q) ||
          e.romanization.toLowerCase().includes(q),
      )
    }
    if (artistFilter) result = result.filter((e) => e.artistId === artistFilter)
    if (difficultyFilter) result = result.filter((e) => e.difficulty === difficultyFilter)
    return result
  }, [savedExpressions, query, artistFilter, difficultyFilter])

  if (savedExpressions.length === 0) {
    return (
      <div className="text-center py-24">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          <BookmarkPlus size={28} className="text-brand-cyan opacity-60" />
        </div>
        <p className="text-text-primary font-semibold text-lg mb-2">No saved expressions yet</p>
        <p className="text-text-muted text-sm mb-8">
          Hit the <span className="text-brand-cyan font-medium">Save</span> button on any expression
          card to keep it here.
        </p>
        <Link
          href="/expressions"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(90deg, #FF2D78, #FF6B35)' }}
        >
          Browse Expressions <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search saved expressions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-card text-text-primary placeholder:text-text-muted text-sm outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,45,120,0.5)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      {(savedArtistIds.length > 1 || true) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {savedArtistIds.length > 1 && (
            <>
              <button
                onClick={() => setArtistFilter('')}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: artistFilter === '' ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${artistFilter === '' ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
                  color: artistFilter === '' ? '#FF2D78' : '#9090B0',
                }}
              >
                All Artists
              </button>
              {savedArtistIds.map((id) => {
                const artist = artists.find((a) => a.id === id)
                if (!artist) return null
                return (
                  <button
                    key={id}
                    onClick={() => setArtistFilter(id === artistFilter ? '' : id)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background:
                        artistFilter === id ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${artistFilter === id ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
                      color: artistFilter === id ? '#FF2D78' : '#9090B0',
                    }}
                  >
                    {artist.shortName}
                  </button>
                )
              })}
              <span className="w-px self-stretch bg-white/10 mx-1" />
            </>
          )}
          {(['', 'beginner', 'elementary', 'intermediate'] as (Difficulty | '')[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background:
                  difficultyFilter === d ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${difficultyFilter === d ? '#00D4FF' : 'rgba(255,255,255,0.08)'}`,
                color: difficultyFilter === d ? '#00D4FF' : '#9090B0',
              }}
            >
              {d === '' ? 'All Levels' : DIFFICULTY_LABELS[d as Difficulty]}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-text-muted text-sm mb-4">
        {filtered.length === savedExpressions.length
          ? `${savedExpressions.length} expressions saved`
          : `${filtered.length} of ${savedExpressions.length} expressions`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-medium mb-1">No matches</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((expr) => {
            const artist = artists.find((a) => a.id === expr.artistId)
            return <ExpressionCard key={expr.id} expression={expr} artist={artist} />
          })}
        </div>
      )}
    </>
  )
}
