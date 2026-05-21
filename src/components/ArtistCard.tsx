import Link from 'next/link'
import { Users, Layers } from 'lucide-react'
import { Artist } from '@/types'

interface ArtistCardProps {
  artist: Artist
}

const groupTypeLabel = (t: Artist['groupType']) =>
  t === 'boygroup' ? 'Boy Group' : t === 'girlgroup' ? 'Girl Group' : 'Solo'

export default function ArtistCard({ artist }: ArtistCardProps) {
  const initials = artist.shortName.slice(0, 3).toUpperCase()

  return (
    <Link href={`/artists/${artist.slug}`}>
      <div className="artist-card p-6 cursor-pointer flex flex-col gap-4 h-full">
        {/* Avatar */}
        <div
          className="w-full aspect-square rounded-2xl flex items-center justify-center text-4xl font-display tracking-widest"
          style={{
            background: `linear-gradient(135deg, ${artist.color}22, ${artist.color}44)`,
            border: `1px solid ${artist.color}44`,
            color: artist.color,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-text-primary">{artist.shortName}</h3>
          <p className="text-text-secondary text-sm">{artist.nameKo}</p>
          <p className="text-text-muted text-xs">{artist.nameEn}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-text-muted text-xs flex-wrap">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${artist.color}22`, color: artist.color }}
          >
            {artist.agency}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {artist.memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <Layers size={11} /> {artist.expressionCount}
          </span>
        </div>

        {/* Debut */}
        <p className="text-text-muted text-xs border-t border-white/5 pt-3">
          Debut {artist.debutYear} · {groupTypeLabel(artist.groupType)}
        </p>
      </div>
    </Link>
  )
}
