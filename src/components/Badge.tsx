import { SourceType, Difficulty } from '@/types'

const sourceStyles: Record<SourceType, { label: string; style: React.CSSProperties }> = {
  interview: {
    label: 'Interview',
    style: { background: 'rgba(123,97,255,0.15)', border: '1px solid #7B61FF', color: '#7B61FF' },
  },
  variety: {
    label: 'Variety Show',
    style: { background: 'rgba(255,107,53,0.15)', border: '1px solid #FF6B35', color: '#FF6B35' },
  },
  lyrics: {
    label: 'Lyrics',
    style: { background: 'rgba(255,45,120,0.15)', border: '1px solid #FF2D78', color: '#FF2D78' },
  },
  sns: {
    label: 'SNS',
    style: { background: 'rgba(0,212,255,0.15)', border: '1px solid #00D4FF', color: '#00D4FF' },
  },
  behind: {
    label: 'Behind',
    style: { background: 'rgba(144,144,176,0.15)', border: '1px solid #9090B0', color: '#9090B0' },
  },
}

const difficultyStyles: Record<Difficulty, { label: string; color: string }> = {
  beginner:     { label: 'Beginner',     color: '#00CC66' },
  elementary:   { label: 'Elementary',   color: '#FFB800' },
  intermediate: { label: 'Intermediate', color: '#FF7733' },
}

interface SourceBadgeProps {
  type: SourceType
  className?: string
}

export function SourceBadge({ type, className = '' }: SourceBadgeProps) {
  const { label, style } = sourceStyles[type]
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}
      style={style}
    >
      {label}
    </span>
  )
}

interface DifficultyBadgeProps {
  level: Difficulty
  className?: string
}

export function DifficultyBadge({ level, className = '' }: DifficultyBadgeProps) {
  const { label, color } = difficultyStyles[level]
  const dot = level === 'beginner' ? '🟢' : level === 'elementary' ? '🟡' : '🟠'
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}
      style={{ background: `${color}22`, border: `1px solid ${color}`, color }}
    >
      {dot} {label}
    </span>
  )
}

interface ArtistBadgeProps {
  name: string
  color?: string
  className?: string
}

export function ArtistBadge({ name, color = '#FF2D78', className = '' }: ArtistBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full text-white ${className}`}
      style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
    >
      {name}
    </span>
  )
}
