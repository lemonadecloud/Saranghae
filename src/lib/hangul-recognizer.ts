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

  // Sharp guide — used for coverage (how much of the character was traced)
  const sharpCanvas = document.createElement('canvas')
  sharpCanvas.width = size
  sharpCanvas.height = size
  const sharpCtx = sharpCanvas.getContext('2d')!
  sharpCtx.clearRect(0, 0, size, size)
  sharpCtx.font = `bold ${fontSize}px "Noto Sans KR", sans-serif`
  sharpCtx.fillStyle = '#ffffff'
  sharpCtx.textAlign = 'center'
  sharpCtx.textBaseline = 'middle'
  sharpCtx.fillText(char, size / 2, size / 2)

  // Blurred guide — used for precision (allows brush overshoot tolerance)
  const blurCanvas = document.createElement('canvas')
  blurCanvas.width = size
  blurCanvas.height = size
  const blurCtx = blurCanvas.getContext('2d')!
  blurCtx.clearRect(0, 0, size, size)
  blurCtx.filter = 'blur(18px)'
  blurCtx.font = `bold ${fontSize}px "Noto Sans KR", sans-serif`
  blurCtx.fillStyle = '#ffffff'
  blurCtx.textAlign = 'center'
  blurCtx.textBaseline = 'middle'
  blurCtx.fillText(char, size / 2, size / 2)

  const sharpData = sharpCtx.getImageData(0, 0, size, size).data
  const blurData = blurCtx.getImageData(0, 0, size, size).data
  const draw = drawCanvas.getContext('2d')!.getImageData(0, 0, size, size).data

  let guideN = 0, overlap = 0, drawnPixels = 0, outsideBlur = 0
  for (let i = 0; i < sharpData.length; i += 4) {
    const isGuide = sharpData[i + 3] > 80
    const isBlurZone = blurData[i + 3] > 30
    const isDraw = draw[i + 3] > 50
    if (isGuide) guideN++
    if (isDraw) drawnPixels++
    if (isGuide && isDraw) overlap++
    if (!isBlurZone && isDraw) outsideBlur++
  }

  if (guideN === 0) return 0
  const coverage = overlap / guideN
  const precision = drawnPixels > 0 ? Math.max(0, 1 - outsideBlur / drawnPixels) : 0

  // Weight coverage heavily — tracing matters more than staying perfectly inside
  const raw = coverage * 0.75 + precision * 0.25
  return Math.min(100, Math.round(raw * 120 + 8))
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
