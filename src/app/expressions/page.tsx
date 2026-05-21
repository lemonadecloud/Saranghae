'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getAllExpressions, getAllArtists } from '@/lib/data'
import ExpressionCard from '@/components/ExpressionCard'
import { SourceType, Difficulty } from '@/types'

const SOURCE_LABELS: Record<SourceType, string> = {
  interview: 'Interview',
  variety: 'Variety Show',
  lyrics: 'Lyrics',
  sns: 'SNS',
  behind: 'Behind',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '🟢 Beginner',
  elementary: '🟡 Elementary',
  intermediate: '🟠 Intermediate',
}

export default function ExpressionsPage() {
  const allExpressions = getAllExpressions()
  const artists = getAllArtists()

  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceType | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | ''>('')
  const [artistFilter, setArtistFilter] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'easiest'>('popular')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = allExpressions

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.korean.includes(q) ||
          e.meaningEn.toLowerCase().includes(q) ||
          e.romanization.toLowerCase().includes(q) ||
          artists.find((a) => a.id === e.artistId)?.nameEn.toLowerCase().includes(q) ||
          artists.find((a) => a.id === e.artistId)?.nameKo.includes(q)
      )
    }
    if (sourceFilter) result = result.filter((e) => e.sourceType === sourceFilter)
    if (difficultyFilter) result = result.filter((e) => e.difficulty === difficultyFilter)
    if (artistFilter) result = result.filter((e) => e.artistId === artistFilter)

    if (sortBy === 'popular') result = [...result].sort((a, b) => b.likes - a.likes)
    else if (sortBy === 'newest') result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else if (sortBy === 'easiest') {
      const order: Record<Difficulty, number> = { beginner: 0, elementary: 1, intermediate: 2 }
      result = [...result].sort((a, b) => order[a.difficulty] - order[b.difficulty])
    }

    return result
  }, [allExpressions, artists, query, sourceFilter, difficultyFilter, artistFilter, sortBy])

  const hasFilters = sourceFilter || difficultyFilter || artistFilter

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Explore Expressions</h1>
        <p className="text-text-muted">{allExpressions.length} real K-pop expressions</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search Korean, English meaning, artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-card text-text-primary placeholder:text-text-muted text-sm outline-none transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(255,45,120,0.5)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: hasFilters ? 'rgba(255,45,120,0.15)' : '#12121A',
            border: `1px solid ${hasFilters ? 'rgba(255,45,120,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: hasFilters ? '#FF2D78' : '#9090B0',
          }}
        >
          <SlidersHorizontal size={16} />
          Filters{hasFilters ? ` (${[sourceFilter, difficultyFilter, artistFilter].filter(Boolean).length})` : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          className="mb-6 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Source */}
          <div>
            <p className="text-text-muted text-xs mb-2 font-semibold uppercase tracking-wider">Category</p>
            <div className="flex flex-wrap gap-2">
              {(['', ...Object.keys(SOURCE_LABELS)] as (SourceType | '')[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: sourceFilter === s ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${sourceFilter === s ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
                    color: sourceFilter === s ? '#FF2D78' : '#9090B0',
                  }}
                >
                  {s === '' ? 'All' : SOURCE_LABELS[s as SourceType]}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-text-muted text-xs mb-2 font-semibold uppercase tracking-wider">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {(['', 'beginner', 'elementary', 'intermediate'] as (Difficulty | '')[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: difficultyFilter === d ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${difficultyFilter === d ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
                    color: difficultyFilter === d ? '#FF2D78' : '#9090B0',
                  }}
                >
                  {d === '' ? 'All' : DIFFICULTY_LABELS[d as Difficulty]}
                </button>
              ))}
            </div>
          </div>

          {/* Artist */}
          <div>
            <p className="text-text-muted text-xs mb-2 font-semibold uppercase tracking-wider">Artist</p>
            <div className="flex flex-wrap gap-2">
              {[{ id: '', shortName: 'All' }, ...artists].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArtistFilter(a.id)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: artistFilter === a.id ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${artistFilter === a.id ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
                    color: artistFilter === a.id ? '#FF2D78' : '#9090B0',
                  }}
                >
                  {a.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-text-muted text-xs mb-2 font-semibold uppercase tracking-wider">Sort</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'easiest', label: 'Easiest' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value as typeof sortBy)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: sortBy === value ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${sortBy === value ? '#00D4FF' : 'rgba(255,255,255,0.08)'}`,
                    color: sortBy === value ? '#00D4FF' : '#9090B0',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-text-muted text-xs">Filters:</span>
          {sourceFilter && (
            <button onClick={() => setSourceFilter('')} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-pink/15 text-brand-pink border border-brand-pink/40">
              {SOURCE_LABELS[sourceFilter]} <X size={11} />
            </button>
          )}
          {difficultyFilter && (
            <button onClick={() => setDifficultyFilter('')} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-pink/15 text-brand-pink border border-brand-pink/40">
              {DIFFICULTY_LABELS[difficultyFilter]} <X size={11} />
            </button>
          )}
          {artistFilter && (
            <button onClick={() => setArtistFilter('')} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-pink/15 text-brand-pink border border-brand-pink/40">
              {artists.find((a) => a.id === artistFilter)?.shortName} <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-text-muted text-sm mb-6">
        {filtered.length} expressions
        {query && ` — results for "${query}"`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-text-muted">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-medium mb-2">No expressions found</p>
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
    </div>
  )
}
