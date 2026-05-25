export type SourceType = 'interview' | 'variety' | 'lyrics' | 'sns' | 'behind'
export type PlaceCategory = 'idol-spot' | 'beauty' | 'fashion' | 'tourism'

export interface Place {
  id: string
  nameKo: string
  nameEn: string
  category: PlaceCategory
  artistIds: string[]
  address: string
  addressEn: string
  googleMapsUrl: string
  descriptionKo: string
  descriptionEn: string
  sourceShow?: string
  sourceUrl?: string
  imageUrl?: string
  tags: string[]
  purchaseUrl?: string
}
export type Difficulty = 'beginner' | 'elementary' | 'intermediate'
export type GroupType = 'boygroup' | 'girlgroup' | 'solo'
export type ShowGenre = 'drama' | 'variety'

export interface ExpressionExample {
  context: string
  dialogA?: string
  dialogB?: string
  sentence?: string
}

export interface Expression {
  id: string
  artistId: string
  sourceType: SourceType
  sourceDetail: string
  sourceUrl?: string
  korean: string
  romanization: string
  pronunciation: string
  audioUrl?: string
  meaningKo: string
  meaningEn: string
  nuanceNote: string
  examples: ExpressionExample[]
  difficulty: Difficulty
  tags: string[]
  likes: number
  saves: number
  createdAt: string
  updatedAt: string
}

export interface Show {
  id: string
  titleKo: string
  titleEn: string
  genre: ShowGenre
  year: number
  network: string
  description: string
  color: string
  imageUrl?: string
}

export interface CultureExpression {
  id: string
  showId: string
  korean: string
  romanization: string
  meaningKo: string
  meaningEn: string
  nuanceNote: string
  difficulty: Difficulty
  tags: string[]
  episode?: string
}

export interface Artist {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  shortName: string
  agency: string
  debutYear: number
  memberCount: number
  groupType: GroupType
  description: string
  imageUrl: string
  bannerUrl: string
  expressionCount: number
  color: string
}
