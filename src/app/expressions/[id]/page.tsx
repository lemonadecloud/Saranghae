import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getExpressionById, getArtistForExpression, getRelatedExpressions } from '@/lib/data'
import { SourceBadge, DifficultyBadge, ArtistBadge } from '@/components/Badge'
import ExpressionCard from '@/components/ExpressionCard'
import AudioButton from '@/components/AudioButton'
import { ChevronLeft } from 'lucide-react'
import ExpressionActions from '@/components/ExpressionActions'

export default async function ExpressionDetailPage(props: PageProps<'/expressions/[id]'>) {
  const { id } = await props.params
  const expression = getExpressionById(id)
  if (!expression) notFound()

  const artist = getArtistForExpression(expression)
  const related = getRelatedExpressions(expression, 3)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/expressions"
        className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-8 transition-colors"
      >
        <ChevronLeft size={16} /> Expressions
      </Link>

      {/* Main card */}
      <article
        className="rounded-2xl overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
          border: '1px solid rgba(255,45,120,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-white/5 flex items-center justify-between flex-wrap gap-3"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {artist && <ArtistBadge name={artist.shortName} color={artist.color} />}
            <SourceBadge type={expression.sourceType} />
            <span className="text-text-muted text-xs">{expression.sourceDetail}</span>
          </div>
          <DifficultyBadge level={expression.difficulty} />
        </div>

        <div className="px-6 py-8 flex flex-col gap-8">
          {/* Korean text */}
          <section>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">🗣️ Original</p>
            <p className="text-4xl md:text-5xl font-serif text-text-primary leading-snug">
              {expression.korean}
            </p>
          </section>

          {/* Pronunciation */}
          <section>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-text-muted text-xs font-semibold uppercase tracking-widest">🔊 Pronunciation Guide</p>
              <AudioButton text={expression.korean} />
            </div>
            <div className="pronunciation-block">
              <p className="text-brand-cyan font-mono text-lg mb-1">{expression.romanization}</p>
              <p className="text-text-muted font-mono text-sm">{expression.pronunciation}</p>
            </div>
          </section>

          {/* Meaning */}
          <section>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">📖 Meaning</p>
            <p className="text-text-primary text-lg leading-relaxed">{expression.meaningEn}</p>
          </section>

          {/* Nuance */}
          <section>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">💡 Nuance & Usage</p>
            <div
              className="rounded-xl px-5 py-4 text-text-secondary text-sm leading-relaxed whitespace-pre-line"
              style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}
            >
              {expression.nuanceNote}
            </div>
          </section>

          {/* Examples */}
          <section>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-4">🌍 Real-life Examples</p>
            <div className="flex flex-col gap-4">
              {expression.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl px-5 py-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-text-muted text-xs mb-3">{i + 1}. {ex.context}</p>
                  {ex.dialogA && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-text-secondary text-sm">
                        <span className="text-brand-pink font-semibold">A: </span>{ex.dialogA}
                      </p>
                      {ex.dialogB && (
                        <p className="text-text-primary text-sm font-medium">
                          <span className="text-brand-cyan font-semibold">B: </span>{ex.dialogB}
                        </p>
                      )}
                    </div>
                  )}
                  {ex.sentence && (
                    <p className="text-text-primary text-sm font-medium">{ex.sentence}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section>
            <div className="flex flex-wrap gap-2">
              {expression.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full text-text-muted"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div
          className="px-6 py-4 border-t border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <ExpressionActions
            expressionId={expression.id}
            likes={expression.likes}
            saves={expression.saves}
          />
        </div>
      </article>

      {/* Related expressions */}
      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">Related Expressions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((expr) => (
              <ExpressionCard key={expr.id} expression={expr} artist={undefined} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
