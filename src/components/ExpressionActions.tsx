'use client'

import { useState } from 'react'
import { Heart, BookmarkPlus, Share2, Check } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ExpressionActionsProps {
  expressionId: string
  likes: number
  saves: number
}

export default function ExpressionActions({ expressionId, likes, saves }: ExpressionActionsProps) {
  const [likedIds, setLikedIds] = useLocalStorage<string[]>('kpk_liked', [])
  const [savedIds, setSavedIds] = useLocalStorage<string[]>('kpk_saved', [])
  const [copied, setCopied] = useState(false)

  const isLiked = likedIds.includes(expressionId)
  const isSaved = savedIds.includes(expressionId)

  const toggleLike = () =>
    setLikedIds((prev) =>
      prev.includes(expressionId) ? prev.filter((id) => id !== expressionId) : [...prev, expressionId],
    )

  const toggleSave = () =>
    setSavedIds((prev) =>
      prev.includes(expressionId) ? prev.filter((id) => id !== expressionId) : [...prev, expressionId],
    )

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1.5 text-sm transition-all hover:scale-105"
          style={{ color: isLiked ? '#FF2D78' : '#5A5A7A' }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={isLiked ? '#FF2D78' : 'none'} strokeWidth={isLiked ? 0 : 2} />
          {(likes + (isLiked ? 1 : 0)).toLocaleString()}
        </button>

        <button
          onClick={toggleSave}
          className="flex items-center gap-1.5 text-sm transition-all hover:scale-105"
          style={{ color: isSaved ? '#00D4FF' : '#5A5A7A' }}
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <BookmarkPlus size={16} fill={isSaved ? '#00D4FF' : 'none'} strokeWidth={isSaved ? 0 : 2} />
          {isSaved ? 'Saved' : `Save`}
          <span className="text-xs opacity-60">
            {(saves + (isSaved ? 1 : 0)).toLocaleString()}
          </span>
        </button>
      </div>

      <button
        onClick={share}
        className="flex items-center gap-1.5 text-sm transition-all hover:scale-105"
        style={{ color: copied ? '#00FF88' : '#5A5A7A' }}
        aria-label="Share"
      >
        {copied ? <Check size={16} /> : <Share2 size={16} />}
        {copied ? 'Copied!' : 'Share'}
      </button>
    </div>
  )
}
