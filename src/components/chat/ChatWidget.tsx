'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, ChevronUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ChatMessage {
  id: string
  room_id: string
  nickname: string
  content: string
  created_at: string
}

interface Reaction {
  id: string
  message_id: string
  emoji: string
  nickname: string
}

const ROOMS = [
  { id: 'general',   label: 'general',   color: '#FF2D78' },
  { id: 'bts',       label: 'bts',       color: '#9B59B6' },
  { id: 'txt',       label: 'txt',       color: '#3498DB' },
  { id: 'blackpink', label: 'blackpink', color: '#EC4899' },
  { id: 'twice',     label: 'twice',     color: '#F472B6' },
]

const EMOJI_REACTIONS = ['❤️', '🔥', '😍', '👏', '✨']

const NICK_WORDS = [
  'Star', 'Moon', 'Rose', 'Light', 'Dream', 'Wave', 'Smile', 'Shine',
  'Glow', 'Bloom', 'Spark', 'Lucky', 'Nova', 'Dawn', 'Comet', 'Pixel',
  'Solar', 'Neon', 'Echo', 'Prism',
]

function generateNickname() {
  const word = NICK_WORDS[Math.floor(Math.random() * NICK_WORDS.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${word}Fan_${num}`
}

const PAGE_SIZE = 100

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeRoom, setActiveRoom] = useState('general')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [onlineCount, setOnlineCount] = useState(1)
  const [nickname, setNickname] = useState('')
  const [activeReactionMsg, setActiveReactionMsg] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const presenceChannelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  // Init nickname from localStorage
  useEffect(() => {
    let nick = localStorage.getItem('kpk_chat_nick')
    if (!nick) {
      nick = generateNickname()
      localStorage.setItem('kpk_chat_nick', nick)
    }
    setNickname(nick)
  }, [])

  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (!supabase || messageIds.length === 0) return
    const { data } = await supabase
      .from('reactions')
      .select('*')
      .in('message_id', messageIds)
    if (data) {
      setReactions(prev => {
        const kept = prev.filter(r => !messageIds.includes(r.message_id))
        return [...kept, ...data]
      })
    }
  }, [])

  const fetchMessages = useCallback(async (room: string, before?: string) => {
    if (!supabase) return
    before ? setLoadingMore(true) : setLoading(true)
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('room_id', room)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (before) query = query.lt('created_at', before)

      const { data } = await query
      const sorted = (data ?? []).reverse() as ChatMessage[]

      if (before) {
        setMessages(prev => [...sorted, ...prev])
      } else {
        setMessages(sorted)
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50)
      }
      setHasMore(sorted.length === PAGE_SIZE)

      if (sorted.length > 0) {
        fetchReactions(sorted.map(m => m.id))
      }
    } finally {
      before ? setLoadingMore(false) : setLoading(false)
    }
  }, [fetchReactions])

  // Fetch on room open / change
  useEffect(() => {
    if (!isOpen) return
    setMessages([])
    setReactions([])
    setHasMore(false)
    fetchMessages(activeRoom)
  }, [activeRoom, isOpen, fetchMessages])

  // Realtime: new messages
  useEffect(() => {
    const sb = supabase
    if (!isOpen || !sb) return
    const ch = sb
      .channel(`room-msgs-${activeRoom}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom}` },
        payload => {
          const msg = payload.new as ChatMessage
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          fetchReactions([msg.id])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [activeRoom, isOpen, fetchReactions])

  // Realtime: reactions
  useEffect(() => {
    const sb = supabase
    if (!isOpen || !sb) return
    const ch = sb
      .channel(`room-reactions-${activeRoom}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        setMessages(prev => {
          const ids = prev.map(m => m.id)
          if (ids.length > 0) fetchReactions(ids)
          return prev
        })
      })
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [activeRoom, isOpen, fetchReactions])

  // Presence: online count
  useEffect(() => {
    const sb = supabase
    if (!sb || !nickname) return
    if (presenceChannelRef.current) sb.removeChannel(presenceChannelRef.current)

    const ch = sb.channel('kpk-presence', {
      config: { presence: { key: nickname } },
    })
    ch.on('presence', { event: 'sync' }, () => {
      setOnlineCount(Math.max(1, Object.keys(ch.presenceState()).length))
    })
    .subscribe(async status => {
      if (status === 'SUBSCRIBED') await ch.track({ nickname })
    })

    presenceChannelRef.current = ch
    return () => { sb.removeChannel(ch) }
  }, [nickname])

  async function sendMessage() {
    if (!supabase || !input.trim() || !nickname) return
    const text = input.trim()
    setInput('')
    await supabase.from('messages').insert({ room_id: activeRoom, nickname, content: text })
  }

  async function toggleReaction(messageId: string, emoji: string) {
    if (!supabase) return
    const existing = reactions.find(
      r => r.message_id === messageId && r.emoji === emoji && r.nickname === nickname
    )
    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id)
      setReactions(prev => prev.filter(r => r.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('reactions')
        .insert({ message_id: messageId, emoji, nickname })
        .select()
        .single()
      if (data) setReactions(prev => [...prev, data as Reaction])
    }
    setActiveReactionMsg(null)
  }

  function loadMore() {
    if (!hasMore || loadingMore || messages.length === 0) return
    fetchMessages(activeRoom, messages[0].created_at)
  }

  const activeColor = ROOMS.find(r => r.id === activeRoom)?.color ?? '#FF2D78'

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="Toggle chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #FF2D78, #C2185B)' }}
      >
        {isOpen ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
      </button>

      {/* Chat panel */}
      {isOpen && !supabase && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col items-center justify-center rounded-2xl shadow-2xl gap-3"
          style={{ width: 360, height: 200, background: '#12121A', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <MessageCircle size={28} style={{ color: '#FF2D78', opacity: 0.5 }} />
          <p className="text-sm font-semibold" style={{ color: '#E0E0F0' }}>Chat is setting up…</p>
          <p className="text-xs text-center px-8" style={{ color: '#5050A0' }}>Supabase environment variables are not connected yet.</p>
        </div>
      )}
      {isOpen && supabase && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 360,
            height: 520,
            background: '#12121A',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: '#16161F', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={15} style={{ color: activeColor }} />
              <span className="font-bold text-sm" style={{ color: '#E0E0F0' }}>Live Chat</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6060A0' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ADE80' }} />
              <Users size={11} />
              <span>{onlineCount} online</span>
            </div>
          </div>

          {/* Room tabs */}
          <div
            className="flex gap-1 px-3 py-2 shrink-0 overflow-x-auto"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              scrollbarWidth: 'none',
            }}
          >
            {ROOMS.map(room => {
              const active = activeRoom === room.id
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? `${room.color}22` : 'transparent',
                    color: active ? room.color : '#404070',
                    border: `1px solid ${active ? room.color + '44' : 'transparent'}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  #{room.label}
                </button>
              )
            })}
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
            onClick={() => setActiveReactionMsg(null)}
          >
            {hasMore && (
              <button
                onClick={e => { e.stopPropagation(); loadMore() }}
                disabled={loadingMore}
                className="text-xs text-center py-1 mx-auto flex items-center gap-1 transition-colors"
                style={{ color: loadingMore ? '#404070' : '#6060A0' }}
              >
                <ChevronUp size={13} />
                {loadingMore ? 'Loading…' : 'Load older messages'}
              </button>
            )}

            {loading && (
              <p className="text-center text-xs py-8" style={{ color: '#404070' }}>Loading…</p>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
                <MessageCircle size={30} style={{ color: activeColor, opacity: 0.25 }} />
                <p className="text-xs" style={{ color: '#404070' }}>Be the first to say hi! 👋</p>
              </div>
            )}

            {messages.map(msg => {
              const isMe = msg.nickname === nickname
              const msgReactions = reactions.filter(r => r.message_id === msg.id)
              const grouped: Record<string, { count: number; mine: boolean }> = {}
              msgReactions.forEach(r => {
                if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, mine: false }
                grouped[r.emoji].count++
                if (r.nickname === nickname) grouped[r.emoji].mine = true
              })

              return (
                <div key={msg.id} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-xs font-semibold px-1" style={{ color: activeColor + 'BB' }}>
                      {msg.nickname}
                    </span>
                  )}

                  <div className="relative group">
                    <div
                      className="px-3 py-2 rounded-2xl text-sm break-words"
                      style={{
                        maxWidth: 240,
                        ...(isMe
                          ? { background: activeColor, color: '#fff' }
                          : { background: 'rgba(255,255,255,0.07)', color: '#D0D0E8' }),
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Reaction picker trigger */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setActiveReactionMsg(prev => prev === msg.id ? null : msg.id)
                      }}
                      className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: '#1E1E2E',
                        border: '1px solid rgba(255,255,255,0.1)',
                        [isMe ? 'left' : 'right']: -4,
                      }}
                    >
                      😊
                    </button>

                    {/* Reaction picker */}
                    {activeReactionMsg === msg.id && (
                      <div
                        className="absolute bottom-7 z-10 flex gap-0.5 p-1.5 rounded-xl"
                        style={{
                          background: '#1E1E2E',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          [isMe ? 'right' : 'left']: 0,
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        {EMOJI_REACTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:scale-125 transition-transform"
                            style={{
                              background: grouped[emoji]?.mine ? `${activeColor}33` : 'transparent',
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction badges */}
                  {Object.keys(grouped).length > 0 && (
                    <div className="flex gap-1 flex-wrap px-1">
                      {Object.entries(grouped).map(([emoji, { count, mine }]) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-all hover:scale-110"
                          style={{
                            background: mine ? `${activeColor}22` : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${mine ? activeColor + '44' : 'rgba(255,255,255,0.07)'}`,
                            color: mine ? activeColor : '#5050A0',
                          }}
                        >
                          {emoji} {count}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-xs px-1" style={{ color: '#303050' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}

            <div ref={bottomRef} />
          </div>

          {/* Nickname bar */}
          <div
            className="px-4 py-1.5 text-xs shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#404070' }}
          >
            Chatting as <span style={{ color: activeColor }}>{nickname}</span>
          </div>

          {/* Input */}
          <div
            className="px-3 py-2.5 shrink-0 flex items-center gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#16161F' }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
              placeholder={`Message #${activeRoom}…`}
              maxLength={300}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#D0D0E8' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
              style={{ background: activeColor }}
            >
              <Send size={13} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
