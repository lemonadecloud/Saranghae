export type SourceType = 'interview' | 'variety' | 'lyrics' | 'sns' | 'behind'
export type Difficulty = 'beginner' | 'elementary' | 'intermediate'
export type GroupType = 'boygroup' | 'girlgroup' | 'solo'

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
