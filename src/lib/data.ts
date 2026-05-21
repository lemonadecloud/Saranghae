import { artists, expressions } from '@/data/seed'
import { Artist, Expression } from '@/types'

export function getAllArtists(): Artist[] {
  return artists
}

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug)
}

export function getAllExpressions(): Expression[] {
  return expressions
}

export function getExpressionById(id: string): Expression | undefined {
  return expressions.find((e) => e.id === id)
}

export function getExpressionsByArtist(artistId: string): Expression[] {
  return expressions.filter((e) => e.artistId === artistId)
}

export function getPopularExpressions(limit = 6): Expression[] {
  return [...expressions].sort((a, b) => b.likes - a.likes).slice(0, limit)
}

export function getTodayExpression(): Expression {
  const index = new Date().getDate() % expressions.length
  return expressions[index]
}

export function getRelatedExpressions(expression: Expression, limit = 3): Expression[] {
  return expressions
    .filter(
      (e) =>
        e.id !== expression.id &&
        (e.artistId === expression.artistId ||
          e.tags.some((t) => expression.tags.includes(t)))
    )
    .slice(0, limit)
}

export function searchExpressions(query: string): Expression[] {
  const q = query.toLowerCase()
  return expressions.filter(
    (e) =>
      e.korean.includes(q) ||
      e.meaningEn.toLowerCase().includes(q) ||
      e.romanization.toLowerCase().includes(q) ||
      artists.find((a) => a.id === e.artistId)?.nameEn.toLowerCase().includes(q) ||
      artists.find((a) => a.id === e.artistId)?.nameKo.includes(q)
  )
}

export function getArtistForExpression(expression: Expression): Artist | undefined {
  return artists.find((a) => a.id === expression.artistId)
}
