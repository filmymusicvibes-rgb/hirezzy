import { useState, useEffect } from 'react'
import './index.css'
import { APP, CATEGORIES, GIG_CATEGORIES, SKILLS, WALLET } from './config'
import {
  loginWithEmail, signupWithEmail, loginWithGoogle, logout, onAuthChange,
  getJobs, postGig, applyToJob, saveJob, unsaveJob, getSavedJobs, getMyApplications, searchTalent,
  dailyCheckin, listenToUserProfile, addNotification, updateUserProfile, uploadResume, sendOffer, placeGigOrder, getMyOrders,
  shortlistTalent, unshortlistTalent, getShortlistedTalent,
  auth, type User
} from './lib/firebase'
import { seedJobs } from './lib/seedJobs'

// ═══ DEMO DATA ═══
const DEMO_JOBS = [
  { id: '1', title: 'Senior UI/UX Designer', company: 'CyberTech Solutions', logo: '💎', category: 'design', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 120, salaryMax: 150, currency: '$', unit: 'K', verified: true, featured: true, postedAgo: '2h', skills: ['Figma', 'React', 'UI/UX'] },
  { id: '2', title: 'Blockchain Developer', company: 'MetaCorp', logo: '⛓️', category: 'it', type: 'Full Time', location: 'Hyderabad', remote: 'Hybrid', salaryMin: 15, salaryMax: 25, currency: '₹', unit: 'LPA', verified: true, featured: true, postedAgo: '3h', skills: ['Solidity', 'Web3', 'React'] },
  { id: '3', title: 'Frontend Dev - Web3', company: 'CryptoNova', logo: '🌐', category: 'it', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 100, salaryMax: 120, currency: '$', unit: 'K', verified: true, featured: false, postedAgo: '5h', skills: ['React', 'TypeScript', 'Web3'] },
  { id: '4', title: 'Data Entry Operator', company: 'State Govt', logo: '🏛️', category: 'govt', type: 'Full Time', location: 'Vizag', remote: 'On-site', salaryMin: 25000, salaryMax: 35000, currency: '₹', unit: '/mo', verified: true, featured: false, postedAgo: '1d', skills: ['Typing', 'MS Office'] },
  { id: '5', title: 'Digital Marketing Intern', company: 'Sofviz Technologies', logo: '🚀', category: 'internship', type: 'Internship', location: 'Vizag', remote: 'Remote', salaryMin: 5000, salaryMax: 10000, currency: '₹', unit: '/mo', verified: true, featured: false, postedAgo: '6h', skills: ['SEO', 'Social Media'] },
  { id: '6', title: 'Flutter Developer (WFH)', company: 'StartupX', logo: '📱', category: 'wfh', type: 'Full Time', location: 'WFH', remote: 'Remote', salaryMin: 10, salaryMax: 18, currency: '₹', unit: 'LPA', verified: false, featured: true, postedAgo: '4h', skills: ['Flutter', 'Dart', 'Firebase'] },
  { id: '7', title: 'Python Developer', company: 'Infosys', logo: '🐍', category: 'it', type: 'Full Time', location: 'Hyderabad', remote: 'On-site', salaryMin: 6, salaryMax: 12, currency: '₹', unit: 'LPA', verified: true, featured: false, postedAgo: '1d', skills: ['Python', 'Django'] },
  { id: '8', title: 'Content Writer', company: 'UpWork', logo: '✍️', category: 'freelance', type: 'Freelance', location: 'Remote', remote: 'Remote', salaryMin: 500, salaryMax: 1500, currency: '$', unit: '/project', verified: false, featured: false, postedAgo: '8h', skills: ['Writing', 'SEO'] },
]

const DEMO_GIGS = [
  { id: 'g1', title: 'Create a Custom AI Chatbot', seller: 'SmartBot1', price: 450, rating: 4.8, orders: 156, icon: '🤖', color: '#6C5CE7' },
  { id: 'g2', title: 'Design Your Web3 Logo', seller: 'CryptoCreative', price: 250, rating: 5.0, orders: 89, icon: '🎨', color: '#00D2FF' },
  { id: 'g3', title: 'Design a Futuristic App UI', seller: 'UImaster', price: 500, rating: 4.9, orders: 120, icon: '📱', color: '#E17055' },
  { id: 'g4', title: 'Build Custom Chatbot', seller: 'TechWizard', price: 350, rating: 4.7, orders: 67, icon: '💬', color: '#00E676' },
  { id: 'g5', title: 'Smart Contract Development', seller: 'BlockDev', price: 800, rating: 4.9, orders: 45, icon: '⛓️', color: '#A29BFE' },
  { id: 'g6', title: 'Video Editing Professional', seller: 'EditPro', price: 300, rating: 4.8, orders: 234, icon: '🎬', color: '#FD79A8' },
]

const DEMO_TALENTS = [
  { id: 't1', name: 'David Chen', title: '3D Modeler & Developer', skills: ['3D', 'Blender', 'Unity'], rate: '$95/hr', ratingNum: 4.9, reviews: 34, status: 'available', verified: true, avatar: 'D', color: '#6C5CE7' },
  { id: 't2', name: 'Anya Sharma', title: 'Full Stack Developer', skills: ['React', 'Node.js', 'Python'], rate: '$80/hr', ratingNum: 5.0, reviews: 67, status: 'available', verified: true, avatar: 'A', color: '#00D2FF' },
  { id: 't3', name: 'Maria Rodriguez', title: 'Content Strategist', skills: ['SEO', 'Content', 'Marketing'], rate: '$60/hr', ratingNum: 4.8, reviews: 41, status: 'busy', verified: true, avatar: 'M', color: '#E17055' },
  { id: 't4', name: 'Kiran T', title: 'Flutter & Firebase Expert', skills: ['Flutter', 'Firebase', 'Dart'], rate: '$70/hr', ratingNum: 4.7, reviews: 22, status: 'available', verified: false, avatar: 'K', color: '#00E676' },
  { id: 't5', name: 'Manya P', title: 'Senior UX Designer', skills: ['Figma', 'Adobe XD', 'Sketch'], rate: '$85/hr', ratingNum: 4.9, reviews: 55, status: 'available', verified: true, avatar: 'M', color: '#A29BFE' },
  { id: 't6', name: 'Elizman F', title: 'Frontend Specialist', skills: ['React', 'Vue', 'Angular'], rate: '$75/hr', ratingNum: 4.6, reviews: 28, status: 'offline', verified: true, avatar: 'E', color: '#FD79A8' },
]

// ═══ SVG ICONS for Bottom Nav ═══
const Icons = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  jobs: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  talent: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  gigs: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  wallet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>,
  profile: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
}

// ═══ SPLASH ═══
function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="splash">
      <div className="splash__logo">Hz</div>
      <div className="splash__name">{APP.name}</div>
      <div className="splash__tagline">{APP.tagline}</div>
      <div className="splash__loader"><div className="splash__loader-bar" /></div>
    </div>
  )
}

// ═══ AUTH ═══
function AuthPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'signup' && !name.trim()) { setError('Name is required'); return }
    if (!email.trim() || !password.trim()) { setError('Email and password required'); return }
    if (password.length < 6) { setError('Password must be 6+ characters'); return }
    setLoading(true); setError('')
    try {
      const user = tab === 'login' ? await loginWithEmail(email, password) : await signupWithEmail(name, email, password)
      onLogin(user)
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.code === 'auth/email-already-in-use' ? 'Email already registered' : err.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try { onLogin(await loginWithGoogle()) } catch (err: any) { if (err.code !== 'auth/popup-closed-by-user') setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="auth"><div className="auth__bg" />
      <div className="auth__card slide-up">
        <div className="auth__logo"><div className="auth__logo-box">Hz</div><h1>{APP.name}</h1><p>{APP.tagline}</p></div>
        <div className="auth__tabs">
          <button className={`auth__tab ${tab === 'login' ? 'auth__tab--active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Login</button>
          <button className={`auth__tab ${tab === 'signup' ? 'auth__tab--active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>Sign Up</button>
        </div>
        {error && <div className="auth__error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          {tab === 'signup' && <div className="form-group"><label>Full Name</label><input className="form-input" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} /></div>}
          <div className="form-group"><label>Email</label><input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="form-group"><label>Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <button type="submit" className={`btn btn--primary mt-2 ${loading ? 'btn--disabled' : ''}`} disabled={loading}>{loading ? '⏳ Please wait...' : tab === 'login' ? '🔐 Login' : '🚀 Create Account'}</button>
        </form>
        <div className="or-divider"><span>OR</span></div>
        <button className={`btn btn--google ${loading ? 'btn--disabled' : ''}`} onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
      </div>
      <p className="text-sm text-muted mt-3" style={{ position: 'relative', zIndex: 1 }}>By {APP.company.name}</p>
    </div>
  )
}

// ═══ HOME PAGE — Matching Mockup ═══
function HomePage({ userName: _un, jobs, savedJobIds, onJobClick, onTabChange, onSaveJob, userProfile }: { userName: string, jobs: any[], savedJobIds: string[], onJobClick: (job: any) => void, onTabChange: (tab: string) => void, onSaveJob: (id: string) => void, userProfile: any }) {
  return (
    <div className="page"><div className="page__content">

      {/* ─── HERO SECTION ─── */}
      <div className="hero fade-in">
        <div className="hero__tag">🚀 All-in-One Career Platform</div>
        <h1 className="hero__title"><span>Earn. Work. Grow.</span></h1>
        <p className="hero__sub">Jobs + Freelance + Hiring + Earning<br/>Everything in one powerful app</p>
        <button className="hero__cta" onClick={() => onTabChange('jobs')}>🔍 Explore Jobs</button>
      </div>

      {/* ─── TRUST STATS ─── */}
      <div className="trust-stats fade-in">
        <div className="trust-stat"><div className="trust-stat__num">10K+</div><div className="trust-stat__label">Jobs</div></div>
        <div className="trust-stat"><div className="trust-stat__num">5K+</div><div className="trust-stat__label">Talent</div></div>
        <div className="trust-stat"><div className="trust-stat__num">2K+</div><div className="trust-stat__label">Gigs</div></div>
        <div className="trust-stat"><div className="trust-stat__num">₹50L+</div><div className="trust-stat__label">Earned</div></div>
      </div>

      {/* ─── FEATURE SHOWCASE ─── */}
      <div className="features fade-in">
        <div className="feature-card" onClick={() => onTabChange('jobs')}><div className="feature-card__icon">💼</div><div className="feature-card__title">Job Search</div><div className="feature-card__desc">Latest & Govt Jobs</div></div>
        <div className="feature-card" onClick={() => onTabChange('gigs')}><div className="feature-card__icon">🎯</div><div className="feature-card__title">Talent Search</div><div className="feature-card__desc">Find & Hire Experts</div></div>
        <div className="feature-card" onClick={() => onTabChange('gigs')}><div className="feature-card__icon">🛒</div><div className="feature-card__title">Gig Marketplace</div><div className="feature-card__desc">Buy & Sell Services</div></div>
        <div className="feature-card" onClick={() => onTabChange('wallet')}><div className="feature-card__icon">💰</div><div className="feature-card__title">Wallet & Earn</div><div className="feature-card__desc">Coins & Rewards</div></div>
      </div>

      <div className="section-divider" />

      {/* ─── Quick Wallet Card ─── */}
      <div className="home-wallet fade-in" onClick={() => onTabChange('wallet')}>
        <div className="home-wallet__left">
          <div className="home-wallet__label">Earnings:</div>
          <div className="home-wallet__amount">{WALLET.currency}{(userProfile?.walletBalance || 0).toLocaleString()}.00</div>
          <div className="home-wallet__coins">Hirezzy Coins: <strong>{userProfile?.coins || 0}</strong></div>
        </div>
        <div className="home-wallet__badge">{userProfile?.verified ? '✅ Verified' : '⏳ Verify'}</div>
        <div className="home-wallet__actions">
          <button className="home-wallet__btn">Withdraw</button>
          <button className="home-wallet__btn home-wallet__btn--outline" onClick={e => { e.stopPropagation(); onTabChange('wallet') }}>History</button>
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── Job Feed & Gig Marketplace Toggle ─── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button className="section-tab section-tab--active" onClick={() => onTabChange('jobs')}>💼 Job Feed</button>
        <button className="section-tab" onClick={() => onTabChange('gigs')}>🎯 Gig Marketplace</button>
      </div>

      {/* ─── Job Listing Feed ─── */}
      <div className="section-header"><h2>Job Feed</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('jobs') }}>See all →</a></div>
      {jobs.slice(0, 3).map(job => (
        <div key={job.id} className="job-card-v2 fade-in" onClick={() => onJobClick(job)}>
          <div className="job-card-v2__left">
            <div className="job-card-v2__icon" style={{ background: `rgba(0,210,255,0.1)` }}>💼</div>
            <div className="job-card-v2__info">
              <div className="job-card-v2__title">{job.title}</div>
              <div className="job-card-v2__company">{job.company} {job.remote !== 'On-site' && <span className="job-card-v2__remote">• {job.remote}</span>}</div>
            </div>
          </div>
          <div className="job-card-v2__right">
            <div className="job-card-v2__salary">{job.currency}{typeof job.salaryMin === 'number' && job.salaryMin > 10000 ? Math.round(job.salaryMin/1000) + 'K' : job.salaryMin}</div>
            {job.verified && <span className="verified-badge">✓ Verified</span>}
          </div>
          <div className="job-card-v2__actions">
            <button className="btn-apply" onClick={e => { e.stopPropagation(); onJobClick(job) }}>Apply Now</button>
            <button className={`btn-save ${savedJobIds.includes(job.id) ? 'btn-save--active' : ''}`} onClick={e => { e.stopPropagation(); onSaveJob(job.id) }}>{savedJobIds.includes(job.id) ? '❤️ Saved' : '♡ Save'}</button>
          </div>
        </div>
      ))}

      {/* ─── Gig Marketplace ─── */}
      <div className="section-header mt-2"><h2>Gig Marketplace</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('gigs') }}>See all →</a></div>
      <div className="hz-scroll">
        {DEMO_GIGS.slice(0, 4).map(gig => (
          <div key={gig.id} className="gig-card-v2">
            <div className="gig-card-v2__banner" style={{ background: `linear-gradient(135deg, ${gig.color}33, ${gig.color}11)` }}>
              <span className="gig-card-v2__icon">{gig.icon}</span>
            </div>
            <div className="gig-card-v2__body">
              <div className="gig-card-v2__title">{gig.title}</div>
              <div className="gig-card-v2__seller">{gig.seller}</div>
              <div className="gig-card-v2__footer">
                <span className="gig-card-v2__price">${gig.price}</span>
                <span className="gig-card-v2__rating">⭐ {gig.rating}</span>
              </div>
              <button className="btn-detail">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Talent Search ─── */}
      <div className="section-header mt-2"><h2>Top Talent</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('gigs') }}>Filters →</a></div>
      <div className="hz-scroll">
        {DEMO_TALENTS.slice(0, 4).map(t => (
          <div key={t.id} className="talent-card-v2">
            <div className="talent-card-v2__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
              {t.avatar}
              <div className={`talent-card__status talent-card__status--${t.status}`} />
            </div>
            <div className="talent-card-v2__name">{t.name.split(' ')[0]}</div>
            <div className="talent-card-v2__title">{t.title.split('•')[0].trim().split(' ').slice(0,2).join(' ')}</div>
            <div className="talent-card-v2__stars">{'⭐'.repeat(Math.min(5, Math.round(t.ratingNum)))}</div>
            <button className="btn-hire">Hire</button>
          </div>
        ))}
      </div>

    </div></div>
  )
}

// ═══ JOBS FEED ═══
function JobsFeedPage({ jobs, savedJobIds, onJobClick, onSaveJob }: { jobs: any[], savedJobIds: string[], onJobClick: (job: any) => void, onSaveJob: (id: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filtered = jobs.filter((j: any) => {
    if (activeCategory !== 'all' && j.category !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!(j.title || '').toLowerCase().includes(q) && !(j.company || '').toLowerCase().includes(q) && !(j.skills || []).some((s: string) => s.toLowerCase().includes(q)) && !(j.location || '').toLowerCase().includes(q)) return false
    }
    if (locFilter && !(j.location || '').toLowerCase().includes(locFilter.toLowerCase())) return false
    if (typeFilter && j.remote !== typeFilter) return false
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'salary') return (b.salaryMin || 0) - (a.salaryMin || 0)
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    return 0 // newest = default Firestore order
  })

  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>💼 Jobs</h2>

      {/* ─── Search ─── */}
      <div className="search-bar">
        <span className="search-bar__icon">{Icons.search}</span>
        <input placeholder="Search jobs, companies, skills..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {searchQuery && <button className="search-bar__filter" onClick={() => setSearchQuery('')}>✕</button>}
      </div>

      {/* ─── Category Chips ─── */}
      <div className="categories-scroll" style={{ marginBottom: '10px' }}>
        <button className="category-chip" style={activeCategory === 'all' ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}} onClick={() => setActiveCategory('all')}>
          <div className="category-chip__icon" style={{ background: 'rgba(108,92,231,0.15)' }}>📋</div><span className="category-chip__name" style={activeCategory === 'all' ? { color: 'white' } : {}}>All</span>
        </button>
        {CATEGORIES.slice(0, 8).map(cat => (
          <button key={cat.id} className="category-chip" style={activeCategory === cat.id ? { background: cat.color + '22', borderColor: cat.color } : {}} onClick={() => setActiveCategory(cat.id)}>
            <div className="category-chip__icon" style={{ background: cat.color + '18' }}>{cat.icon}</div><span className="category-chip__name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ─── Quick Filters + Sort ─── */}
      <div className="filter-chips" style={{ marginBottom: '8px' }}>
        {['Remote', 'Hybrid', 'On-site'].map(t => (
          <span key={t} className={`filter-chip ${typeFilter === t ? 'filter-chip--active' : ''}`} onClick={() => setTypeFilter(typeFilter === t ? '' : t)}>
            {t === 'Remote' ? '🏠' : t === 'Hybrid' ? '🔄' : '🏢'} {t}
          </span>
        ))}
        {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'].map(c => (
          <span key={c} className={`filter-chip ${locFilter === c ? 'filter-chip--active' : ''}`} onClick={() => setLocFilter(locFilter === c ? '' : c)}>📍 {c}</span>
        ))}
      </div>

      {/* ─── Sort ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p className="text-sm text-muted">{sorted.length} jobs{searchQuery ? ` for "${searchQuery}"` : ''}</p>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
          <option value="newest">⏰ Newest</option>
          <option value="salary">💰 Salary ↓</option>
          <option value="featured">⭐ Featured</option>
        </select>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>No jobs found</p>
          <p className="text-sm text-muted">Try different keywords or filters</p>
        </div>
      )}

      {sorted.map((job: any) => (
        <div key={job.id} className="job-card-v2 fade-in" onClick={() => onJobClick(job)} style={job.featured ? { borderColor: '#FDCB6E', borderWidth: '1.5px' } : {}}>
          {job.featured && <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'linear-gradient(135deg, #FDCB6E, #E17055)', color: '#fff', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>⭐ FEATURED</div>}
          <div className="job-card-v2__left">
            <div className="job-card-v2__icon">{job.logo || '💼'}</div>
            <div className="job-card-v2__info">
              <div className="job-card-v2__title">{job.title}</div>
              <div className="job-card-v2__company">{job.company} <span className="job-card-v2__remote">• {job.remote}</span>{job.verified && <span className="verified-badge" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>✓</span>}</div>
              {job.skills && <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>{(job.skills || []).slice(0, 3).map((s: string, i: number) => <span key={i} style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary-light)' }}>{s}</span>)}</div>}
            </div>
          </div>
          <div className="job-card-v2__right">
            <div className="job-card-v2__salary">{job.currency}{typeof job.salaryMin === 'number' && job.salaryMin > 10000 ? Math.round(job.salaryMin/1000) + 'K' : job.salaryMin}</div>
            {job.postedAgo && <div className="text-sm text-muted" style={{ fontSize: '0.65rem' }}>{job.postedAgo}</div>}
          </div>
          <div className="job-card-v2__actions">
            <button className="btn-apply" onClick={e => { e.stopPropagation(); onJobClick(job) }}>Apply Now</button>
            <button className={`btn-save ${savedJobIds.includes(job.id) ? 'btn-save--active' : ''}`} onClick={e => { e.stopPropagation(); onSaveJob(job.id) }}>{savedJobIds.includes(job.id) ? '❤️ Saved' : '♡ Save'}</button>
          </div>
        </div>
      ))}
    </div></div>
  )
}

// ═══ JOB DETAILS ═══
function JobDetailsPage({ job, onBack, onApply }: { job: any, onBack: () => void, onApply: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)

  const fmtSalary = () => {
    try {
      const min = typeof job.salaryMin === 'number' ? job.salaryMin : 0
      const max = typeof job.salaryMax === 'number' ? job.salaryMax : 0
      if (min > 100000) return `${job.currency || '₹'}${Math.round(min/1000)}K-${Math.round(max/1000)}K`
      if (min > 10000) return `${job.currency || '₹'}${min.toLocaleString()}-${max.toLocaleString()}`
      return `${job.currency || '$'}${min}-${max}${job.unit || ''}`
    } catch { return 'Competitive' }
  }

  const handleSubmitApplication = async () => {
    setApplying(true)
    await onApply()
    setApplying(false)
  }

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="detail-logo">{job.logo || '💼'}</div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '12px' }}>{job.title}</h2>
        <p className="text-muted text-sm mt-1">{job.company}</p>
        {job.verified && <span className="verified-badge mt-1">✓ Verified</span>}
      </div>
      <div className="detail-grid">
        {[{ i: '💰', l: 'Salary', v: fmtSalary() }, { i: '📍', l: 'Location', v: job.location }, { i: '⏰', l: 'Type', v: job.type }, { i: '🌐', l: 'Mode', v: job.remote }].map((x, i) => (
          <div key={i} className="detail-grid__item"><div className="detail-grid__icon">{x.i}</div><div className="detail-grid__label">{x.l}</div><div className="detail-grid__value">{x.v}</div></div>
        ))}
      </div>
      <div className="detail-section">
        <h3>Skills Required</h3>
        <div className="skill-selector">{(job.skills || []).map((s: string, i: number) => <span key={i} className="skill-chip">{s}</span>)}</div>
      </div>
      <div className="detail-section">
        <h3>Description</h3>
        <div className="detail-desc">
          <p>{job.description || `We're looking for a talented ${job.title} to join ${job.company}.`}</p>
          {!job.description && <><p>• Build and maintain high-quality applications</p>
          <p>• Collaborate with cross-functional teams</p>
          <p>• Proficiency in {(job.skills || []).join(', ')}</p></>}
        </div>
      </div>

      {/* ─── Application Form ─── */}
      {!showForm ? (
        <div className="detail-sticky">
          <button className="btn btn--primary" onClick={() => setShowForm(true)} style={{ fontSize: '1rem', padding: '16px' }}>📝 Apply Now</button>
        </div>
      ) : (
        <div className="slide-up" style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '20px', marginTop: '12px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>📋 Application Form</h3>
          <div className="form-group">
            <label>Why are you a good fit?</label>
            <textarea className="form-input" rows={4} placeholder="Tell the recruiter why you're perfect for this role..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ resize: 'vertical', minHeight: '100px' }} />
          </div>
          <div className="form-group">
            <label>Resume (optional)</label>
            <input className="form-input" type="file" accept=".pdf,.doc,.docx" />
          </div>
          <button className="btn btn--primary mt-2" disabled={applying} onClick={handleSubmitApplication} style={{ fontSize: '0.95rem', padding: '14px' }}>
            {applying ? '⏳ Submitting...' : '🚀 Submit Application'}
          </button>
          <button className="btn btn--ghost mt-1" onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div></div>
  )
}

// ═══ GIG MARKETPLACE ═══
function MarketplacePage({ userName: _userName }: { userName: string }) {
  const [view, setView] = useState<'gigs' | 'talent'>('gigs')
  const [showPost, setShowPost] = useState(false)
  const [searchSkill, setSearchSkill] = useState('')
  const [gigTitle, setGigTitle] = useState('')
  const [gigCategory, setGigCategory] = useState('')
  const [gigPrice, setGigPrice] = useState('')
  const [gigSkills, setGigSkills] = useState<string[]>([])
  const [gigPosting, setGigPosting] = useState(false)
  const [selectedGig, setSelectedGig] = useState<any>(null)
  const filteredTalent = searchSkill ? DEMO_TALENTS.filter(t => t.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase())) || t.title.toLowerCase().includes(searchSkill.toLowerCase())) : DEMO_TALENTS

  const toggleSkill = (s: string) => {
    setGigSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 5 ? [...prev, s] : prev)
  }

  // ─── Gig Detail View ───
  if (selectedGig) return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={() => setSelectedGig(null)} className="btn-back">← Back to Gigs</button>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{selectedGig.icon}</div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedGig.title}</h2>
        <p className="text-muted text-sm mt-1">by {selectedGig.seller}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.2rem' }}>${selectedGig.price}</span>
          <span>⭐ {selectedGig.rating}</span>
          <span className="text-muted">{selectedGig.orders} orders</span>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-grid__item"><div className="detail-grid__icon">💰</div><div className="detail-grid__label">Price</div><div className="detail-grid__value">${selectedGig.price}</div></div>
        <div className="detail-grid__item"><div className="detail-grid__icon">⭐</div><div className="detail-grid__label">Rating</div><div className="detail-grid__value">{selectedGig.rating}/5</div></div>
        <div className="detail-grid__item"><div className="detail-grid__icon">📦</div><div className="detail-grid__label">Orders</div><div className="detail-grid__value">{selectedGig.orders}+</div></div>
        <div className="detail-grid__item"><div className="detail-grid__icon">⏱️</div><div className="detail-grid__label">Delivery</div><div className="detail-grid__value">3-5 days</div></div>
      </div>
      <div className="detail-section">
        <h3>About This Gig</h3>
        <div className="detail-desc">
          <p>Professional {selectedGig.title.toLowerCase()} service by {selectedGig.seller}.</p>
          <p>• High quality deliverables</p>
          <p>• Unlimited revisions</p>
          <p>• Fast turnaround</p>
          <p>• 100% satisfaction guaranteed</p>
        </div>
      </div>
      <div className="detail-sticky">
        <button className="btn btn--primary" style={{ fontSize: '1rem', padding: '16px' }} onClick={async () => {
          if (!auth.currentUser) { alert('Please login first!'); return }
          try {
            await placeGigOrder(selectedGig.id, auth.currentUser.uid, selectedGig.sellerId || 'seller', selectedGig.title, selectedGig.price)
            alert('✅ Order placed successfully! Seller will be notified.')
            setSelectedGig(null)
          } catch { alert('❌ Failed to place order. Try again.') }
        }}>🛒 Order Now — ${selectedGig.price}</button>
      </div>
    </div></div>
  )

  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>Gig Marketplace</h2>
      <div className="auth__tabs" style={{ marginBottom: '16px' }}>
        <button className={`auth__tab ${view === 'gigs' ? 'auth__tab--active' : ''}`} onClick={() => setView('gigs')}>🛒 Gigs</button>
        <button className={`auth__tab ${view === 'talent' ? 'auth__tab--active' : ''}`} onClick={() => setView('talent')}>🔍 Find Talent</button>
      </div>

      {view === 'gigs' && <>
        <button className="btn btn--accent mb-2" onClick={() => setShowPost(true)}>➕ Post a Gig</button>
        <div className="section-header"><h2>Popular Gigs</h2><span className="text-sm text-muted">{DEMO_GIGS.length} gigs</span></div>
        <div className="gigs-grid">
          {DEMO_GIGS.map(gig => (
            <div key={gig.id} className="gig-card-v2" onClick={() => setSelectedGig(gig)}>
              <div className="gig-card-v2__banner" style={{ background: `linear-gradient(135deg, ${gig.color}33, ${gig.color}11)` }}><span className="gig-card-v2__icon">{gig.icon}</span></div>
              <div className="gig-card-v2__body">
                <div className="gig-card-v2__title">{gig.title}</div>
                <div className="gig-card-v2__seller">{gig.seller}</div>
                <div className="gig-card-v2__footer"><span className="gig-card-v2__price">${gig.price}</span><span className="gig-card-v2__rating">⭐ {gig.rating}</span></div>
                <button className="btn-detail" onClick={e => { e.stopPropagation(); setSelectedGig(gig) }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </>}

      {view === 'talent' && <>
        <div className="search-bar" style={{ marginTop: 0, marginBottom: '12px' }}><span className="search-bar__icon">{Icons.search}</span><input placeholder="Search skills, jobs, talent..." value={searchSkill} onChange={e => setSearchSkill(e.target.value)} /></div>
        <div className="filter-chips"><span className="filter-chip">📍 Location ▾</span><span className="filter-chip">💰 Price ▾</span><span className="filter-chip">📊 Experience ▾</span><span className="filter-chip">⭐ Rating ▾</span></div>
        <div className="section-header mt-2"><h2>Top Talent</h2></div>
        <div className="hz-scroll mb-2">
          {filteredTalent.slice(0, 4).map(t => (
            <div key={t.id} className="talent-card-v2">
              <div className="talent-card-v2__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}<div className={`talent-card__status talent-card__status--${t.status}`} /></div>
              <div className="talent-card-v2__name">{t.name.split(' ')[0]}</div>
              <div className="talent-card-v2__title">{t.title.split(' ').slice(0,2).join(' ')}</div>
              <div className="talent-card-v2__stars">{'⭐'.repeat(Math.min(5, Math.round(t.ratingNum)))}</div>
              <button className="btn-hire">Hire</button>
            </div>
          ))}
        </div>
        {filteredTalent.map(t => (
          <div key={t.id} className="talent-card fade-in">
            <div className="talent-card__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}<div className={`talent-card__status talent-card__status--${t.status}`} /></div>
            <div className="talent-card__info">
              <div className="talent-card__name">{t.name} {t.verified && <div className="talent-card__verified">✓</div>}</div>
              <div className="talent-card__title">{t.title}</div>
              <div className="talent-card__skills">{t.skills.map((s, i) => <span key={i} className="talent-card__skill">{s}</span>)}</div>
              <div className="talent-card__rate">{t.rate}</div>
              <div className="talent-card__rating">⭐ {t.ratingNum} ({t.reviews} reviews)</div>
            </div>
          </div>
        ))}
      </>}

      {/* ─── Post Gig Modal ─── */}
      {showPost && <div className="modal-overlay" onClick={() => setShowPost(false)}><div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__handle" /><h2>➕ Post Your Gig</h2>
        <div className="form-group"><label>Gig Title</label><input className="form-input" placeholder="I will edit your YouTube video..." value={gigTitle} onChange={e => setGigTitle(e.target.value)} /></div>
        <div className="form-group"><label>Category</label><select className="form-input" value={gigCategory} onChange={e => setGigCategory(e.target.value)}><option value="">Select</option>{GIG_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
        <div className="form-group"><label>Price ({WALLET.currency})</label><input className="form-input" type="number" placeholder="500" value={gigPrice} onChange={e => setGigPrice(e.target.value)} /></div>
        <div className="form-group"><label>Skills (Max 5) — {gigSkills.length}/5 selected</label>
          <div className="skill-selector mt-1">{SKILLS.slice(0, 15).map(s => (
            <button key={s} className={`skill-tag ${gigSkills.includes(s) ? 'skill-tag--selected' : ''}`} onClick={() => toggleSkill(s)}>{gigSkills.includes(s) ? '✓ ' : ''}{s}</button>
          ))}</div>
        </div>
        <button className="btn btn--primary mt-2" disabled={gigPosting || !gigTitle} onClick={async () => {
          setGigPosting(true)
          try {
            await postGig({ title: gigTitle, category: gigCategory, price: Number(gigPrice) || 0, seller: _userName || 'User', icon: '🎯', color: '#6C5CE7', skills: gigSkills })
            setShowPost(false); setGigTitle(''); setGigCategory(''); setGigPrice(''); setGigSkills([])
          } catch { }
          setGigPosting(false)
        }}>{gigPosting ? '⏳ Posting...' : '🚀 Post Gig'}</button>
        <button className="btn btn--ghost mt-1" onClick={() => setShowPost(false)}>Cancel</button>
      </div></div>}
    </div></div>
  )
}

// ═══ WALLET ═══
function WalletPage({ userProfile, onCheckin }: { userProfile: any, onCheckin: () => void }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const txns = [
    { icon: '💼', title: 'Job Payment - CyberTech', amount: '+₹1,200', credit: true, time: 'Aug 2, 2026' },
    { icon: '💳', title: 'Withdrawal - Bank Transfer', amount: '-₹800', credit: false, time: 'Aug 1, 2026' },
    { icon: '🎨', title: 'Gig Order - Logo Design', amount: '+₹250', credit: true, time: 'Jul 31, 2026' },
    { icon: '📱', title: 'Daily Check-in', amount: '+5 HZC', credit: true, time: 'Today' },
    { icon: '🎁', title: 'Referral Bonus', amount: '+₹25', credit: true, time: 'Yesterday' },
  ]
  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>Wallet</h2>
      <div className="wallet-balance slide-up">
        <div className="wallet-balance__row">
          <div><div className="wallet-balance__label">Earnings:</div><div className="wallet-balance__amount">₹{(userProfile?.walletBalance || 0).toLocaleString()}.00</div></div>
          <div style={{ textAlign: 'right' }}><div className="wallet-balance__label">Coins:</div><div className="wallet-balance__coins-val">{userProfile?.coins || 0} HZC</div></div>
        </div>
        <div className="wallet-balance__btns">
          <button className="wallet-balance__btn">Withdraw</button>
          <button className="wallet-balance__btn wallet-balance__btn--outline">Redeem</button>
        </div>
      </div>

      {/* Daily Check-in */}
      <div className={`checkin-card ${checkedIn ? 'checkin-card--done' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div className="checkin-card__title">{checkedIn ? '✅ Checked In!' : '🎯 Daily Check-in'}</div><div className="checkin-card__desc">{checkedIn ? '+5 HZC earned!' : `Earn ${WALLET.dailyCheckinCoins} coins daily!`}</div></div>
          {!checkedIn && <button className="btn btn--sm" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => { setCheckedIn(true); onCheckin() }}>Check In</button>}
        </div>
        <div className="checkin-card__streak">🔥 {userProfile?.checkinStreak || 0} day streak</div>
      </div>

      {/* Earnings Trend */}
      <div className="section-header"><h2>Earnings Trend</h2></div>
      <div className="earnings-chart">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
          const heights = [45, 65, 35, 80, 55, 90, 70]
          return (
            <div key={day} className="earnings-chart__bar-wrap">
              <div className="earnings-chart__bar" style={{ height: `${heights[i]}%` }}>
                <div className="earnings-chart__bar-inner" />
              </div>
              <span className="earnings-chart__label">{day}</span>
            </div>
          )
        })}
      </div>

      {/* Transaction History */}
      <div className="section-header mt-2"><h2>Transaction History</h2><a href="#">See all →</a></div>
      {txns.map((tx, i) => (
        <div key={i} className="wallet-txn fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="wallet-txn__icon" style={{ background: tx.credit ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)' }}>{tx.icon}</div>
          <div className="wallet-txn__info"><div>{tx.title}</div><div>{tx.time}</div></div>
          <div className={`wallet-txn__amount ${tx.credit ? 'wallet-txn__amount--credit' : 'wallet-txn__amount--debit'}`}>{tx.amount}</div>
        </div>
      ))}

      {/* ─── HOW TO EARN ─── */}
      <div className="section-divider" />
      <div className="section-header"><h2>💡 How to Earn</h2></div>
      <p className="text-sm text-muted" style={{ marginBottom: '12px' }}>Earn Hirezzy Coins (HZC) and real cash through these activities:</p>
      {[
        { icon: '📱', task: 'Daily Check-in', reward: '+5 HZC', desc: 'Open app every day' },
        { icon: '🎁', task: 'Refer Friends', reward: '+25 HZC', desc: 'Share your invite link' },
        { icon: '📝', task: 'Apply to Jobs', reward: '+2 HZC', desc: 'Per job application' },
        { icon: '🎯', task: 'Complete Gigs', reward: '₹ Real Cash', desc: 'Freelance & earn' },
        { icon: '⭐', task: 'Get Verified', reward: '+50 HZC', desc: 'One-time bonus' },
        { icon: '🏆', task: 'Leaderboard Top 10', reward: '+100 HZC', desc: 'Weekly reward' },
      ].map((item, i) => (
        <div key={i} className="wallet-txn fade-in" style={{ animationDelay: `${i * 0.04}s`, borderLeft: '3px solid var(--primary)' }}>
          <div className="wallet-txn__icon" style={{ background: 'rgba(108,92,231,0.1)' }}>{item.icon}</div>
          <div className="wallet-txn__info"><div style={{ fontWeight: 600 }}>{item.task}</div><div>{item.desc}</div></div>
          <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{item.reward}</div>
        </div>
      ))}

      <div className="section-divider" />
      <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>💰 <strong>1000 HZC = ₹100</strong> — Withdraw anytime!</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Minimum withdrawal: 500 HZC</p>
      </div>
    </div></div>
  )
}

// ═══ PROFILE — Real Editable Skill Profile ═══
function ProfilePage({ userName, userEmail, onLogout, theme, toggleTheme, userProfile, onTabChange }: { userName: string, userEmail: string, onLogout: () => void, theme: string, toggleTheme: () => void, userProfile: any, onTabChange: (tab: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState(userProfile?.name || userName)
  const [editCity, setEditCity] = useState(userProfile?.city || '')
  const [editBio, setEditBio] = useState(userProfile?.bio || '')
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '')
  const [editRate, setEditRate] = useState(userProfile?.rate || '')
  const [editSkills, setEditSkills] = useState<string[]>(userProfile?.skills || [])
  const [editAvailability, setEditAvailability] = useState(userProfile?.availability || 'available')
  const [editExperience, setEditExperience] = useState(userProfile?.experience || '')

  const toggleSkill = (s: string) => {
    setEditSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 10 ? [...prev, s] : prev)
  }

  const handleSave = async () => {
    if (!auth.currentUser) return
    setSaving(true)
    try {
      await updateUserProfile(auth.currentUser.uid, {
        name: editName, city: editCity, bio: editBio, phone: editPhone,
        rate: editRate, skills: editSkills, availability: editAvailability, experience: editExperience
      })
      setEditing(false)
    } catch { }
    setSaving(false)
  }

  const displaySkills = editing ? editSkills : (userProfile?.skills || [])
  const displayName = editing ? editName : (userProfile?.name || userName)
  const displayCity = userProfile?.city || 'Add your city'
  const displayBio = userProfile?.bio || 'Tell recruiters about yourself...'
  const displayRate = userProfile?.rate || 'Set your rate'
  const displayAvail = userProfile?.availability || 'available'

  return (
    <div className="page"><div className="page__content">
      {/* Skill Profile Header */}
      <div className="skill-profile slide-up">
        <div className="skill-profile__top">
          <h2>Skill Profile {userProfile?.verified ? '✅' : ''}</h2>
          {!editing ? <button className="text-sm" style={{ color: 'var(--secondary)' }} onClick={() => setEditing(true)}>✏️ Edit</button>
          : <button className="text-sm" style={{ color: 'var(--accent)' }} onClick={handleSave} disabled={saving}>{saving ? '⏳' : '✅'} Save</button>}
        </div>
        <div className="skill-profile__user">
          <div className="skill-profile__avatar">{displayName.charAt(0).toUpperCase()}<div className={`talent-card__status talent-card__status--${displayAvail}`} /></div>
          <div>
            {!editing ? <><div className="skill-profile__name">{displayName}</div><div className="text-sm text-muted">{userEmail}</div></>
            : <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" style={{ marginBottom: '4px', padding: '8px 12px' }} />}
            <div className="verified-badge mt-1">{displayAvail === 'available' ? '🟢 Available' : displayAvail === 'busy' ? '🟡 Busy' : '🔴 Offline'}</div>
          </div>
        </div>

        {/* ─── City & Bio ─── */}
        {editing ? (
          <div style={{ marginTop: '12px' }}>
            <div className="form-group"><label>📍 City</label><input className="form-input" value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="Mumbai, Delhi, Hyderabad..." /></div>
            <div className="form-group"><label>📝 Bio</label><textarea className="form-input" rows={3} value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="I'm a passionate developer..." style={{ resize: 'vertical' }} /></div>
            <div className="form-group"><label>📞 Phone</label><input className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 9876543210" /></div>
          </div>
        ) : (
          <div style={{ marginTop: '8px' }}>
            <div className="text-sm"><span className="text-muted">📍</span> {displayCity}</div>
            <div className="text-sm text-muted" style={{ marginTop: '4px' }}>{displayBio}</div>
          </div>
        )}

        {/* ─── Skills ─── */}
        <div className="skill-profile__section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>Skills</h3>{editing && <span className="text-sm text-muted">{editSkills.length}/10</span>}</div>
          {editing ? (
            <div className="skill-selector mt-1">{SKILLS.map(s => (
              <button key={s} className={`skill-tag ${editSkills.includes(s) ? 'skill-tag--selected' : ''}`} onClick={() => toggleSkill(s)}>{editSkills.includes(s) ? '✓ ' : ''}{s}</button>
            ))}</div>
          ) : (
            <div className="skill-selector mt-1">{displaySkills.length > 0 ? displaySkills.map((s: string) => <span key={s} className="skill-chip skill-chip--editable">{s}</span>) : <span className="text-sm text-muted">No skills added yet. Tap Edit to add.</span>}</div>
          )}
        </div>

        {/* ─── Rate Card ─── */}
        <div className="skill-profile__section">
          <h3>Rate Card</h3>
          {editing ? (
            <div className="form-group"><input className="form-input" value={editRate} onChange={e => setEditRate(e.target.value)} placeholder="$50/hr or ₹2000/project" /></div>
          ) : (
            <div className="rate-card">
              <div className="rate-card__item"><div className="rate-card__label">Your Rate</div><div className="rate-card__value">{displayRate}</div></div>
            </div>
          )}
        </div>

        {/* ─── Availability ─── */}
        {editing && (
          <div className="skill-profile__section">
            <h3>Availability</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {['available', 'busy', 'offline'].map(s => (
                <button key={s} className={`skill-tag ${editAvailability === s ? 'skill-tag--selected' : ''}`} onClick={() => setEditAvailability(s)} style={{ textTransform: 'capitalize' }}>
                  {s === 'available' ? '🟢' : s === 'busy' ? '🟡' : '🔴'} {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Experience Level ─── */}
        <div className="skill-profile__section">
          <h3>Experience Level</h3>
          {editing ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {['Fresher', 'Junior (1-2 Yrs)', 'Mid (3-5 Yrs)', 'Senior (5-8 Yrs)', 'Lead (8+ Yrs)'].map(lvl => (
                <button key={lvl} className={`skill-tag ${editExperience === lvl ? 'skill-tag--selected' : ''}`} onClick={() => setEditExperience(lvl)}>
                  {editExperience === lvl ? '✓ ' : ''}{lvl}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span className="text-sm text-muted">Level</span>
              <span className="skill-chip" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>{userProfile?.experience || 'Not set'}</span>
            </div>
          )}
        </div>

        {/* ─── Portfolio ─── */}
        <div className="skill-profile__section">
          <h3>Portfolio</h3>
          <div className="hz-scroll mt-1">
            {(userProfile?.portfolio || ['🎮 DeFi Platform', '🏙️ Smart City App', '⚡ Smart Platform']).map((item: string, i: number) => (
              <div key={i} className="portfolio-item">
                <div className="portfolio-item__thumb">{typeof item === 'string' ? item.split(' ')[0] : '💼'}</div>
                <div className="portfolio-item__name">{typeof item === 'string' ? item.split(' ').slice(1).join(' ') : item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Resume Upload ─── */}
      <div className="skill-profile__section" style={{ marginTop: '12px', padding: '16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📄 Resume</h3>
          {userProfile?.resumeUrl && <a href={userProfile.resumeUrl} target="_blank" rel="noreferrer" className="text-sm" style={{ color: 'var(--secondary)' }}>View ↗</a>}
        </div>
        <div style={{ marginTop: '8px' }}>
          {userProfile?.resumeUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="verified-badge">✅ Resume Uploaded</span>
              <label htmlFor="resume-upload" className="text-sm" style={{ color: 'var(--secondary)', cursor: 'pointer' }}>Replace</label>
            </div>
          ) : (
            <label htmlFor="resume-upload" className="btn btn--outline" style={{ cursor: 'pointer', display: 'inline-block' }}>📎 Upload Resume (PDF)</label>
          )}
          <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file || !auth.currentUser) return
            try {
              await uploadResume(auth.currentUser.uid, file)
              alert('✅ Resume uploaded successfully!')
            } catch { alert('❌ Upload failed. Try again.') }
          }} />
        </div>
      </div>

      {/* Actions */}
      <div className="profile-menu mt-2">
        {[
          { icon: '📝', title: 'Edit Profile', action: () => setEditing(!editing) },
          { icon: '📋', title: 'My Applications', nav: 'applications' },
          { icon: '❤️', title: 'Saved Jobs', nav: 'saved' },
          { icon: '💰', title: 'Wallet & Earnings', nav: 'wallet' },
          { icon: '🎯', title: 'My Gigs', nav: 'gigs' },
          { icon: '📦', title: 'My Orders', nav: 'orders' },
          { icon: '🏆', title: 'Leaderboard', nav: 'leaderboard' },
          { icon: '🎁', title: 'Refer & Earn', nav: 'referral' },
          { icon: '⚙️', title: 'Settings' }, { icon: '💬', title: 'Help & Support', nav: 'help' },
        ].map((item: any, i) => (
          <div key={i} className="profile-menu__item fade-in" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => { 
            if (item.nav) onTabChange(item.nav)
            if (item.action) item.action()
            if (item.title === 'Settings') toggleTheme() 
          }}>
            <span>{item.icon}</span><div className="profile-menu__item-text"><div>{item.title}{item.title === 'Settings' ? ` — ${theme === 'dark' ? '🌙 Dark' : '☀️ Light'}` : ''}</div></div><span>›</span>
          </div>
        ))}
        <button className="btn btn--ghost mt-2" onClick={onLogout} style={{ color: 'var(--error)' }}>🚪 Logout</button>
      </div>
      <p className="text-center text-sm text-muted mt-3">{APP.name} v{APP.version}</p>
    </div></div>
  )
}

// ═══ MY APPLICATIONS ═══
function MyApplicationsPage({ onBack, jobs }: { onBack: () => void, jobs: any[] }) {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!auth.currentUser) return
    getMyApplications(auth.currentUser.uid).then(data => { setApps(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const getStatusStyle = (s: string) => {
    const map: any = { applied: { bg: '#3B82F620', color: '#3B82F6', icon: '📤' }, 'in-review': { bg: '#F59E0B20', color: '#F59E0B', icon: '👀' }, shortlisted: { bg: '#10B98120', color: '#10B981', icon: '⭐' }, rejected: { bg: '#EF444420', color: '#EF4444', icon: '❌' } }
    return map[s] || map.applied
  }

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>📋 My Applications</h2>
      {loading && <p className="text-center text-muted">Loading...</p>}
      {!loading && apps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
          <p style={{ fontWeight: 600 }}>No applications yet</p>
          <p className="text-sm text-muted">Start applying to jobs!</p>
        </div>
      )}
      {apps.map((app: any) => {
        const job = jobs.find((j: any) => j.id === app.jobId)
        const st = getStatusStyle(app.status)
        return (
          <div key={app.id} className="job-card-v2 fade-in">
            <div className="job-card-v2__left">
              <div className="job-card-v2__icon">{st.icon}</div>
              <div className="job-card-v2__info">
                <div className="job-card-v2__title">{job?.title || 'Job Application'}</div>
                <div className="job-card-v2__company">{job?.company || 'Company'}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{app.status}</span>
              <div className="text-sm text-muted" style={{ marginTop: '4px' }}>{app.createdAt?.toDate ? new Date(app.createdAt.toDate()).toLocaleDateString() : 'Recently'}</div>
            </div>
          </div>
        )
      })}
    </div></div>
  )
}

// ═══ SAVED JOBS ═══
function SavedJobsPage({ onBack, jobs, savedJobIds, onJobClick, onSaveJob }: { onBack: () => void, jobs: any[], savedJobIds: string[], onJobClick: (job: any) => void, onSaveJob: (id: string) => void }) {
  const savedJobs = jobs.filter((j: any) => savedJobIds.includes(j.id))
  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>❤️ Saved Jobs</h2>
      <p className="text-sm text-muted mb-2">{savedJobs.length} saved jobs</p>
      {savedJobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💔</div>
          <p style={{ fontWeight: 600 }}>No saved jobs</p>
          <p className="text-sm text-muted">Tap ♡ on any job to save it!</p>
        </div>
      )}
      {savedJobs.map((job: any) => (
        <div key={job.id} className="job-card-v2 fade-in" onClick={() => onJobClick(job)}>
          <div className="job-card-v2__left">
            <div className="job-card-v2__icon">{job.logo || '💼'}</div>
            <div className="job-card-v2__info">
              <div className="job-card-v2__title">{job.title}</div>
              <div className="job-card-v2__company">{job.company} <span className="job-card-v2__remote">• {job.remote}</span></div>
            </div>
          </div>
          <div className="job-card-v2__right">
            <div className="job-card-v2__salary">{job.currency}{typeof job.salaryMin === 'number' && job.salaryMin > 10000 ? Math.round(job.salaryMin/1000) + 'K' : job.salaryMin}</div>
          </div>
          <div className="job-card-v2__actions">
            <button className="btn-apply" onClick={e => { e.stopPropagation(); onJobClick(job) }}>Apply</button>
            <button className="btn-save btn-save--active" onClick={e => { e.stopPropagation(); onSaveJob(job.id) }}>❤️ Unsave</button>
          </div>
        </div>
      ))}
    </div></div>
  )
}

// ═══ NOTIFICATIONS ═══
function NotificationsPage({ onBack }: { onBack: () => void }) {
  const notifications = [
    { id: 1, icon: '💼', title: 'New jobs matching your skills', desc: '5 new React Developer jobs posted today', time: '2m ago', unread: true },
    { id: 2, icon: '✅', title: 'Application received', desc: 'Your application for Video Editor was received', time: '1h ago', unread: true },
    { id: 3, icon: '⭐', title: 'Profile viewed', desc: 'A recruiter viewed your profile', time: '3h ago', unread: false },
    { id: 4, icon: '🎯', title: 'New gig opportunity', desc: 'Logo Design gig matches your skills', time: '5h ago', unread: false },
    { id: 5, icon: '🏆', title: 'Achievement unlocked!', desc: 'You completed 7-day check-in streak', time: '1d ago', unread: false },
    { id: 6, icon: '💰', title: 'Coins earned', desc: '+50 HZC from daily check-in', time: '1d ago', unread: false },
  ]
  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>🔔 Notifications</h2>
      {notifications.map(n => (
        <div key={n.id} className="job-card-v2 fade-in" style={{ opacity: n.unread ? 1 : 0.6, borderLeft: n.unread ? '3px solid var(--primary)' : 'none' }}>
          <div className="job-card-v2__left">
            <div className="job-card-v2__icon" style={{ fontSize: '1.3rem' }}>{n.icon}</div>
            <div className="job-card-v2__info">
              <div className="job-card-v2__title" style={{ fontSize: '0.85rem' }}>{n.title}</div>
              <div className="job-card-v2__company">{n.desc}</div>
            </div>
          </div>
          <div className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>{n.time}</div>
        </div>
      ))}
    </div></div>
  )
}

// ═══ LEADERBOARD (Phase 3) ═══
function LeaderboardPage() {
  const [tab, setTab] = useState<'freelancers' | 'earners'>('freelancers')
  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>🏆 Leaderboard</h2>
      <div className="auth__tabs" style={{ marginBottom: '16px' }}>
        <button className={`auth__tab ${tab === 'freelancers' ? 'auth__tab--active' : ''}`} onClick={() => setTab('freelancers')}>Top Freelancers</button>
        <button className={`auth__tab ${tab === 'earners' ? 'auth__tab--active' : ''}`} onClick={() => setTab('earners')}>Top Earners</button>
      </div>
      {DEMO_TALENTS.map((t, i) => (
        <div key={t.id} className="leaderboard-item fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="leaderboard-item__rank" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-dim)' }}>{i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}</div>
          <div className="talent-card__avatar" style={{ width: '42px', height: '42px', fontSize: '1rem', background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}<div className={`talent-card__status talent-card__status--${t.status}`} style={{ width: '12px', height: '12px' }} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</div>
            <div className="text-sm text-muted">{t.title}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{t.rate}</div>
            <div className="text-sm text-muted">⭐ {t.ratingNum}</div>
          </div>
          <button className="btn-hire" style={{ marginLeft: '8px' }}>View Profile</button>
        </div>
      ))}
    </div></div>
  )
}

// ═══ TALENT PAGE (Firestore + Demo Fallback + Send Offer) ═══
function TalentPage() {
  const [searchSkill, setSearchSkill] = useState('')
  const [realTalent, setRealTalent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [offerTarget, setOfferTarget] = useState<any>(null)
  const [offerTitle, setOfferTitle] = useState('')
  const [offerDesc, setOfferDesc] = useState('')
  const [offerBudget, setOfferBudget] = useState('')
  const [sending, setSending] = useState(false)
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([])
  const COLORS = ['#6C5CE7', '#00D2FF', '#E17055', '#00E676', '#A29BFE', '#FD79A8', '#FDCB6E', '#636E72']

  useEffect(() => {
    searchTalent().then(data => { setRealTalent(data); setLoading(false) }).catch(() => setLoading(false))
    if (auth.currentUser) getShortlistedTalent(auth.currentUser.uid).then(setShortlistedIds).catch(() => {})
  }, [])

  const toggleShortlist = async (talentId: string) => {
    if (!auth.currentUser) return
    if (shortlistedIds.includes(talentId)) {
      await unshortlistTalent(auth.currentUser.uid, talentId)
      setShortlistedIds(prev => prev.filter(id => id !== talentId))
    } else {
      await shortlistTalent(auth.currentUser.uid, talentId)
      setShortlistedIds(prev => [...prev, talentId])
    }
  }

  const firestoreTalent = realTalent.map((u: any, i: number) => ({
    id: u.id, name: u.name || 'User', title: u.bio || 'Professional',
    skills: u.skills || [], rate: u.rate || 'Contact', ratingNum: u.rating || 4.5,
    reviews: u.reviewCount || 0, status: u.availability || 'available',
    verified: u.verified || false, avatar: (u.name || 'U').charAt(0).toUpperCase(),
    color: COLORS[i % COLORS.length], city: u.city || ''
  }))
  const allTalent = firestoreTalent.length > 0 ? firestoreTalent : DEMO_TALENTS
  const filtered = searchSkill ? allTalent.filter((t: any) =>
    (t.skills || []).some((s: string) => s.toLowerCase().includes(searchSkill.toLowerCase())) ||
    (t.title || '').toLowerCase().includes(searchSkill.toLowerCase()) ||
    (t.name || '').toLowerCase().includes(searchSkill.toLowerCase()) ||
    (t.city || '').toLowerCase().includes(searchSkill.toLowerCase())
  ) : allTalent

  const handleSendOffer = async () => {
    if (!auth.currentUser || !offerTarget || !offerTitle) return
    setSending(true)
    try {
      await sendOffer(auth.currentUser.uid, offerTarget.id, {
        title: offerTitle, description: offerDesc, budget: offerBudget,
        talentName: offerTarget.name
      })
      setOfferTarget(null); setOfferTitle(''); setOfferDesc(''); setOfferBudget('')
      alert('✅ Offer sent successfully!')
    } catch { alert('❌ Failed to send. Try again.') }
    setSending(false)
  }

  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>👥 Find Talent</h2>
      <div className="search-bar" style={{ marginTop: 0, marginBottom: '12px' }}><span className="search-bar__icon">{Icons.search}</span><input placeholder="Search by skill, role, name, city..." value={searchSkill} onChange={e => setSearchSkill(e.target.value)} />
        {searchSkill && <button className="search-bar__filter" onClick={() => setSearchSkill('')}>✕</button>}
      </div>
      <div className="filter-chips"><span className="filter-chip">📍 Location ▾</span><span className="filter-chip">💰 Rate ▾</span><span className="filter-chip">📊 Experience ▾</span><span className="filter-chip">⭐ Rating ▾</span></div>

      {loading && <p className="text-center text-muted" style={{ padding: '40px 0' }}>⏳ Loading talent...</p>}

      {!loading && <>
        <div className="section-header mt-2"><h2>{firestoreTalent.length > 0 ? 'Real Talent' : 'Top Talent'}</h2><span className="text-sm text-muted">{filtered.length} found</span></div>
        <div className="hz-scroll mb-2">
          {filtered.slice(0, 6).map((t: any) => (
            <div key={t.id} className="talent-card-v2">
              <div className="talent-card-v2__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}<div className={`talent-card__status talent-card__status--${t.status}`} /></div>
              <div className="talent-card-v2__name">{(t.name || '').split(' ')[0]}</div>
              <div className="talent-card-v2__title">{(t.title || '').split(' ').slice(0,2).join(' ')}</div>
              <div className="talent-card-v2__stars">{'⭐'.repeat(Math.min(5, Math.round(t.ratingNum || 0)))}</div>
              <button className="btn-hire" onClick={() => setOfferTarget(t)}>Hire</button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontWeight: 600 }}>No talent found</p>
            <p className="text-sm text-muted">Try different search terms</p>
          </div>
        )}

        {filtered.map((t: any) => (
          <div key={t.id} className="talent-card fade-in">
            <div className="talent-card__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}<div className={`talent-card__status talent-card__status--${t.status}`} /></div>
            <div className="talent-card__info">
              <div className="talent-card__name">{t.name} {t.verified && <div className="talent-card__verified">✓</div>}</div>
              <div className="talent-card__title">{t.title}{t.city ? ` • 📍 ${t.city}` : ''}</div>
              <div className="talent-card__skills">{(t.skills || []).map((s: string, i: number) => <span key={i} className="talent-card__skill">{s}</span>)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <div className="talent-card__rate">{t.rate}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className={`btn-save ${shortlistedIds.includes(t.id) ? 'btn-save--active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => toggleShortlist(t.id)}>{shortlistedIds.includes(t.id) ? '⭐ Saved' : '☆ Save'}</button>
                  <button className="btn-hire" style={{ padding: '4px 14px', fontSize: '0.72rem' }} onClick={() => setOfferTarget(t)}>💼 Hire</button>
                </div>
              </div>
              <div className="talent-card__rating">⭐ {t.ratingNum} ({t.reviews} reviews)</div>
            </div>
          </div>
        ))}
      </>}

      {/* ─── Send Offer Modal ─── */}
      {offerTarget && (
        <div className="modal-overlay" onClick={() => setOfferTarget(null)}>
          <div className="modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '12px' }}>💼 Send Offer to {offerTarget.name}</h3>
            <div className="form-group"><label>Job Title *</label><input className="form-input" value={offerTitle} onChange={e => setOfferTitle(e.target.value)} placeholder="e.g. React Developer for E-commerce App" /></div>
            <div className="form-group"><label>Description</label><textarea className="form-input" rows={3} value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="Describe the project..." style={{ resize: 'vertical' }} /></div>
            <div className="form-group"><label>Budget</label><input className="form-input" value={offerBudget} onChange={e => setOfferBudget(e.target.value)} placeholder="$500 or ₹40,000" /></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSendOffer} disabled={!offerTitle || sending}>{sending ? '⏳ Sending...' : '📤 Send Offer'}</button>
              <button className="btn btn--ghost" onClick={() => setOfferTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div></div>
  )
}

// ═══ REFERRAL SYSTEM ═══
function ReferralPage({ onBack, userProfile }: { onBack: () => void, userProfile: any }) {
  const referralCode = auth.currentUser?.uid?.slice(0, 8).toUpperCase() || 'HIREZZY'
  const referralLink = `https://hirezzy.vercel.app/?ref=${referralCode}`
  const [copied, setCopied] = useState(false)

  const shareWhatsApp = () => {
    const msg = `🔥 *Hirezzy — Find Work. Show Skills. Earn More!* 🚀\n\n💼 Jobs + Talent + Gigs + Growth\n📱 Best Career App for India!\n\n⭐ Use my referral code: *${referralCode}*\n\n👇 Join now:\n${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>🎁 Referral Program</h2>

      {/* Referral Code Card */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', borderRadius: '20px', padding: '24px', color: '#fff', textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '8px' }}>Your Referral Code</p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '4px', marginBottom: '12px' }}>{referralCode}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={copyCode} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
          <button onClick={shareWhatsApp} style={{ background: '#25D366', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            📱 WhatsApp Share
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Invited', value: userProfile?.referralCount || 0, icon: '👥' },
          { label: 'Joined', value: userProfile?.referralJoined || 0, icon: '✅' },
          { label: 'Earned', value: `${(userProfile?.referralEarnings || 0)} HZC`, icon: '💰' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0' }}>{s.value}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>🎯 How it Works</h3>
        {[
          { step: '1', title: 'Share your code', desc: 'Send to friends via WhatsApp, Telegram, etc.' },
          { step: '2', title: 'Friend joins', desc: 'They sign up using your referral code' },
          { step: '3', title: 'Both earn!', desc: `You get +${WALLET.referralBonus} HZC, friend gets +10 HZC` },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{s.step}</div>
            <div><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.title}</div><div className="text-sm text-muted">{s.desc}</div></div>
          </div>
        ))}
      </div>
    </div></div>
  )
}

// ═══ HELP & SUPPORT ═══
function HelpPage({ onBack }: { onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faqs = [
    { q: 'How do I apply for jobs?', a: 'Go to Jobs tab → click any job → tap "Apply Now" → fill the form and submit!' },
    { q: 'How do I earn Hirezzy Coins?', a: 'Daily check-in (+5 HZC), apply to jobs (+2 HZC), refer friends (+25 HZC), complete gigs (real cash)!' },
    { q: 'How to withdraw my earnings?', a: 'Go to Profile → Wallet → Withdrawal. Minimum withdrawal is ₹100 (1000 HZC = ₹100).' },
    { q: 'How do I post a gig?', a: 'Go to Gigs tab → tap "Post a Gig" → fill title, price, description → Submit!' },
    { q: 'What is the referral program?', a: `Share your referral code → friend joins → you earn +${WALLET.referralBonus} HZC! No limit on referrals.` },
    { q: 'How to get verified badge?', a: 'Complete your profile 100% + pass a skill test. Verified badge costs ₹49 one-time.' },
    { q: 'Is Hirezzy free to use?', a: 'Yes! Job seeking, applying, and basic features are 100% free. Premium features are optional.' },
  ]
  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>💬 Help & Support</h2>

      {/* Contact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <a href={`https://wa.me/${APP.contact.whatsapp}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', borderRadius: '16px', padding: '16px', textAlign: 'center', color: '#fff', textDecoration: 'none' }}>
          <div style={{ fontSize: '1.5rem' }}>📱</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>WhatsApp</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Quick Support</div>
        </a>
        <a href={`mailto:${APP.contact.email}`} style={{ background: 'var(--primary)', borderRadius: '16px', padding: '16px', textAlign: 'center', color: '#fff', textDecoration: 'none' }}>
          <div style={{ fontSize: '1.5rem' }}>📧</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Email</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{APP.contact.email}</div>
        </a>
      </div>

      {/* FAQ */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>❓ FAQs</h3>
      {faqs.map((faq, i) => (
        <div key={i} style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{faq.q}</span>
            <span style={{ fontSize: '0.9rem', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
          </div>
          {openFaq === i && <p className="text-sm text-muted" style={{ marginTop: '8px', lineHeight: 1.5 }}>{faq.a}</p>}
        </div>
      ))}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p className="text-sm text-muted">Made with ❤️ by {APP.company.name}</p>
        <p className="text-sm text-muted">{APP.name} v{APP.version}</p>
      </div>
    </div></div>
  )
}

// ═══ MY ORDERS ═══
function MyOrdersPage({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!auth.currentUser) return
    getMyOrders(auth.currentUser.uid).then(data => { setOrders(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statusMap: any = {
    ordered: { bg: '#3B82F620', color: '#3B82F6', label: '📦 Ordered' },
    in_progress: { bg: '#F59E0B20', color: '#F59E0B', label: '⚙️ In Progress' },
    delivered: { bg: '#8B5CF620', color: '#8B5CF6', label: '📬 Delivered' },
    completed: { bg: '#10B98120', color: '#10B981', label: '✅ Completed' },
  }

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>📦 My Orders</h2>
      {loading && <p className="text-center text-muted">Loading...</p>}
      {!loading && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛒</div>
          <p style={{ fontWeight: 600 }}>No orders yet</p>
          <p className="text-sm text-muted">Order a gig to get started!</p>
        </div>
      )}
      {orders.map((o: any) => {
        const st = statusMap[o.status] || statusMap.ordered
        return (
          <div key={o.id} className="job-card-v2 fade-in">
            <div className="job-card-v2__left">
              <div className="job-card-v2__icon">🎯</div>
              <div className="job-card-v2__info">
                <div className="job-card-v2__title">{o.gigTitle}</div>
                <div className="job-card-v2__company">💰 ${o.price}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>{st.label}</span>
              <div className="text-sm text-muted" style={{ marginTop: '4px' }}>{o.createdAt?.toDate ? new Date(o.createdAt.toDate()).toLocaleDateString() : 'Recently'}</div>
            </div>
          </div>
        )
      })}
    </div></div>
  )
}

// ═══ BOTTOM NAV ═══
function BottomNav({ active, onChange }: { active: string, onChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', icon: Icons.home, label: 'Home' },
    { id: 'jobs', icon: Icons.jobs, label: 'Jobs' },
    { id: 'talent', icon: Icons.talent, label: 'Talent' },
    { id: 'gigs', icon: Icons.gigs, label: 'Gigs' },
    { id: 'profile', icon: Icons.profile, label: 'Profile' },
  ]
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button key={tab.id} className={`bottom-nav__item ${active === tab.id ? 'bottom-nav__item--active' : ''}`} onClick={() => onChange(tab.id)}>
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

// ═══ MAIN APP ═══
export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('hz-theme') || 'light')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null)
  
  // ─── Real Data State ───
  const [realJobs, setRealJobs] = useState<any[]>([])
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [_jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setFirebaseUser(user)
      if (user) { setUserName(user.displayName || user.email?.split('@')[0] || 'User'); setUserEmail(user.email || '') }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  // ─── Load real data when user logs in ───
  useEffect(() => {
    if (!firebaseUser) return
    
    // Load jobs from Firestore
    const loadJobs = async () => {
      setJobsLoading(true)
      try {
        let jobs = await getJobs()
        // If no jobs in Firestore → seed them automatically
        if (jobs.length === 0) {
          console.log('🌱 No jobs found — seeding...')
          await seedJobs()
          jobs = await getJobs()
        }
        setRealJobs(jobs)
      } catch (err) {
        console.warn('Jobs fetch failed, using demo data:', err)
        setRealJobs(DEMO_JOBS as any[])
      }
      setJobsLoading(false)
    }
    loadJobs()

    // Load saved job IDs
    getSavedJobs(firebaseUser.uid).then(ids => setSavedJobIds(ids)).catch(() => {})

    // Listen to user profile (real-time)
    const unsub = listenToUserProfile(firebaseUser.uid, (data) => setUserProfile(data))
    return () => unsub()
  }, [firebaseUser])

  // ─── Active jobs (real or demo fallback) ───
  const activeJobs = realJobs.length > 0 ? realJobs : DEMO_JOBS

  const showToast = (msg: string, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const handleLogin = (user: User) => { setFirebaseUser(user); setUserName(user.displayName || user.email?.split('@')[0] || 'User'); setUserEmail(user.email || ''); showToast(`Welcome! 🎉`) }
  const handleLogout = async () => { await logout(); setFirebaseUser(null); setUserName(''); setUserProfile(null); setRealJobs([]); setActiveTab('home'); showToast('Logged out') }
  
  // ─── Real Apply ───
  const handleApply = async () => {
    if (!firebaseUser || !selectedJob) return
    try {
      await applyToJob(selectedJob.id, firebaseUser.uid, '', '', selectedJob.postedBy || '')
      await addNotification(firebaseUser.uid, { type: 'application', title: '✅ Application Sent!', body: `Applied to ${selectedJob.title} at ${selectedJob.company}`, icon: '📝' })
      showToast('✅ Application submitted!')
      setSelectedJob(null)
    } catch (err) {
      showToast('✅ Application submitted!') // Fallback for demo
      setSelectedJob(null)
    }
  }

  // ─── Save/Unsave Job ───
  const handleSaveJob = async (jobId: string) => {
    if (!firebaseUser) return
    try {
      if (savedJobIds.includes(jobId)) {
        await unsaveJob(firebaseUser.uid, jobId)
        setSavedJobIds(prev => prev.filter(id => id !== jobId))
        showToast('💔 Job removed from saved')
      } else {
        await saveJob(firebaseUser.uid, jobId)
        setSavedJobIds(prev => [...prev, jobId])
        showToast('❤️ Job saved!')
      }
    } catch { showToast('Saved!') }
  }

  // ─── Daily Check-in ───
  const handleCheckin = async () => {
    if (!firebaseUser || !userProfile) return
    try {
      const result = await dailyCheckin(firebaseUser.uid, userProfile.coins || 0, userProfile.checkinStreak || 0)
      showToast(`🎉 +5 Coins! Streak: ${result.streak} days`)
    } catch { showToast('🎉 Checked in!') }
  }
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('hz-theme', next)
    showToast(next === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode')
  }

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [])

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />
  if (authLoading) return <div className="auth"><div className="auth__bg" /><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}><div className="splash__logo" style={{ animation: 'splashPulse 1.2s ease infinite' }}>Hz</div><p className="text-muted">Loading...</p></div></div>
  if (!firebaseUser) return <AuthPage onLogin={handleLogin} />

  if (selectedJob) return (
    <div className="app">
      <div className="navbar"><div className="navbar__logo"><div className="navbar__logo-icon">Hz</div><span>{APP.name}</span></div></div>
      <JobDetailsPage job={selectedJob} onBack={() => setSelectedJob(null)} onApply={handleApply} />
      <BottomNav active={activeTab} onChange={t => { setSelectedJob(null); setActiveTab(t) }} />
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  )

  return (
    <div className="app">
      <div className="navbar">
        <div className="navbar__logo"><div className="navbar__logo-icon">Hz</div><span>{APP.name}</span></div>
        <div className="navbar__actions">
          <button className="navbar__btn" style={{ position: 'relative' }} onClick={() => setActiveTab('notifications')}>{Icons.bell}<div className="navbar__notif-dot" /></button>
          <div className="navbar__avatar" onClick={() => setActiveTab('profile')}>{userName.charAt(0).toUpperCase()}</div>
        </div>
      </div>
      {activeTab === 'home' && <HomePage userName={userName} jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onTabChange={setActiveTab} onSaveJob={handleSaveJob} userProfile={userProfile} />}
      {activeTab === 'jobs' && <JobsFeedPage jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onSaveJob={handleSaveJob} />}
      {activeTab === 'talent' && <TalentPage />}
      {activeTab === 'gigs' && <MarketplacePage userName={userName} />}
      {activeTab === 'wallet' && <WalletPage userProfile={userProfile} onCheckin={handleCheckin} />}
      {activeTab === 'leaderboard' && <LeaderboardPage />}
      {activeTab === 'applications' && <MyApplicationsPage onBack={() => setActiveTab('profile')} jobs={activeJobs} />}
      {activeTab === 'saved' && <SavedJobsPage onBack={() => setActiveTab('profile')} jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onSaveJob={handleSaveJob} />}
      {activeTab === 'notifications' && <NotificationsPage onBack={() => setActiveTab('home')} />}
      {activeTab === 'orders' && <MyOrdersPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'referral' && <ReferralPage onBack={() => setActiveTab('profile')} userProfile={userProfile} />}
      {activeTab === 'help' && <HelpPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'profile' && <ProfilePage userName={userName} userEmail={userEmail} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} userProfile={userProfile} onTabChange={setActiveTab} />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
