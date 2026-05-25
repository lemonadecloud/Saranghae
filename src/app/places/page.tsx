'use client'

import { useState } from 'react'
import { MapPin, ExternalLink, ShoppingBag, Tv, Tag, Map } from 'lucide-react'
import { getAllPlaces } from '@/lib/places-data'
import { PlaceCategory } from '@/types'

const CATEGORY_META: Record<PlaceCategory | 'all', { label: string; emoji: string; color: string }> = {
  all:        { label: 'All',           emoji: '🗺️',  color: '#FF2D78' },
  'idol-spot':{ label: 'Idol Spots',    emoji: '⭐',  color: '#FF2D78' },
  beauty:     { label: 'Beauty & Style',emoji: '💄',  color: '#F472B6' },
  fashion:    { label: 'Fashion',       emoji: '👗',  color: '#A855F7' },
  tourism:    { label: 'Tourism',       emoji: '📸',  color: '#22D3EE' },
}

const ARTIST_LABEL: Record<string, string> = {
  bts: 'BTS', txt: 'TXT', enhypen: 'ENHYPEN', lesserafim: 'LE SSERAFIM',
  seventeen: 'SEVENTEEN', aespa: 'aespa', twice: 'TWICE', straykids: 'Stray Kids',
  blackpink: 'BLACKPINK', ive: 'IVE', newjeans: 'NewJeans', exo: 'EXO',
}

export default function PlacesPage() {
  const allPlaces = getAllPlaces()
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = activeCategory === 'all'
    ? allPlaces
    : allPlaces.filter(p => p.category === activeCategory)

  const activeMeta = CATEGORY_META[activeCategory]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">K-pop Places</h1>
        <p className="text-text-muted">Real locations tied to K-pop idols — pilgrimage spots, style hotspots, and filming locations</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(CATEGORY_META) as (PlaceCategory | 'all')[]).map(cat => {
          const meta = CATEGORY_META[cat]
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setExpandedId(null) }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: active ? meta.color : 'rgba(255,255,255,0.05)',
                color: active ? '#fff' : '#9090B0',
                border: `1px solid ${active ? meta.color : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <p className="text-text-muted text-sm mb-5">{filtered.length} places</p>

      {/* Place cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(place => {
          const catMeta = CATEGORY_META[place.category]
          const isExpanded = expandedId === place.id

          return (
            <div
              key={place.id}
              className="rounded-2xl overflow-hidden transition-all duration-200 flex flex-col"
              style={{
                background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
                border: `1px solid ${isExpanded ? catMeta.color + '55' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isExpanded ? `0 0 28px ${catMeta.color}18` : 'none',
              }}
            >
              {/* Image slot */}
              <div
                className="w-full h-36 flex items-center justify-center shrink-0"
                style={{
                  background: place.imageUrl
                    ? `url(${place.imageUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${catMeta.color}18, ${catMeta.color}08)`,
                }}
              >
                {!place.imageUrl && (
                  <Map size={36} style={{ color: catMeta.color, opacity: 0.35 }} />
                )}
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col flex-1">
                {/* Category badge + artist chips */}
                <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: `${catMeta.color}22`, color: catMeta.color }}
                  >
                    {catMeta.emoji} {catMeta.label}
                  </span>
                  {place.artistIds.slice(0, 3).map(aid => (
                    <span
                      key={aid}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#B0B0D0' }}
                    >
                      {ARTIST_LABEL[aid] ?? aid}
                    </span>
                  ))}
                  {place.artistIds.length > 3 && (
                    <span className="text-xs text-text-muted">+{place.artistIds.length - 3}</span>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-text-primary font-bold text-base leading-tight mb-0.5">{place.nameEn}</h2>
                <p className="text-text-muted text-sm mb-3">{place.nameKo}</p>

                {/* Description (always English) */}
                <p
                  className="text-text-secondary text-sm leading-relaxed mb-3 flex-1"
                  style={{ display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? undefined : 2, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden' } as React.CSSProperties}
                >
                  {place.descriptionEn}
                </p>

                {/* Expand / collapse */}
                <button
                  onClick={() => setExpandedId(prev => prev === place.id ? null : place.id)}
                  className="text-xs font-semibold mb-3 text-left"
                  style={{ color: catMeta.color }}
                >
                  {isExpanded ? '− Show less' : '+ Show more'}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mb-3 space-y-2">
                    {/* Korean description */}
                    <div
                      className="rounded-xl p-3 text-sm text-text-secondary leading-relaxed"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {place.descriptionKo}
                    </div>

                    {/* Source show */}
                    {place.sourceShow && (
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Tv size={12} />
                        <span>Seen on: {place.sourceShow}</span>
                        {place.sourceUrl && (
                          <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 hover:opacity-80">
                            <ExternalLink size={11} style={{ color: catMeta.color }} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <Tag size={11} className="text-text-muted" />
                        {place.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#6060A0' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-white/5">
                  {/* Address + Google Maps */}
                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{
                      background: `${catMeta.color}18`,
                      color: catMeta.color,
                      border: `1px solid ${catMeta.color}33`,
                    }}
                  >
                    <MapPin size={12} />
                    Google Maps
                  </a>

                  {/* Purchase link (fashion / beauty) */}
                  {place.purchaseUrl && (
                    <a
                      href={place.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: '#B0B0D0',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      <ShoppingBag size={12} />
                      Shop
                    </a>
                  )}

                  {/* Address text */}
                  <span className="text-xs text-text-muted ml-auto truncate max-w-[140px]">{place.addressEn}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Map size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-text-muted">No places in this category</p>
        </div>
      )}
    </div>
  )
}
