import { notFound } from 'next/navigation'
import { getArtistBySlug, getExpressionsByArtist } from '@/lib/data'
import ExpressionCard from '@/components/ExpressionCard'
import { Users, Calendar, Layers } from 'lucide-react'

export default async function ArtistDetailPage(props: PageProps<'/artists/[slug]'>) {
  const { slug } = await props.params
  const artist = getArtistBySlug(slug)
  if (!artist) notFound()

  const expressions = getExpressionsByArtist(artist.id)

  const groupLabel =
    artist.groupType === 'boygroup' ? 'Boy Group' :
    artist.groupType === 'girlgroup' ? 'Girl Group' : 'Solo'

  return (
    <div>
      {/* Banner */}
      <div
        className="h-52 md:h-64 relative flex items-end"
        style={{
          background: `linear-gradient(135deg, ${artist.color}33, #0A0A0F 70%), linear-gradient(180deg, transparent 40%, #0A0A0F 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(ellipse 60% 80% at 30% 50%, ${artist.color}, transparent)` }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 relative">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-display tracking-widest flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${artist.color}33, ${artist.color}55)`,
                border: `2px solid ${artist.color}66`,
                color: artist.color,
              }}
            >
              {artist.shortName.slice(0, 3)}
            </div>

            <div>
              <p className="text-text-muted text-xs font-display tracking-widest mb-1">{artist.agency}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-none">{artist.shortName}</h1>
              <p className="text-text-secondary text-base mt-1">{artist.nameKo} · {artist.nameEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-text-muted" />
            {groupLabel} · {artist.memberCount} members
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-text-muted" />
            Debut {artist.debutYear}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-text-muted" />
            {expressions.length} Expressions
          </span>
        </div>

        {/* Description */}
        <p className="text-text-secondary leading-relaxed mb-10 max-w-2xl">{artist.description}</p>

        {/* Expressions */}
        <h2 className="text-xl font-bold text-text-primary mb-6">
          Expressions from {artist.shortName}
        </h2>
        {expressions.length === 0 ? (
          <p className="text-text-muted text-center py-16">No expressions yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expressions.map((expr) => (
              <ExpressionCard key={expr.id} expression={expr} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
