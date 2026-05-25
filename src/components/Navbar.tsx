'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Music2 } from 'lucide-react'

const navLinks = [
  { href: '/artists', label: 'Artists' },
  { href: '/expressions', label: 'Expressions' },
  { href: '/culture', label: '드라마 & 예능' },
  { href: '/learn', label: 'Learn' },
  { href: '/my', label: 'My Page' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Music2 size={22} className="text-brand-pink group-hover:scale-110 transition-transform" />
            <span className="font-display tracking-widest text-xl text-text-primary">
              KPOP <span className="text-brand-pink">KOREAN</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-pink/10 text-brand-pink'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-pink/10 text-brand-pink'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
