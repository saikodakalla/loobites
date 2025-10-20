import { useEffect, useMemo, useRef, useState } from 'react'
import { useMenus } from './hooks/useMenus'
import { supabase } from './lib/supabaseClient'

const API_BASES = (() => {
  const bases = []
  const envBase = import.meta?.env?.VITE_API_BASE
  if (envBase) bases.push(envBase)
  bases.push('')
  bases.push('http://localhost:4000')
  return bases
})()

async function fetchApi(path, options = {}) {
  let lastErr = null
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options)
      return res
    } catch (err) {
      lastErr = err
      continue
    }
  }
  throw lastErr
}

function formatMenuId(menuId = '') {
  if (!menuId) return ''
  return menuId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function starsFor(rating = 0) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating))))
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`
}

function LogoMark({ size = 28, color = '#000' }) {
  const height = size
  const width = size * 1.1
  const radius = 6
  const gap = 4
  const barH = (height - gap * 2) / 3
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" rx={radius} ry={radius} width={width} height={barH} fill={color} />
      <rect x="0" y={barH + gap} rx={radius} ry={radius} width={width} height={barH} fill={color} />
      <rect x="0" y={(barH + gap) * 2} rx={radius} ry={radius} width={width} height={barH} fill={color} />
    </svg>
  )
}

function GoogleIcon({ size = 18 }) {
  // Simplified Google "G" glyph
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.7h5.2c-.2 1.2-1.6 3.5-5.2 3.5-3.1 0-5.6-2.6-5.6-5.7s2.5-5.7 5.6-5.7c1.8 0 3 .7 3.7 1.3l2.5-2.4C16.8 3 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.2-4.8 8.6-9.6H12z"/>
      <path fill="#4285F4" d="M21.6 12.1H12v3.8h5.5c-.5 1.6-2.1 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.8 0 3 .7 3.7 1.3l2.6-2.5C16.9 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10 9.6-4.2 9.6-9.9c0-.6 0-1-.1-1z" opacity="0"/>
    </svg>
  )
}

function OutlookIcon({ size = 18 }) {
  // Simplified Outlook envelope/letter mark
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="#0A66C2" />
      <path d="M3 8l9 6 9-6" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  )
}

function SunIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </svg>
  )
}

function SearchIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" fill="currentColor" />
    </svg>
  )
}

function BellIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M13.73 21a2 2 0 01-3.46 0" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function ClockIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Avatar({ size = 30 }) {
  const d = size
  return (
    <svg width={d} height={d} viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FCA5A5" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#grad)" />
      <circle cx="16" cy="13" r="6" fill="#fff" opacity="0.85" />
      <rect x="7" y="20" width="18" height="8" rx="4" fill="#fff" opacity="0.85" />
    </svg>
  )
}

function AuthLanding({ dark = false }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const canUseAuth = !!supabase

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!canUseAuth) {
      setError('Authentication is currently unavailable. Please contact the site administrator.');
      return
    }
    if (mode === 'signup') {
      if (!email || !password || !confirmPassword) { setError('Please fill all required fields.'); return }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return }
      setLoading(true)
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || undefined } },
      })
      setLoading(false)
      if (err) setError(err.message)
      else setInfo('Sign up successful. Check your email if confirmation is required.')
      return
    }
    // login
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError(err.message)
  }

  const signInWithGoogle = async () => {
    setError('')
    setInfo('')
    if (!canUseAuth) {
      setError('Authentication is currently unavailable. Please contact the site administrator.');
      return
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    })
  }

  return (
    <div className={`lb-app ${dark ? 'theme-dark' : ''}`}>
      <header className="lb-header" role="banner">
        <div className="lb-header-inner">
          <div className="lb-brand" aria-label="LooBites">
            <LogoMark color={dark ? '#E9B949' : '#000'} />
            <span className="lb-wordmark">LooBites</span>
          </div>
        </div>
      </header>

      <main className="lb-main" role="main">
        <section className="lb-auth" aria-label="Authentication">
          <h1 className="lb-hero">Welcome to LooBites</h1>
          <p className="lb-subhead">Your guide to campus dining.</p>

          <div className="lb-card" aria-label="Authentication options">
            <div className="lb-tabs" role="tablist" aria-label="Auth mode">
              <button
                role="tab"
                aria-selected={mode === 'login'}
                className={`lb-tab ${mode === 'login' ? 'is-active' : ''}`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                role="tab"
                aria-selected={mode === 'signup'}
                className={`lb-tab ${mode === 'signup' ? 'is-active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form className="lb-form" onSubmit={onSubmit} noValidate>
              {mode === 'signup' && (
                <div className="lb-field">
                  <label htmlFor="fullName" className="lb-visually-hidden">Full Name</label>
                  <input id="fullName" name="fullName" type="text" placeholder="Full Name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
                </div>
              )}
              <div className="lb-field">
                <label htmlFor="identifier" className="lb-visually-hidden">Email</label>
                <input id="identifier" name="identifier" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="lb-field">
                <label htmlFor="password" className="lb-visually-hidden">Password</label>
                <input id="password" name="password" type="password" placeholder="Password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              </div>
              {mode === 'signup' && (
                <div className="lb-field">
                  <label htmlFor="confirmPassword" className="lb-visually-hidden">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                </div>
              )}

              {!!error && <div role="alert" style={{ color: '#E11D48', marginBottom: 8 }}>{error}</div>}
              {!!info && <div role="status" style={{ color: '#059669', marginBottom: 8 }}>{info}</div>}

              <button type="submit" className="lb-primary-btn" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="lb-divider" aria-hidden="true">Or continue with</div>

            <div className="lb-sso">
              <button type="button" className="lb-sso-btn" aria-label="Sign in with Google" onClick={signInWithGoogle} disabled={!canUseAuth || loading}>
                <span className="lb-sso-icon"><GoogleIcon /></span>
                <span className="lb-sso-label">Sign in with Google</span>
              </button>
            </div>

            {!canUseAuth && (
              <div style={{ paddingTop: 12, fontSize: 12, opacity: 0.85 }}>
                Missing Supabase environment variables. Add either
                <code style={{ marginLeft: 4 }}>VITE_SUPABASE_URL</code> and
                <code style={{ marginLeft: 4 }}>VITE_SUPABASE_ANON_KEY</code> or
                your existing <code style={{ marginLeft: 4 }}>LOOBITES_APP_*</code> keys to <code>.env.local</code>, then restart the dev server.
              </div>
            )}

            <p className="lb-legal">
              By continuing, you agree to our <a href="#" rel="noopener noreferrer">Terms of Service</a> and <a href="#" rel="noopener noreferrer">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

function Navbar({ dark, onToggleTheme, onNavigate, activeRoute }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchMounted, setSearchMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [cafesOpen, setCafesOpen] = useState(false)
  const [shrink, setShrink] = useState(false)
  const searchRef = useRef(null)
  const cafItemsRef = useRef([])
  const cafRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 6)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  const closeSearch = () => {
    setSearchOpen(false)
    setTimeout(() => setSearchMounted(false), 220)
  }

  const onSearchKey = (e) => {
    if (e.key === 'Escape') closeSearch()
  }

  const onCafKey = (e) => {
    if (!cafesOpen) return
    const items = cafItemsRef.current.filter(Boolean)
    const idx = items.findIndex((el) => el === document.activeElement)
    if (e.key === 'Escape') setCafesOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); (items[idx + 1] || items[0])?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (items[idx - 1] || items[items.length - 1])?.focus() }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!cafesOpen) return
      if (cafRef.current && !cafRef.current.contains(e.target)) {
        setCafesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cafesOpen])

  return (
    <header className={`home-header${shrink ? ' shrink' : ''}`} role="banner">
      <div className="home-container home-topnav">
        <nav className="home-topnav-inner" aria-label="Primary">
          <button className="home-brand-btn" type="button" aria-label="Go to Home" onClick={() => onNavigate('home')}>
            <span className="home-brand"><LogoMark color="#E7B83E" /><span className="home-wordmark">LooBites</span></span>
          </button>

          <div className="home-nav-item">
            <a
              href="#"
              className={`home-nav-link${activeRoute === 'home' ? ' is-active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('home') }}
            >
              Menu
            </a>
          </div>

          <div ref={cafRef} className={`home-nav-item has-dropdown${cafesOpen ? ' is-open' : ''}`} onKeyDown={onCafKey}>
            <a
              href="#"
              className={`home-nav-link${activeRoute === 'cafeteria' ? ' is-active' : ''}`}
              aria-haspopup="true"
              aria-expanded={cafesOpen ? 'true' : 'false'}
              onClick={(e) => { e.preventDefault(); setCafesOpen((o) => !o) }}
            >
              Cafeterias
            </a>
            <div className="home-dropdown" role="menu" aria-label="Cafeterias">
              <a ref={(el) => cafItemsRef.current[0] = el} href="#" role="menuitem" className="home-dropdown-item" onClick={(e) => { e.preventDefault(); setCafesOpen(false); onNavigate('cafeteria', { slug: 'cmh', name: 'The Market (CMH)' }) }}>The Market (CMH)</a>
              <a ref={(el) => cafItemsRef.current[1] = el} href="#" role="menuitem" className="home-dropdown-item" onClick={(e) => { e.preventDefault(); setCafesOpen(false); onNavigate('cafeteria', { slug: 'v1', name: "Mudie's (Village 1)" }) }}>Mudie's (Village 1)</a>
              <a ref={(el) => cafItemsRef.current[2] = el} href="#" role="menuitem" className="home-dropdown-item" onClick={(e) => { e.preventDefault(); setCafesOpen(false); onNavigate('cafeteria', { slug: 'rev', name: 'REVelation (Ron Eydt Village)' }) }}>REVelation (Ron Eydt Village)</a>
            </div>
          </div>

          <div className="home-nav-item">
            <a
              href="#"
              className={`home-nav-link${activeRoute === 'reviews' ? ' is-active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('reviews') }}
            >
              Reviews
            </a>
          </div>

          <div className="home-nav-item">
            <button className="home-icon-btn" type="button" aria-label="Search" onClick={() => { setSearchMounted(true); setSearchOpen(true) }}>
              <SearchIcon />
            </button>
          </div>

          <div className="home-nav-spacer" />

          <button className="home-icon-btn" type="button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark ? 'true' : 'false'} onClick={onToggleTheme}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="home-icon-btn" type="button" aria-label="Notifications"><BellIcon /></button>

          <div className="home-user">
            <button className="home-avatar-btn" type="button" aria-label="User menu" onClick={(e) => {
              const root = e.currentTarget.parentElement
              root.classList.toggle('open')
            }}>
              <Avatar />
            </button>
            <div className="home-user-menu" role="menu" aria-label="User menu">
              <a href="#" role="menuitem" onClick={(e) => { e.preventDefault(); onNavigate('profile', { username: 'me' }) }}>Profile</a>
              <a href="#" role="menuitem" onClick={(e) => e.preventDefault()}>My posts</a>
              <a href="#" role="menuitem" onClick={(e) => e.preventDefault()}>Settings</a>
              <a href="#" role="menuitem" onClick={async (e) => { e.preventDefault(); try { await supabase?.auth?.signOut?.() } finally { onNavigate('auth') } }}>Log out</a>
            </div>
          </div>
        </nav>
      </div>
      {searchMounted && (
        <div className={`cmd-overlay${!searchOpen ? ' is-exiting' : ''}`} role="dialog" aria-modal="true" onClick={closeSearch}>
          <div className={`cmd-dialog${!searchOpen ? ' is-exiting' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="cmd-input-row">
              <span className="cmd-icon"><SearchIcon /></span>
              <input
                ref={searchRef}
                type="text"
                className="cmd-input"
                placeholder="Search dishes or cafeterias"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
              />
              <button className="cmd-close" aria-label="Close" type="button" onClick={closeSearch}>Esc</button>
            </div>
            <div className="cmd-list" role="listbox" aria-label="Suggestions">
              <div className="cmd-item" role="option">Try “Butter Chicken”</div>
              <div className="cmd-item" role="option">Open “REVelation”</div>
              <div className="cmd-item" role="option">See “Past Meals”</div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function HomePage({ dark, onToggleTheme, onNavigate }) {
  return (
    <div className={`home-app ${dark ? 'theme-dark' : ''}`}>
      <Navbar dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} activeRoute="home" />

      <main className="home-main" role="main">
        <div className="home-container">
          <section className="home-hero-grid" aria-label="Featured">
            <a href="#" role="link" aria-label="Open Photo of the Day: Butter Chicken at REV, by Sai" className="hero-card hero-featured" onClick={(e) => { e.preventDefault(); onNavigate('dish', { slug: 'butter-chicken-rev' }) }}>
              <div className="hero-image hero-image-featured" aria-hidden="true" />
              <div className="hero-overlay" aria-hidden="true" />
              <div className="hero-content">
                <span className="hero-badge">PHOTO OF THE DAY</span>
                <h3 className="hero-title">Butter Chicken at REV</h3>
                <div className="hero-byline">by Sai</div>
              </div>
            </a>

            <a href="#" role="link" aria-label="Open Archive: See what you’ve missed" className="hero-card hero-secondary" onClick={(e) => { e.preventDefault(); onNavigate('history') }}>
              <div className="hero-image hero-image-secondary" aria-hidden="true" />
              <div className="hero-overlay light" aria-hidden="true" />
              <div className="hero-content dark">
                <span className="hero-badge">ARCHIVE</span>
                <h3 className="hero-title dark">See what you’ve missed</h3>
                <div className="hero-subtitle">Browse highlights and popular dishes</div>
              </div>
              <div className="hero-glyph" aria-hidden="true"><ClockIcon /></div>
            </a>
          </section>

          <section className="home-section">
            <h2 className="home-section-title">What’s for Dinner at Waterloo?</h2>

            <div className="home-venues-grid" aria-label="Venues">
              <a href="#" role="link" aria-label="Open The Market (CMH)." className="venue-card" onClick={(e) => { e.preventDefault(); onNavigate('cafeteria', { slug: 'cmh', name: 'The Market (CMH)' }) }}>
                <div className="venue-media img-sub" />
                <div className="venue-text">
                  <div className="venue-title">The Market (CMH)</div>
                  <div className="venue-stat"><span className="num"> </span></div>
                </div>
              </a>
              <a href="#" role="link" aria-label="Open Mudie’s (Village 1)." className="venue-card" onClick={(e) => { e.preventDefault(); onNavigate('cafeteria', { slug: 'v1', name: "Mudie's (Village 1)" }) }}>
                <div className="venue-media img-mudies" />
                <div className="venue-text">
                  <div className="venue-title">Mudie’s (Village 1)</div>
                  <div className="venue-stat"><span className="num"> </span></div>
                </div>
              </a>
              <a href="#" role="link" aria-label="Open REVelation (Ron Eydt Village)." className="venue-card" onClick={(e) => { e.preventDefault(); onNavigate('cafeteria', { slug: 'rev', name: 'REVelation (Ron Eydt Village)' }) }}>
                <div className="venue-media tile-rev">
                  <span className="rev-tag">safe for work</span>
                </div>
                <div className="venue-text">
                  <div className="venue-title">REVelation</div>
                  <div className="venue-stat"><span className="num"> </span></div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function ReviewsPage({ dark, onToggleTheme, onNavigate }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMenu, setSelectedMenu] = useState('all')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetchApi('/api/reviews')
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to load reviews')
        }
        if (mounted) setReviews(Array.isArray(payload) ? payload : [])
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load reviews')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const menuOptions = useMemo(() => {
    const ids = new Set()
    reviews.forEach((r) => { if (r.menuId) ids.add(r.menuId) })
    return Array.from(ids.values()).sort()
  }, [reviews])

  const filtered = useMemo(() => {
    if (selectedMenu === 'all') return reviews
    return reviews.filter((r) => r.menuId === selectedMenu)
  }, [reviews, selectedMenu])

  return (
    <div className={`home-app ${dark ? 'theme-dark' : ''}`}>
      <Navbar dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} activeRoute="reviews" />

      <main className="home-main" role="main">
        <div className="home-container">
          <h1 className="page-title">Community Reviews</h1>
          <p className="page-subtitle">See what diners are saying across menus.</p>

          <div className="reviews-controls">
            <label className="reviews-filter">
              <span>Filter by menu</span>
              <select value={selectedMenu} onChange={(e) => setSelectedMenu(e.target.value)}>
                <option value="all">All menus</option>
                {menuOptions.map((id) => (
                  <option key={id} value={id}>{formatMenuId(id)}</option>
                ))}
              </select>
            </label>
            <button className="pill-link" type="button" onClick={() => onNavigate('home')}>Back to menus</button>
          </div>

          {loading && <div className="reviews-loading">Loading reviews…</div>}
          {!!error && <div className="reviews-error" role="alert">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="reviews-empty">No reviews yet. Be the first to share your thoughts!</div>
          )}

          <div className="reviews">
            {filtered.map((review) => {
              const img = review.image ? `data:${review.image.mime};base64,${review.image.base64}` : null
              return (
                <div key={review.id} className="review-item">
                  <div className="review-head">
                    <Avatar size={24} />
                    <div>
                      <strong>{review.author || 'Guest'}</strong>
                      <div className="review-meta">
                        {formatMenuId(review.menuId)} · {starsFor(review.rating)} · {new Date(review.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="review-body">{review.body}</div>
                  {img && (
                    <div className="review-image">
                      <img src={img} alt={`${formatMenuId(review.menuId)} review`} />
                      {review.mlLabel && <span className="review-badge">ML: {review.mlLabel}</span>}
                    </div>
                  )}
                  {!img && review.mlLabel && (
                    <div className="review-footnote">ML label: {review.mlLabel}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

function PastMealsPage({ dark, onToggleTheme, onNavigate }) {
  return (
    <div className={`home-app ${dark ? 'theme-dark' : ''}`}>
      <Navbar dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} activeRoute="history" />
      <main className="home-main" role="main">
        <div className="home-container">
          <h1 className="page-title">Past Meals</h1>

          <section className="history-group">
            <h2 className="history-date">Monday, October 21</h2>
            <div className="history-list">
              <button className="meal-row" onClick={() => onNavigate('dish', { slug: 'chicken-stir-fry' })} aria-label="Open dish: Chicken Stir-Fry">
                <div className="meal-thumb" />
                <div className="meal-text">
                  <div className="meal-primary">Dinner</div>
                  <div className="meal-secondary">Chicken Stir-Fry</div>
                </div>
                <div className="meal-chevron">›</div>
              </button>
              <button className="meal-row" onClick={() => onNavigate('cafeteria', { slug: 'rev', name: 'REVelation' })} aria-label="Open cafeteria: REVelation">
                <div className="meal-thumb alt" />
                <div className="meal-text">
                  <div className="meal-primary">Lunch</div>
                  <div className="meal-secondary">REVelation (period menu)</div>
                </div>
                <div className="meal-chevron">›</div>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function CafeteriaPage({ dark, onToggleTheme, onNavigate, params }) {
  const title = params?.name || 'Cafeteria'
  const { data, loading } = useMenus()
  const slug = params?.slug
  const cafe = data?.cafeterias?.[slug]
  return (
    <div className={`home-app ${dark ? 'theme-dark' : ''}`}>
      <Navbar dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} activeRoute="cafeteria" />
      <main className="home-main" role="main">
        <div className="home-container">
          <div className="cafe-header">
            <h1 className="page-title">{title}</h1>
            <div className="cafe-sub">{data?.date || ''}</div>
            <div className="cafe-tools">
              <button type="button" className="cafe-tool">♥</button>
              <button type="button" className="cafe-tool">Follow</button>
              <button type="button" className="cafe-tool" aria-label="Notify me"><BellIcon /></button>
              <button type="button" className="cafe-tool">Share</button>
            </div>
          </div>
          {!loading && !cafe && (
            <div className="cafe-banner">
              <span>Menu not available for this cafeteria today</span>
            </div>
          )}
          <div className="dish-toolbar">
            <div className="toolbar-group">Sort: Trending</div>
            <div className="toolbar-spacer" />
            <div className="toolbar-group">Filters</div>
          </div>
          {loading && <div className="dish-grid"><div>Loading menu…</div></div>}
          {!loading && cafe && (
            <div>
              {cafe.stations.map((st, idx) => (
                <div key={idx} style={{ marginBottom: 24 }}>
                  <h2 className="home-section-title">{st.station}</h2>
                  <div className="dish-grid">
                    {st.items.map((it, j) => (
                      <button key={j} className="dish-card" onClick={() => onNavigate('dish', { slug: it.name.toLowerCase().replace(/\s+/g, '-') })} aria-label={`Open dish: ${it.name}`}>
                        <div className="dish-media" />
                        <div className="dish-title">{it.name}</div>
                        <div className="dish-meta">{it.tags && it.tags.length ? it.tags.join(' · ') : ' '}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function DishPage({ dark, onToggleTheme, onNavigate, params, session }) {
  const menuId = params?.slug || ''
  const dishName = formatMenuId(menuId) || 'Dish'
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoadingReviews(true)
      setReviewsError('')
      try {
        const res = await fetchApi(`/api/reviews?menuId=${encodeURIComponent(menuId)}`)
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to load reviews')
        }
        if (mounted) setReviews(Array.isArray(payload) ? payload : [])
      } catch (e) {
        if (mounted) setReviewsError(e.message || 'Failed to load reviews')
      } finally {
        if (mounted) setLoadingReviews(false)
      }
    }
    if (menuId) load()
    return () => { mounted = false }
  }, [menuId])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSubmitError('Only image files are supported.')
      return
    }
    setSubmitError('')
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    handleFileSelect(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const refreshReviews = async () => {
    setLoadingReviews(true)
    setReviewsError('')
    try {
      const res = await fetchApi(`/api/reviews?menuId=${encodeURIComponent(menuId)}`)
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || 'Failed to load reviews')
      setReviews(Array.isArray(payload) ? payload : [])
    } catch (e) {
      setReviewsError(e.message || 'Failed to load reviews')
    } finally {
      setLoadingReviews(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitMessage('')
    if (!body.trim()) {
      setSubmitError('Tell us a bit about the dish.')
      return
    }
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('menuId', menuId)
      form.append('rating', String(rating))
      form.append('body', body.trim())
      const author = session?.user?.user_metadata?.full_name || session?.user?.email || 'You'
      form.append('author', author)
      if (imageFile) {
        form.append('image', imageFile)
      }
      const res = await fetchApi('/api/reviews', { method: 'POST', body: form })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to submit review')
      }
      setSubmitMessage('Review submitted!')
      setBody('')
      setRating(5)
      clearImage()
      setReviews((prev) => [payload, ...prev])
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`home-app ${dark ? 'theme-dark' : ''}`}>
      <Navbar dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} activeRoute="dish" />
      <main className="home-main" role="main">
        <div className="home-container">
          <h1 className="page-title">{dishName}</h1>
          <div className="dish-meta-block">Served at <button className="pill-link" onClick={() => onNavigate('cafeteria', { slug: 'rev', name: 'REVelation' })}>REV</button></div>

          <section aria-label="Reviews" className="reviews-section">
            {loadingReviews && <div className="reviews-loading">Loading reviews…</div>}
            {!!reviewsError && <div className="reviews-error" role="alert">{reviewsError}</div>}

            {!loadingReviews && !reviewsError && (
              <div className="reviews">
                {reviews.length === 0 && <div className="reviews-empty">No reviews yet. Be the first!</div>}
                {reviews.map((review) => {
                  const img = review.image ? `data:${review.image.mime};base64,${review.image.base64}` : null;
                  return (
                    <div key={review.id} className="review-item">
                      <div className="review-head">
                        <Avatar size={24} />
                        <div>
                          <strong>{review.author || 'Guest'}</strong>
                          <div className="review-meta">{starsFor(review.rating)} · {new Date(review.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="review-body">{review.body}</div>
                      {img && (
                        <div className="review-image">
                          <img src={img} alt={`${dishName} review`} />
                          {review.mlLabel && <span className="review-badge">ML: {review.mlLabel}</span>}
                        </div>
                      )}
                      {!img && review.mlLabel && <div className="review-footnote">ML label: {review.mlLabel}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <form className="review-composer" onSubmit={onSubmit}>
            <h2>Leave a review</h2>
            <div className="review-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn${rating >= value ? ' is-active' : ''}`}
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows="3"
              placeholder="How was portion, taste, freshness?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <div
              className={`review-dropzone${isDragging ? ' is-dragging' : ''}${imageFile ? ' has-image' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!imagePreview && <span>Drag & drop a food photo or click to upload</span>}
              {imagePreview && (
                <div className="dropzone-preview">
                  <img src={imagePreview} alt="Selected preview" />
                  <button type="button" className="pill-link" onClick={(e) => { e.stopPropagation(); clearImage() }}>Remove photo</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileInputChange} hidden />
            </div>

            {!!submitError && <div className="reviews-error" role="alert">{submitError}</div>}
            {!!submitMessage && <div className="reviews-success" role="status">{submitMessage}</div>}

            <div className="review-actions">
              <button className="lb-primary-btn" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
              <button className="pill-link" type="button" onClick={refreshReviews} disabled={loadingReviews}>Refresh</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

function ProfilePage({ dark, onToggleTheme, onNavigate, params }) {
  const username = params?.username || 'me'
  return (
    <div className={`home-app ${dark ? 'theme-dark' : ''}`}>
      <Navbar dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} activeRoute="profile" />
      <main className="home-main" role="main">
        <div className="home-container">
          <div className="profile-header">
            <Avatar size={56} />
            <div className="profile-meta">
              <div className="profile-name">Your Name</div>
              <div className="profile-handle">@{username}</div>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-tile"><div className="num">12</div><div className="label">Reviews</div></div>
            <div className="stat-tile"><div className="num">8</div><div className="label">Photos</div></div>
            <div className="stat-tile"><div className="num">34</div><div className="label">Helpful</div></div>
          </div>
        </div>
      </main>
    </div>
  )
}



export default function App() {
  const [route, setRoute] = useState('auth')
  const [params, setParams] = useState({})
  const [dark, setDark] = useState(() => {
    try { return (localStorage.getItem('loobites:theme') === 'dark') } catch { return false }
  })
  const [session, setSession] = useState(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    if (!window.history.state || !window.history.state.route) {
      window.history.replaceState({ route: 'auth', params: {} }, '')
    } else {
      setRoute(window.history.state.route)
      setParams(window.history.state.params || {})
    }
    const onPop = (e) => {
      const r = e.state?.route || 'auth'
      const p = e.state?.params || {}
      if (!sessionRef.current && r !== 'auth') {
        window.history.pushState({ route: 'auth', params: {} }, '')
        setRoute('auth')
        setParams({})
        return
      }
      setRoute(r)
      setParams(p)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Supabase session init + listener
  useEffect(() => {
    if (!supabase) return
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted) setSession(data.session)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s)
    })
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  // Keep ref in sync
  useEffect(() => { sessionRef.current = session }, [session])

  // Route protection
  useEffect(() => {
    if (!session && route !== 'auth') {
      window.history.replaceState({ route: 'auth', params: {} }, '')
      setRoute('auth')
      setParams({})
    } else if (session && route === 'auth') {
      window.history.replaceState({ route: 'home', params: {} }, '')
      setRoute('home')
      setParams({})
    }
  }, [session, route])

  const navigate = (name, p = {}) => {
    if (!sessionRef.current && name !== 'auth') {
      window.history.pushState({ route: 'auth', params: {} }, '')
      setRoute('auth')
      setParams({})
      return
    }
    window.history.pushState({ route: name, params: p }, '')
    setRoute(name)
    setParams(p)
  }

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d
      try { localStorage.setItem('loobites:theme', next ? 'dark' : 'light') } catch { /* localStorage unavailable */ }
      return next
    })
  }

  if (route === 'auth') {
    return (
      <AuthLanding dark={dark} />
    )
  }
  if (route === 'home') {
    return <HomePage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} />
  }
  if (route === 'history') {
    return <PastMealsPage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} />
  }
  if (route === 'reviews') {
    return <ReviewsPage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} />
  }
  if (route === 'cafeteria') {
    return <CafeteriaPage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} params={params} />
  }
  if (route === 'dish') {
    return <DishPage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} params={params} session={session} />
  }
  if (route === 'profile') {
    return <ProfilePage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} params={params} />
  }
  return null
}
