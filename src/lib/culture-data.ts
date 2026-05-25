import { shows, cultureExpressions } from '@/data/culture-seed'
import { Show, CultureExpression, ShowGenre } from '@/types'

export function getAllShows(): Show[] { return shows }
export function getShowById(id: string): Show | undefined { return shows.find(s => s.id === id) }
export function getShowsByGenre(genre: ShowGenre): Show[] { return shows.filter(s => s.genre === genre) }

export function getAllCultureExpressions(): CultureExpression[] { return cultureExpressions }
export function getCultureExpressionsByShow(showId: string): CultureExpression[] {
  return cultureExpressions.filter(e => e.showId === showId)
}
