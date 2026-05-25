'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RotateCcw, ChevronDown, ArrowRight, ArrowLeft, CheckCheck, PenLine, Brush } from 'lucide-react'
import { getAllExpressions, getAllArtists } from '@/lib/data'
import { scorePixelCoverage, getKoreanChars, scoreToStars } from '@/lib/hangul-recognizer'
import { getComposedStrokes } from '@/lib/hangul-strokes'
import { useStudyStats } from '@/hooks/useStudyStats'

const CANVAS_SIZE = 320
const BRUSH_SIZE = 14
const FONT_SIZE = Math.round(CANVAS_SIZE * 0.68)

// ── Star display ──────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="text-2xl transition-all duration-300"
          style={{ opacity: i <= count ? 1 : 0.2, filter: i <= count ? 'drop-shadow(0 0 6px #FFB800)' : 'none' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function WritePage() {
  const expressions = getAllExpressions()
  const artists = getAllArtists()

  const [exprIdx, setExprIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [charScores, setCharScores] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [lastScore, setLastScore] = useState(0)
  const [done, setDone] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guideCanvasRef = useRef<HTMLCanvasElement>(null)
  const strokeOrderCanvasRef = useRef<HTMLCanvasElement>(null)
  const { recordWrite } = useStudyStats()
  const [showStrokeOrder, setShowStrokeOrder] = useState(false)
  const [strokeStep, setStrokeStep] = useState(0)
  const strokeAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const expr = expressions[exprIdx]
  const chars = getKoreanChars(expr.korean)
  const artist = artists.find((a) => a.id === expr.artistId)
  const currentChar = chars[charIdx] ?? ''

  // ── Draw guide character ──────────────────────────────────────
  const drawGuide = useCallback(() => {
    const c = guideCanvasRef.current
    if (!c || !currentChar) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Glow outer ring
    ctx.save()
    ctx.shadowColor = artist?.color ?? '#FF2D78'
    ctx.shadowBlur = 40
    ctx.font = `bold ${FONT_SIZE}px "Noto Sans KR", sans-serif`
    ctx.fillStyle = (artist?.color ?? '#FF2D78') + '28'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(currentChar, CANVAS_SIZE / 2, CANVAS_SIZE / 2)
    ctx.restore()

    // Grid dots
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.setLineDash([2, 8])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(CANVAS_SIZE / 2, 0)
    ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE)
    ctx.moveTo(0, CANVAS_SIZE / 2)
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2)
    ctx.stroke()
    ctx.restore()
  }, [currentChar, artist])

  useEffect(() => { drawGuide() }, [drawGuide])

  // ── Stroke order rendering ────────────────────────────────────
  const drawStrokeOrder = useCallback((upToStep: number) => {
    const c = strokeOrderCanvasRef.current
    if (!c || !currentChar) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const strokes = getComposedStrokes(currentChar, CANVAS_SIZE)
    if (strokes.length === 0) return

    const COLORS = ['#FF2D78','#00D4FF','#A855F7','#FFB800','#4ADE80','#FF6B35','#60A5FA']

    strokes.slice(0, upToStep).forEach((stroke, idx) => {
      const pts = stroke.points
      if (pts.length < 2) return
      const col = COLORS[idx % COLORS.length]
      const isLatest = idx === upToStep - 1

      // Draw stroke path
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.strokeStyle = isLatest ? col : col + '55'
      ctx.lineWidth = isLatest ? 3 : 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Arrowhead at end
      const last = pts[pts.length - 1]
      const prev = pts[pts.length - 2]
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x)
      const alen = isLatest ? 10 : 7
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(last.x - alen * Math.cos(angle - 0.45), last.y - alen * Math.sin(angle - 0.45))
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(last.x - alen * Math.cos(angle + 0.45), last.y - alen * Math.sin(angle + 0.45))
      ctx.strokeStyle = isLatest ? col : col + '55'
      ctx.lineWidth = isLatest ? 2.5 : 1.5
      ctx.stroke()

      // Number badge at start
      const r = isLatest ? 12 : 9
      ctx.beginPath()
      ctx.arc(pts[0].x, pts[0].y, r, 0, Math.PI * 2)
      ctx.fillStyle = isLatest ? col : col + '88'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${isLatest ? 11 : 9}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(idx + 1), pts[0].x, pts[0].y)
    })
  }, [currentChar])

  // Animate stroke order
  useEffect(() => {
    if (strokeAnimRef.current) clearInterval(strokeAnimRef.current)
    if (!showStrokeOrder) {
      const c = strokeOrderCanvasRef.current
      if (c) c.getContext('2d')!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      return
    }
    const strokes = getComposedStrokes(currentChar, CANVAS_SIZE)
    const total = strokes.length
    if (total === 0) return

    setStrokeStep(1)
    strokeAnimRef.current = setInterval(() => {
      setStrokeStep(prev => {
        if (prev >= total) {
          clearInterval(strokeAnimRef.current!)
          return prev
        }
        return prev + 1
      })
    }, 900)
    return () => { if (strokeAnimRef.current) clearInterval(strokeAnimRef.current) }
  }, [showStrokeOrder, currentChar])

  useEffect(() => { drawStrokeOrder(strokeStep) }, [strokeStep, drawStrokeOrder])

  // Reset stroke order when char changes
  useEffect(() => {
    setShowStrokeOrder(false)
    setStrokeStep(0)
  }, [charIdx, exprIdx])

  // ── Clear draw canvas ─────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    c.getContext('2d')!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    setChecked(false)
    setHasStrokes(false)
  }, [])

  // ── Reset to new expression ───────────────────────────────────
  const resetExpr = useCallback(() => {
    setCharIdx(0)
    setCharScores([])
    setChecked(false)
    setLastScore(0)
    setDone(false)
    setHasStrokes(false)
    setTimeout(() => {
      canvasRef.current?.getContext('2d')!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }, 0)
  }, [])

  useEffect(() => { resetExpr() }, [exprIdx, resetExpr])

  // ── Drawing events ────────────────────────────────────────────
  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    const scaleX = CANVAS_SIZE / rect.width
    const scaleY = CANVAS_SIZE / rect.height
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (checked) return
    e.preventDefault()
    setIsDrawing(true)
    setHasStrokes(true)
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = BRUSH_SIZE
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || checked) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endDraw() { setIsDrawing(false) }

  // ── Check score ───────────────────────────────────────────────
  function checkScore() {
    if (!canvasRef.current || checked) return
    const score = scorePixelCoverage(currentChar, canvasRef.current, FONT_SIZE)
    setLastScore(score)
    setChecked(true)
    setCharScores((prev) => {
      const next = [...prev]
      next[charIdx] = score
      return next
    })
  }

  // ── Next character ────────────────────────────────────────────
  function nextChar() {
    if (charIdx + 1 >= chars.length) {
      const finalScores = [...charScores]
      finalScores[charIdx] = lastScore
      const avg = finalScores.length > 0
        ? Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length)
        : 0
      recordWrite(chars.length, avg)
      setDone(true)
      return
    }
    setCharIdx((i) => i + 1)
    setChecked(false)
    setLastScore(0)
    setHasStrokes(false)
    setTimeout(() => {
      canvasRef.current?.getContext('2d')!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }, 0)
  }

  const avgScore = charScores.length > 0 ? Math.round(charScores.reduce((a, b) => a + b, 0) / charScores.length) : 0
  const stars = scoreToStars(lastScore)
  const color = artist?.color ?? '#FF2D78'

  // ── Done screen ───────────────────────────────────────────────
  if (done) {
    const finalStars = scoreToStars(avgScore)
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div
          className="rounded-3xl p-10 mb-6"
          style={{ background: 'linear-gradient(135deg, #12121A, #1A1A2E)', border: `1px solid ${color}33` }}
        >
          <p className="text-5xl mb-4">{finalStars === 3 ? '🎉' : finalStars >= 2 ? '😊' : '💪'}</p>
          <h2 className="text-2xl font-bold text-text-primary mb-2">완료!</h2>
          <p className="text-text-muted mb-6 text-sm">"{expr.korean}"</p>

          <div className="flex gap-1 justify-center mb-4">
            {[1, 2, 3].map((i) => (
              <span key={i} className="text-4xl" style={{ opacity: i <= finalStars ? 1 : 0.2, filter: i <= finalStars ? 'drop-shadow(0 0 8px #FFB800)' : 'none' }}>★</span>
            ))}
          </div>

          <p className="text-4xl font-bold mb-1" style={{ color }}>{avgScore}점</p>
          <p className="text-text-muted text-sm mb-8">
            {finalStars === 3 ? '완벽해요! 원어민 같아요 🔥' : finalStars === 2 ? '잘 했어요! 조금만 더 연습하면 완벽해요.' : '좋은 시작이에요! 계속 연습해봐요.'}
          </p>

          {/* Per-character breakdown */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {chars.map((ch, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}
                >
                  {ch}
                </span>
                <span className="text-xs text-text-muted">{charScores[i] ?? 0}점</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetExpr}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}
            >
              <RotateCcw size={14} /> 다시 쓰기
            </button>
            <Link
              href="/learn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(90deg, ${color}, #FF6B35)` }}
            >
              학습 메뉴로 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main screen ───────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Back */}
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-text-muted text-sm mb-6 hover:text-text-primary transition-colors">
        <ArrowLeft size={14} /> 학습 메뉴
      </Link>

      {/* Expression picker */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', color: '#E0E0F0' }}
        >
          <span className="flex flex-col items-start gap-0.5 text-left">
            <span className="text-xs text-text-muted">{artist?.shortName} · {artist?.nameKo}</span>
            <span className="font-bold text-text-primary">{expr.korean}</span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-text-muted" style={{ transform: showPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {showPicker && (
          <div
            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 320, overflowY: 'auto' }}
          >
            {expressions.map((e, i) => {
              const a = artists.find((x) => x.id === e.artistId)
              const ks = getKoreanChars(e.korean)
              if (ks.length === 0) return null
              return (
                <button
                  key={e.id}
                  onClick={() => { setExprIdx(i); setShowPicker(false) }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${a?.color ?? '#FF2D78'}22`, color: a?.color ?? '#FF2D78' }}
                  >
                    {a?.shortName.slice(0, 3)}
                  </span>
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-text-primary font-medium truncate">{e.korean}</span>
                    <span className="text-text-muted text-xs truncate">{e.meaningEn.slice(0, 50)}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Character progress chips */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {chars.map((ch, i) => {
          const isDone = i < charIdx || (i === charIdx && checked)
          const isCurrent = i === charIdx
          const s = charScores[i]
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold transition-all"
                style={{
                  background: isCurrent ? `${color}30` : isDone ? `${color}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isCurrent ? color : isDone ? color + '55' : 'rgba(255,255,255,0.08)'}`,
                  color: isCurrent ? color : isDone ? color + 'CC' : '#5A5A7A',
                  boxShadow: isCurrent ? `0 0 12px ${color}44` : 'none',
                  transform: isCurrent ? 'scale(1.1)' : 'none',
                }}
              >
                {ch}
              </span>
              {s != null && (
                <span className="text-xs" style={{ color: scoreToStars(s) >= 2 ? '#FFB800' : '#5A5A7A' }}>
                  {s}점
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Canvas area */}
      <div
        className="rounded-3xl p-4 mb-4 relative"
        style={{ background: '#0D0D16', border: `1px solid ${color}22` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <span className="text-text-muted text-xs">{charIdx + 1} / {chars.length} 번째 글자</span>
            <p className="text-text-primary text-sm font-medium">{expr.meaningEn.slice(0, 40)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStrokeOrder(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5"
              style={{
                color: showStrokeOrder ? color : '#5A5A7A',
                border: `1px solid ${showStrokeOrder ? color + '55' : 'rgba(255,255,255,0.06)'}`,
                background: showStrokeOrder ? `${color}11` : 'transparent',
              }}
            >
              <Brush size={12} /> 획순
            </button>
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5"
              style={{ color: '#5A5A7A', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RotateCcw size={12} /> 지우기
            </button>
          </div>
        </div>

        {/* Canvas stack */}
        <div
          className="relative mx-auto rounded-2xl overflow-hidden"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, background: '#09090F', maxWidth: '100%' }}
        >
          {/* Guide canvas */}
          <canvas
            ref={guideCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          />

          {/* Draw canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0 touch-none"
            style={{
              cursor: checked || showStrokeOrder ? 'default' : 'crosshair',
              opacity: checked ? 0.6 : 1,
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />

          {/* Stroke order overlay canvas */}
          <canvas
            ref={strokeOrderCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          />

          {/* Overlay hint */}
          {!hasStrokes && !checked && (
            <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#5A5A7A' }}>
                <PenLine size={11} className="inline mr-1" />위 글자를 따라 써보세요
              </span>
            </div>
          )}
        </div>

        {/* Score result */}
        {checked && (
          <div className="mt-4 text-center animate-fade-in">
            <Stars count={stars} />
            <p className="text-3xl font-bold mt-2 mb-1" style={{ color }}>{lastScore}점</p>
            <p className="text-text-muted text-sm">
              {stars === 3 ? '완벽해요! 🔥' : stars === 2 ? '잘 썼어요! 👍' : stars === 1 ? '조금 더 연습해봐요 💪' : '다시 써볼까요? 😊'}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!checked ? (
          <button
            onClick={checkScore}
            disabled={!hasStrokes}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: hasStrokes ? `linear-gradient(90deg, ${color}, #FF6B35)` : 'rgba(255,255,255,0.05)',
              color: hasStrokes ? '#fff' : '#5A5A7A',
              cursor: hasStrokes ? 'pointer' : 'not-allowed',
            }}
          >
            <CheckCheck size={16} /> 채점하기
          </button>
        ) : (
          <>
            <button
              onClick={clearCanvas}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9090B0' }}
            >
              <RotateCcw size={15} /> 다시
            </button>
            <button
              onClick={nextChar}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(90deg, ${color}, #FF6B35)` }}
            >
              {charIdx + 1 >= chars.length ? '완료! 🎉' : `다음 글자 →`}
            </button>
          </>
        )}
      </div>

      {/* Expression meaning */}
      <div
        className="mt-4 px-4 py-3 rounded-xl text-sm"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-text-muted text-xs mb-0.5">{artist?.shortName} · {expr.sourceDetail}</p>
        <p className="text-text-primary font-medium">{expr.korean}</p>
        <p className="text-text-muted text-xs mt-1">{expr.meaningEn.split('—')[0].trim()}</p>
      </div>
    </div>
  )
}
