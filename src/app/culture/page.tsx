'use client'

import { useState } from 'react'
import { Tv, Users, ChevronDown, ChevronUp, BookmarkPlus, BookmarkCheck, Volume2 } from 'lucide-react'
import { getAllShows, getAllCultureExpressions, getShowById } from '@/lib/culture-data'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { ShowGenre } from '@/types'

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#4ADE80',
  elementary: '#60A5FA',
  intermediate: '#F472B6',
}

export default function CulturePage() {
  const shows = getAllShows()
  const allExpressions = getAllCultureExpressions()

  const [genre, setGenre] = useState<ShowGenre | 'all'>('all')
  const [activeShow, setActiveShow] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useLocalStorage<string[]>('kpk_saved', [])

  const filteredShows = genre === 'all' ? shows : shows.filter(s => s.genre === genre)
  const expressions = allExpressions.filter(e => {
    const show = getShowById(e.showId)
    if (!show) return false
    if (genre !== 'all' && show.genre !== genre) return false
    if (activeShow && e.showId !== activeShow) return false
    return true
  })

  function toggleSave(id: string) {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">드라마 & 예능</h1>
        <p className="text-text-muted">인기 한국 드라마와 예능에서 배우는 실전 표현들</p>
      </div>

      {/* Genre filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'drama', 'variety'] as const).map(g => (
          <button
            key={g}
            onClick={() => { setGenre(g); setActiveShow(null) }}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: genre === g ? '#FF2D78' : 'rgba(255,255,255,0.05)',
              color: genre === g ? '#fff' : '#9090B0',
              border: `1px solid ${genre === g ? '#FF2D78' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {g === 'all' ? '전체' : g === 'drama' ? '📺 드라마' : '🎉 예능'}
          </button>
        ))}
      </div>

      {/* Show chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveShow(null)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: !activeShow ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
            color: !activeShow ? '#E0E0F0' : '#6060A0',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          전체 프로그램
        </button>
        {filteredShows.map(show => (
          <button
            key={show.id}
            onClick={() => setActiveShow(prev => prev === show.id ? null : show.id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: activeShow === show.id ? `${show.color}22` : 'rgba(255,255,255,0.05)',
              color: activeShow === show.id ? show.color : '#6060A0',
              border: `1px solid ${activeShow === show.id ? show.color + '55' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {show.titleKo}
          </button>
        ))}
      </div>

      {/* Expression count */}
      <p className="text-text-muted text-sm mb-5">
        {expressions.length}개의 표현
      </p>

      {/* Expression list */}
      <div className="flex flex-col gap-3">
        {expressions.map(expr => {
          const show = getShowById(expr.showId)
          if (!show) return null
          const isSaved = savedIds.includes(expr.id)
          const isExpanded = expandedId === expr.id

          return (
            <div
              key={expr.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
                border: `1px solid ${isExpanded ? show.color + '44' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isExpanded ? `0 0 24px ${show.color}11` : 'none',
              }}
            >
              {/* Card header */}
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-4"
                onClick={() => setExpandedId(prev => prev === expr.id ? null : expr.id)}
              >
                {/* Show badge */}
                <div
                  className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold mt-0.5"
                  style={{ background: `${show.color}18`, color: show.color }}
                >
                  {show.titleKo}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-bold text-base leading-snug mb-1">{expr.korean}</p>
                  <p className="text-text-muted text-sm truncate">{expr.meaningEn}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2 mt-0.5">
                  {expr.episode && (
                    <span className="text-xs text-text-muted">{expr.episode}</span>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-text-muted" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                  {/* Romanization */}
                  <p
                    className="text-sm mb-3 font-mono"
                    style={{ color: show.color + 'CC' }}
                  >
                    {expr.romanization}
                  </p>

                  {/* Meanings */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-xs text-text-muted mb-1 font-semibold">뜻 (한국어)</p>
                      <p className="text-text-primary text-sm">{expr.meaningKo}</p>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-xs text-text-muted mb-1 font-semibold">Meaning (EN)</p>
                      <p className="text-text-primary text-sm">{expr.meaningEn}</p>
                    </div>
                  </div>

                  {/* Nuance note */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: `${show.color}0C`, border: `1px solid ${show.color}22` }}
                  >
                    <p className="text-xs font-semibold mb-1.5" style={{ color: show.color }}>뉘앙스 포인트</p>
                    <p className="text-text-primary text-sm leading-relaxed">{expr.nuanceNote}</p>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{
                          background: `${DIFFICULTY_COLOR[expr.difficulty]}18`,
                          color: DIFFICULTY_COLOR[expr.difficulty],
                        }}
                      >
                        {expr.difficulty}
                      </span>
                      {expr.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#6060A0' }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleSave(expr.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                      style={{
                        background: isSaved ? `${show.color}22` : 'rgba(255,255,255,0.06)',
                        color: isSaved ? show.color : '#6060A0',
                        border: `1px solid ${isSaved ? show.color + '44' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {isSaved ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
                      {isSaved ? '저장됨' : '저장'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {expressions.length === 0 && (
        <div className="text-center py-20">
          <Tv size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-text-muted">이 카테고리에 표현이 없어요</p>
        </div>
      )}
    </div>
  )
}
