import Link from 'next/link'
import { Layers, HelpCircle, ArrowRight, PenLine } from 'lucide-react'

const modes = [
  {
    href: '/learn/flashcard',
    icon: Layers,
    title: 'Flashcards',
    desc: 'Flip through expression cards to learn pronunciation and meaning. Sort into "got it" and "review again" piles for efficient study.',
    color: '#00D4FF',
    badge: 'Available Now',
  },
  {
    href: '/learn/quiz',
    icon: HelpCircle,
    title: 'Quiz',
    desc: "Test yourself with multiple-choice questions on the expressions you've studied. Build streaks and track your score.",
    color: '#FF2D78',
    badge: 'Available Now',
  },
  {
    href: '/learn/write',
    icon: PenLine,
    title: '따라쓰기',
    desc: 'Practice writing real K-pop expressions character by character on a canvas. Trace each syllable and get instant accuracy scores.',
    color: '#A855F7',
    badge: 'Available Now',
  },
]

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Study Modes</h1>
        <p className="text-text-muted">Choose how you want to learn K-pop Korean</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {modes.map(({ href, icon: Icon, title, desc, color, badge }) => (
          <Link key={href} href={href}>
            <div
              className="rounded-2xl p-6 cursor-pointer h-full flex flex-col gap-4 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #12121A, #1A1A2E)',
                border: `1px solid ${color}33`,
                boxShadow: `0 0 24px ${color}0A`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${color}1A`, color }}
              >
                <Icon size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary mb-1">{title}</h2>
                <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${color}1A`, color }}
                >
                  {badge}
                </span>
                <ArrowRight size={16} style={{ color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
