import { getAllArtists } from '@/lib/data'
import ArtistCard from '@/components/ArtistCard'
import { Users } from 'lucide-react'

export default function ArtistsPage() {
  const artists = getAllArtists()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Users size={24} className="text-brand-cyan" />
          <h1 className="text-3xl font-bold text-text-primary">Artists</h1>
        </div>
        <p className="text-text-muted text-base">
          Pick your favorite artist and learn Korean through their real expressions
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  )
}
