import Link from 'next/link'
import { ArrowRight, Sparkles, BookOpen, Users } from 'lucide-react'
import { getTodayExpression, getPopularExpressions, getAllArtists, getArtistForExpression } from '@/lib/data'
import ExpressionCard from '@/components/ExpressionCard'
import ArtistCard from '@/components/ArtistCard'
import { SourceBadge, ArtistBadge } from '@/components/Badge'

export default function HomePage() {
  const todayExpr = getTodayExpression()
  const todayArtist = getArtistForExpression(todayExpr)
  const popular = getPopularExpressions(6)
  const artists = getAllArtists()

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center px-4 py-20"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,120,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), #0A0A0F',
        }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${[60, 40, 80, 50, 30, 70][i]}px`,
                height: `${[60, 40, 80, 50, 30, 70][i]}px`,
                top: `${[10, 70, 30, 80, 20, 60][i]}%`,
                left: `${[5, 85, 50, 15, 70, 40][i]}%`,
                background: i % 2 === 0 ? '#FF2D78' : '#00D4FF',
                filter: 'blur(40px)',
                animation: `floatParticle ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-brand-pink font-display tracking-[0.3em] text-sm mb-4 uppercase">
            K-Pop × Korean Learning
          </p>
          <h1 className="text-5xl md:text-7xl font-display tracking-wide text-text-primary mb-6 leading-none">
            LEARN KOREAN
            <br />
            <span className="gradient-text-pink-cyan glow-pink">THROUGH ARTISTS</span>
            <br />
            YOU LOVE
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Learn natural Korean with real expressions from TXT, TWICE, aespa, NewJeans &amp; BTS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/expressions"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #FF2D78, #FF6B35)',
                boxShadow: '0 0 24px rgba(255,45,120,0.4)',
              }}
            >
              <Sparkles size={18} />
              Explore Expressions
            </Link>
            <Link
              href="/artists"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-text-primary transition-all duration-200 hover:scale-105 hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Users size={18} />
              Browse Artists
            </Link>
          </div>
        </div>
      </section>

      {/* ── Today's Expression ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={20} className="text-brand-gold" />
            <h2 className="text-2xl font-bold text-text-primary">Today's Expression</h2>
          </div>

          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
              border: '1px solid rgba(255,215,0,0.2)',
              boxShadow: '0 0 40px rgba(255,215,0,0.05)',
            }}
          >
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {todayArtist && <ArtistBadge name={todayArtist.shortName} color={todayArtist.color} />}
              <SourceBadge type={todayExpr.sourceType} />
              <span className="text-text-muted text-xs">{todayExpr.sourceDetail}</span>
            </div>

            <p className="text-3xl md:text-4xl font-serif text-text-primary mb-3 leading-snug">
              {todayExpr.korean}
            </p>
            <p
              className="font-mono text-brand-cyan text-sm mb-4 px-4 py-2 rounded-lg"
              style={{ background: 'rgba(0,212,255,0.06)', borderLeft: '3px solid #00D4FF' }}
            >
              {todayExpr.romanization}
            </p>
            <p className="text-text-secondary text-base leading-relaxed mb-6">{todayExpr.meaningEn}</p>

            <Link
              href={`/expressions/${todayExpr.id}`}
              className="inline-flex items-center gap-2 text-brand-pink font-semibold hover:gap-3 transition-all"
            >
              View Full Card <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Artist Spotlight ── */}
      <section className="py-16 px-4 bg-bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-brand-cyan" />
              <h2 className="text-2xl font-bold text-text-primary">Artists</h2>
            </div>
            <Link href="/artists" className="text-text-muted text-sm hover:text-brand-pink transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Expressions ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-brand-pink" />
              <h2 className="text-2xl font-bold text-text-primary">Popular Expressions</h2>
            </div>
            <Link href="/expressions" className="text-text-muted text-sm hover:text-brand-pink transition-colors flex items-center gap-1">
              See more <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((expr) => {
              const artist = artists.find((a) => a.id === expr.artistId)
              return <ExpressionCard key={expr.id} expression={expr} artist={artist} />
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 px-4 bg-bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">How It Works</h2>
          <p className="text-text-muted mb-12">Three steps to mastering K-pop Korean naturally</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🎤', title: 'Pick an Artist', desc: 'Choose your favorite K-pop artist and explore the expressions they actually use.' },
              { step: '02', icon: '📖', title: 'Study Expression Cards', desc: 'Each card includes the original Korean, pronunciation, meaning, nuance notes, and real-life examples.' },
              { step: '03', icon: '✨', title: 'Practice & Master', desc: 'Reinforce what you learned with flashcards and quizzes until expressions feel natural.' },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="rounded-2xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, #12121A, #1A1A2E)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-4xl mb-3">{icon}</div>
                <p className="text-brand-pink font-display tracking-widest text-xs mb-2">STEP {step}</p>
                <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
