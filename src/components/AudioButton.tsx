'use client'

import { useState, useCallback, useRef } from 'react'
import { Volume2 } from 'lucide-react'

interface AudioButtonProps {
  text: string
  className?: string
}

const SPEEDS = [0.75, 1.0, 1.25] as const
const WAVE_HEIGHTS = [3, 7, 11, 7, 3]

export default function AudioButton({ text, className = '' }: AudioButtonProps) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [speed, setSpeed] = useState<number>(1.0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setPlaying(false)
    setLoading(false)
  }, [])

  const fallbackSpeak = useCallback(
    (rate: number) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = rate
      utterance.onend = () => setPlaying(false)
      utterance.onerror = () => setPlaying(false)
      setPlaying(true)
      window.speechSynthesis.speak(utterance)
    },
    [text],
  )

  const speak = useCallback(
    async (rate: number = speed) => {
      stop()
      setLoading(true)

      try {
        const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`)
        audio.playbackRate = rate
        audioRef.current = audio

        audio.onended = () => {
          setPlaying(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          setLoading(false)
          setPlaying(false)
          audioRef.current = null
          fallbackSpeak(rate)
        }

        await audio.play()
        setLoading(false)
        setPlaying(true)
      } catch {
        setLoading(false)
        audioRef.current = null
        fallbackSpeak(rate)
      }
    },
    [text, speed, stop, fallbackSpeak],
  )

  const handleSpeedChange = useCallback(
    (s: number) => {
      setSpeed(s)
      if (audioRef.current) {
        audioRef.current.playbackRate = s
      }
    },
    [],
  )

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={playing ? stop : () => speak()}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          border: '1px solid rgba(0,212,255,0.4)',
          background: playing ? 'rgba(0,212,255,0.15)' : 'transparent',
          color: '#00D4FF',
          minWidth: '84px',
        }}
        aria-label={playing ? 'Stop audio' : 'Play pronunciation'}
      >
        {loading ? (
          <span
            className="inline-block rounded-full animate-spin"
            style={{
              width: '11px',
              height: '11px',
              border: '2px solid rgba(0,212,255,0.25)',
              borderTopColor: '#00D4FF',
            }}
          />
        ) : playing ? (
          <span className="flex items-end gap-px" style={{ height: '13px' }}>
            {WAVE_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="waveform-bar rounded-full bg-brand-cyan"
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: `${h}px`,
                  animationDelay: `${i * 0.13}s`,
                }}
              />
            ))}
          </span>
        ) : (
          <Volume2 size={13} />
        )}
        <span>{loading ? 'Loading' : playing ? 'Stop' : 'Play'}</span>
      </button>

      <div className="flex gap-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className="text-xs px-2 py-1 rounded transition-all"
            style={{
              background: speed === s ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: speed === s ? '#00D4FF' : '#5A5A7A',
            }}
            aria-label={`${s}x speed`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
