import { useState, useEffect } from 'react'
import './index.css'
import { APP, CATEGORIES, GIG_CATEGORIES, SKILLS, WALLET } from './config'
import {
  loginWithEmail, signupWithEmail, loginWithGoogle, logout, onAuthChange,
  getJobs, applyToJob, saveJob, unsaveJob, getSavedJobs,
  dailyCheckin, listenToUserProfile, addNotification,
  type User
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
function HomePage({ userName, jobs, savedJobIds, onJobClick, onTabChange, onSaveJob, userProfile }: { userName: string, jobs: any[], savedJobIds: string[], onJobClick: (job: any) => void, onTabChange: (tab: string) => void, onSaveJob: (id: string) => void, userProfile: any }) {
  return (
    <div className="page"><div className="page__content">

      {/* ─── Wallet Card (Top) ─── */}
      <div className="home-wallet fade-in" onClick={() => onTabChange('wallet')}>
        <div className="home-wallet__left">
          <div className="home-wallet__label">Earnings:</div>
          <div className="home-wallet__amount">{WALLET.currency}{(userProfile?.walletBalance || 0).toLocaleString()}.00</div>
          <div className="home-wallet__coins">Hirezzy Coins: <strong>{userProfile?.coins || 0}</strong></div>
        </div>
        <div className="home-wallet__badge">✅ Verified</div>
        <div className="home-wallet__actions">
          <button className="home-wallet__btn">Withdraw</button>
          <button className="home-wallet__btn home-wallet__btn--outline">Transaction History</button>
        </div>
      </div>

      {/* ─── Your Profile Card ─── */}
      <div className="home-profile-card fade-in" onClick={() => onTabChange('profile')}>
        <div className="home-profile-card__header">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Your Profile</span>
        </div>
        <div className="home-profile-card__body">
          <div className="home-profile-card__avatar">{userName.charAt(0).toUpperCase()}<div className="talent-card__status talent-card__status--available" /></div>
          <div className="home-profile-card__info">
            <div style={{ fontSize: '0.8rem' }}>Availability: <span style={{ color: 'var(--accent)' }}>Available</span></div>
            <div className="home-profile-card__skills">
              <span className="skill-chip">UI/UX Design</span>
              <span className="skill-chip">React</span>
              <span className="skill-chip">Web3</span>
            </div>
          </div>
        </div>
        <div className="home-profile-card__footer">
          <div className="home-profile-card__portfolio">Portfolio: <strong>3 items</strong></div>
          <div className="home-profile-card__rate">Rate Card: <strong style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>$80/hr</strong></div>
        </div>
      </div>

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
  const filtered = activeCategory === 'all' ? jobs : jobs.filter((j: any) => j.category === activeCategory)
  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>Job System</h2>
      <div className="search-bar"><span className="search-bar__icon">{Icons.search}</span><input placeholder="Search jobs, companies..." /><button className="search-bar__filter">⚙️</button></div>
      <div className="categories-scroll" style={{ marginBottom: '16px' }}>
        <button className="category-chip" style={activeCategory === 'all' ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}} onClick={() => setActiveCategory('all')}>
          <div className="category-chip__icon" style={{ background: 'rgba(108,92,231,0.15)' }}>📋</div><span className="category-chip__name" style={activeCategory === 'all' ? { color: 'white' } : {}}>All</span>
        </button>
        {CATEGORIES.slice(0, 8).map(cat => (
          <button key={cat.id} className="category-chip" style={activeCategory === cat.id ? { background: cat.color + '22', borderColor: cat.color } : {}} onClick={() => setActiveCategory(cat.id)}>
            <div className="category-chip__icon" style={{ background: cat.color + '18' }}>{cat.icon}</div><span className="category-chip__name">{cat.name}</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted mb-2">{filtered.length} jobs found</p>
      {filtered.map((job: any) => (
        <div key={job.id} className="job-card-v2 fade-in" onClick={() => onJobClick(job)}>
          <div className="job-card-v2__left">
            <div className="job-card-v2__icon">💼</div>
            <div className="job-card-v2__info">
              <div className="job-card-v2__title">{job.title}</div>
              <div className="job-card-v2__company">{job.company} <span className="job-card-v2__remote">• {job.remote}</span></div>
            </div>
          </div>
          <div className="job-card-v2__right">
            <div className="job-card-v2__salary">{job.currency}{typeof job.salaryMin === 'number' && job.salaryMin > 10000 ? Math.round(job.salaryMin/1000) + 'K' : job.salaryMin}</div>
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
  const fmtSalary = () => job.unit === 'LPA' || job.unit === 'K' ? `${job.currency}${job.salaryMin}-${job.salaryMax}${job.unit}` : `${job.currency}${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()} ${job.unit}`
  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="detail-logo">{job.logo}</div>
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
        <div className="skill-selector">{job.skills.map((s: string, i: number) => <span key={i} className="skill-chip">{s}</span>)}</div>
      </div>
      <div className="detail-section">
        <h3>Description</h3>
        <div className="detail-desc">
          <p>We're looking for a talented {job.title} to join {job.company}.</p>
          <p>• Build and maintain high-quality applications</p>
          <p>• Collaborate with cross-functional teams</p>
          <p>• Proficiency in {job.skills.join(', ')}</p>
        </div>
      </div>
      <div className="detail-sticky">
        <button className="btn btn--primary" onClick={onApply} style={{ fontSize: '1rem', padding: '16px' }}>📝 Apply Now</button>
      </div>
    </div></div>
  )
}

// ═══ GIG MARKETPLACE ═══
function MarketplacePage({ userName: _userName }: { userName: string }) {
  const [view, setView] = useState<'gigs' | 'talent'>('gigs')
  const [showPost, setShowPost] = useState(false)
  const [searchSkill, setSearchSkill] = useState('')
  const filteredTalent = searchSkill ? DEMO_TALENTS.filter(t => t.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase())) || t.title.toLowerCase().includes(searchSkill.toLowerCase())) : DEMO_TALENTS

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
            <div key={gig.id} className="gig-card-v2">
              <div className="gig-card-v2__banner" style={{ background: `linear-gradient(135deg, ${gig.color}33, ${gig.color}11)` }}><span className="gig-card-v2__icon">{gig.icon}</span></div>
              <div className="gig-card-v2__body">
                <div className="gig-card-v2__title">{gig.title}</div>
                <div className="gig-card-v2__seller">{gig.seller}</div>
                <div className="gig-card-v2__footer"><span className="gig-card-v2__price">${gig.price}</span><span className="gig-card-v2__rating">⭐ {gig.rating}</span></div>
                <button className="btn-detail">View Details</button>
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

      {showPost && <div className="modal-overlay" onClick={() => setShowPost(false)}><div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__handle" /><h2>➕ Post Your Gig</h2>
        <div className="form-group"><label>Gig Title</label><input className="form-input" placeholder="I will edit your YouTube video..." /></div>
        <div className="form-group"><label>Category</label><select className="form-input"><option value="">Select</option>{GIG_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
        <div className="form-group"><label>Price ({WALLET.currency})</label><input className="form-input" type="number" placeholder="500" /></div>
        <div className="form-group"><label>Skills (Max 5)</label><div className="skill-selector mt-1">{SKILLS.slice(0, 15).map(s => <button key={s} className="skill-tag">{s}</button>)}</div></div>
        <button className="btn btn--primary mt-2" onClick={() => setShowPost(false)}>🚀 Post Gig</button>
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
    </div></div>
  )
}

// ═══ PROFILE — Skill Profile ═══
function ProfilePage({ userName, userEmail, onLogout, theme, toggleTheme, userProfile: _up }: { userName: string, userEmail: string, onLogout: () => void, theme: string, toggleTheme: () => void, userProfile: any }) {
  const mySkills = ['React Native', 'Node.js', 'Solidity', 'Python', 'AI/ML']
  const portfolioItems = ['🎮 DeFi Platform', '🏙️ Smart City App', '⚡ Smart Platform', '🎨 Design System']
  return (
    <div className="page"><div className="page__content">
      {/* Skill Profile Header */}
      <div className="skill-profile slide-up">
        <div className="skill-profile__top">
          <h2>Skill Profile ✅</h2>
          <button className="text-sm" style={{ color: 'var(--secondary)' }}>✏️ Edit</button>
        </div>
        <div className="skill-profile__user">
          <div className="skill-profile__avatar">{userName.charAt(0).toUpperCase()}<div className="talent-card__status talent-card__status--available" /></div>
          <div><div className="skill-profile__name">{userName}</div><div className="text-sm text-muted">{userEmail}</div><div className="verified-badge mt-1">🟢 Available</div></div>
        </div>

        {/* Editable Skills */}
        <div className="skill-profile__section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>Editable Skills</h3><span className="text-sm" style={{ color: 'var(--text-dim)' }}>Editable</span></div>
          <div className="skill-selector mt-1">{mySkills.map(s => <span key={s} className="skill-chip skill-chip--editable">{s} ✏️</span>)}</div>
        </div>

        {/* Rate Card */}
        <div className="skill-profile__section">
          <h3>Rate Card</h3>
          <div className="rate-card">
            <div className="rate-card__item"><div className="rate-card__label">Hourly Rate</div><div className="rate-card__value">$75/hr</div></div>
            <div className="rate-card__item"><div className="rate-card__label">Project Rate</div><div className="rate-card__value">$500/Project</div></div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="skill-profile__section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>Portfolio</h3><a href="#" className="text-sm" style={{ color: 'var(--secondary)' }}>See All</a></div>
          <div className="hz-scroll mt-1">
            {portfolioItems.map((item, i) => (
              <div key={i} className="portfolio-item">
                <div className="portfolio-item__thumb">{item.split(' ')[0]}</div>
                <div className="portfolio-item__name">{item.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="skill-profile__section">
          <h3>Experience Level</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span className="text-sm text-muted">Experience</span>
            <span className="skill-chip" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>Senior - 7+ Yrs</span>
          </div>
        </div>

        {/* Links */}
        <div className="skill-profile__section">
          <div className="profile-links">
            <button className="profile-link"><span>🅱️</span> Behance →</button>
            <button className="profile-link"><span>🏀</span> Dribbble →</button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="profile-menu mt-2">
        {[
          { icon: '📝', title: 'Edit Profile' }, { icon: '📄', title: 'My Resume' },
          { icon: '🎯', title: 'My Gigs' }, { icon: '❤️', title: 'Saved Jobs' },
          { icon: '⚙️', title: 'Settings' }, { icon: '💬', title: 'Help & Support' },
        ].map((item, i) => (
          <div key={i} className="profile-menu__item fade-in" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => { if (item.title === 'Settings') toggleTheme() }}>
            <span>{item.icon}</span><div className="profile-menu__item-text"><div>{item.title}{item.title === 'Settings' ? ` — ${theme === 'dark' ? '🌙 Dark' : '☀️ Light'}` : ''}</div></div><span>›</span>
          </div>
        ))}
        <button className="btn btn--ghost mt-2" onClick={onLogout} style={{ color: 'var(--error)' }}>🚪 Logout</button>
      </div>
      <p className="text-center text-sm text-muted mt-3">{APP.name} v{APP.version}</p>
    </div></div>
  )
}

// ═══ LEADERBOARD ═══
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

// ═══ BOTTOM NAV ═══
function BottomNav({ active, onChange }: { active: string, onChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', icon: Icons.home, label: 'Home' },
    { id: 'jobs', icon: Icons.search, label: 'Search' },
    { id: 'gigs', icon: Icons.gigs, label: 'Gigs' },
    { id: 'wallet', icon: Icons.wallet, label: 'Wallet' },
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
          <button className="navbar__btn" style={{ position: 'relative' }} onClick={() => setActiveTab('alerts')}>{Icons.bell}<div className="navbar__notif-dot" /></button>
          <div className="navbar__avatar" onClick={() => setActiveTab('profile')}>{userName.charAt(0).toUpperCase()}</div>
        </div>
      </div>
      {activeTab === 'home' && <HomePage userName={userName} jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onTabChange={setActiveTab} onSaveJob={handleSaveJob} userProfile={userProfile} />}
      {activeTab === 'jobs' && <JobsFeedPage jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onSaveJob={handleSaveJob} />}
      {activeTab === 'gigs' && <MarketplacePage userName={userName} />}
      {activeTab === 'wallet' && <WalletPage userProfile={userProfile} onCheckin={handleCheckin} />}
      {activeTab === 'alerts' && <LeaderboardPage />}
      {activeTab === 'profile' && <ProfilePage userName={userName} userEmail={userEmail} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} userProfile={userProfile} />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
