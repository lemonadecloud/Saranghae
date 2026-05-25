export interface Point { x: number; y: number }

const SAMPLES = 32

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

function pathLength(points: Point[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) len += distance(points[i - 1], points[i])
  return len
}

export function resample(points: Point[], n = SAMPLES): Point[] {
  if (points.length === 0) return []
  if (points.length === 1) return Array(n).fill({ ...points[0] })

  const pts = points.map((p) => ({ ...p }))
  const interval = pathLength(pts) / (n - 1)
  let acc = 0
  const result: Point[] = [{ ...pts[0] }]
  let i = 1

  while (i < pts.length) {
    const d = distance(pts[i - 1], pts[i])
    if (acc + d >= interval) {
      const r = (interval - acc) / d
      const q = { x: pts[i - 1].x + r * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + r * (pts[i].y - pts[i - 1].y) }
      result.push(q)
      pts.splice(i, 0, q)
      acc = 0
    } else {
      acc += d
    }
    i++
  }

  while (result.length < n) result.push({ ...pts[pts.length - 1] })
  if (result.length > n) result.splice(n)
  return result
}

function comparePaths(a: Point[], b: Point[]) {
  let fwd = 0, rev = 0
  const n = a.length
  for (let i = 0; i < n; i++) {
    fwd += distance(a[i], b[i])
    rev += distance(a[i], b[n - 1 - i])
  }
  return { forwardDist: fwd / n, reverseDist: rev / n }
}

export interface StrokeResult {
  success: boolean
  score: number
  type: 'correct' | 'wrong_direction' | 'wrong_shape' | 'wrong_position' | 'too_short'
  msg: string
}

export function evaluateStroke(drawn: Point[], template: Point[], tolerance = 20): StrokeResult {
  if (!drawn || drawn.length < 2) return { success: false, score: 0, type: 'too_short', msg: 'Draw a longer line!' }

  const user = resample([...drawn])
  const target = resample([...template])
  const { forwardDist, reverseDist } = comparePaths(user, target)

  if (forwardDist <= tolerance) {
    return { success: true, score: Math.max(0, Math.min(100, Math.round(100 * (1 - forwardDist / tolerance)))), type: 'correct', msg: '정확해요! 👏' }
  }
  if (reverseDist <= tolerance && reverseDist < forwardDist) {
    return { success: false, score: 30, type: 'wrong_direction', msg: '방향이 반대예요! 획 시작 위치를 확인하세요.' }
  }
  if (forwardDist <= tolerance * 2) {
    return { success: false, score: Math.max(0, Math.min(100, Math.round(100 * (1 - forwardDist / (tolerance * 2)) * 0.5))), type: 'wrong_shape', msg: '모양이 조금 다르네요. 더 천천히 따라써 보세요.' }
  }
  return { success: false, score: 0, type: 'wrong_position', msg: '위치가 맞지 않아요.' }
}

// Pixel-coverage scoring: works for ANY Korean character
export function scorePixelCoverage(char: string, drawCanvas: HTMLCanvasElement, fontSize: number): number {
  if (typeof document === 'undefined') return 0
  const size = drawCanvas.width
  const temp = document.createElement('canvas')
  temp.width = size
  temp.height = size
  const ctx = temp.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.font = `bold ${fontSize}px "Noto Sans KR", sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(char, size / 2, size / 2)

  const guide = ctx.getImageData(0, 0, size, size).data
  const draw = drawCanvas.getContext('2d')!.getImageData(0, 0, size, size).data

  let guideN = 0, overlap = 0, outside = 0
  for (let i = 0; i < guide.length; i += 4) {
    const isGuide = guide[i + 3] > 80
    const isDraw = draw[i + 3] > 50
    if (isGuide) guideN++
    if (isGuide && isDraw) overlap++
    if (!isGuide && isDraw) outside++
  }

  if (guideN === 0) return 0
  const coverage = overlap / guideN
  const total = overlap + outside
  const precision = total > 0 ? overlap / total : 0
  if (coverage + precision === 0) return 0
  return Math.round((2 * coverage * precision) / (coverage + precision) * 100)
}

export function getKoreanChars(text: string): string[] {
  return text.split('').filter((c) => {
    const code = c.charCodeAt(0)
    return code >= 0xac00 && code <= 0xd7a3
  })
}

export function scoreToStars(score: number): number {
  if (score >= 80) return 3
  if (score >= 55) return 2
  if (score >= 30) return 1
  return 0
}
