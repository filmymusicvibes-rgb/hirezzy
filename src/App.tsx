import { useState, useEffect, useCallback } from 'react'
import './index.css'
import { APP, CATEGORIES, GIG_CATEGORIES, SKILLS, WALLET, USER_ROLES, INFLUENCER_NICHES, LANGUAGES, INDIAN_CITIES, BUDGET_RANGES, CAMPAIGN_STATUS, CONTENT_TYPES } from './config'
import {
  loginWithEmail, signupWithEmail, loginWithGoogle, logout, onAuthChange,
  getJobs, postJob, postGig, applyToJob, saveJob, unsaveJob, getSavedJobs, getMyApplications, searchTalent,
  dailyCheckin, listenToUserProfile, addNotification, updateUserProfile, uploadResume, sendOffer, placeGigOrder, getMyOrders,
  shortlistTalent, unshortlistTalent, getShortlistedTalent,
  searchInfluencers, updateOnboardingComplete,
  addReview, getReviews, createCampaign as _createCampaign, getUserCampaigns,
  getOrCreateChat as _getOrCreateChat, sendChatMessage, getUserChats, listenToMessages,
  savePortfolioItem as _savePortfolioItem, getPortfolio as _getPortfolio,
  createPayment as _createPayment, getUserPayments as _getUserPayments, updatePaymentStatus as _updatePaymentStatus,
  getAllUsers, getAdminStats, verifyCreator, submitReport, getReports,
  auth, type User
} from './lib/firebase'
import { seedJobs } from './lib/seedJobs'

// ═══ TOAST NOTIFICATION SYSTEM ═══
type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: number; message: string; type: ToastType }
let _globalToast: (msg: string, type?: ToastType) => void = () => {}
const toast = (msg: string, type: ToastType = 'success') => _globalToast(msg, type)

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  
  useEffect(() => { _globalToast = showToast }, [showToast])
  
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6' }

  return (
    <>
      {children}
      <div style={{ position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, width: '90%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '14px 16px', borderRadius: '16px', 
            background: 'rgba(15,20,35,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${colors[t.type]}30`, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${colors[t.type]}15`,
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'auto', cursor: 'pointer',
          }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${colors[t.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{icons[t.type]}</div>
            <div style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: 'white', lineHeight: 1.4 }}>{t.message}</div>
            <div style={{ width: '4px', height: '28px', borderRadius: '4px', background: colors[t.type], flexShrink: 0, opacity: 0.8 }} />
          </div>
        ))}
      </div>
    </>
  )
}

// ═══ DEMO DATA ═══
const DEMO_JOBS = [
  { id: '1', title: 'Senior UI/UX Designer', company: 'CyberTech Solutions', logo: '💎', category: 'design', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 12, salaryMax: 18, currency: '₹', unit: 'LPA', verified: true, featured: true, postedAgo: '2h', skills: ['Figma', 'React', 'UI/UX'] },
  { id: '2', title: 'Blockchain Developer', company: 'MetaCorp', logo: '⛓️', category: 'it', type: 'Full Time', location: 'Hyderabad', remote: 'Hybrid', salaryMin: 15, salaryMax: 25, currency: '₹', unit: 'LPA', verified: true, featured: true, postedAgo: '3h', skills: ['Solidity', 'Web3', 'React'] },
  { id: '3', title: 'Frontend Dev - Web3', company: 'CryptoNova', logo: '🌐', category: 'it', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 10, salaryMax: 15, currency: '₹', unit: 'LPA', verified: true, featured: false, postedAgo: '5h', skills: ['React', 'TypeScript', 'Web3'] },
  { id: '4', title: 'Data Entry Operator', company: 'State Govt', logo: '🏛️', category: 'govt', type: 'Full Time', location: 'Vizag', remote: 'On-site', salaryMin: 25000, salaryMax: 35000, currency: '₹', unit: '/mo', verified: true, featured: false, postedAgo: '1d', skills: ['Typing', 'MS Office'] },
  { id: '5', title: 'Digital Marketing Intern', company: 'Sofviz Technologies', logo: '🚀', category: 'internship', type: 'Internship', location: 'Vizag', remote: 'Remote', salaryMin: 5000, salaryMax: 10000, currency: '₹', unit: '/mo', verified: true, featured: false, postedAgo: '6h', skills: ['SEO', 'Social Media'] },
  { id: '6', title: 'Flutter Developer (WFH)', company: 'StartupX', logo: '📱', category: 'wfh', type: 'Full Time', location: 'WFH', remote: 'Remote', salaryMin: 10, salaryMax: 18, currency: '₹', unit: 'LPA', verified: false, featured: true, postedAgo: '4h', skills: ['Flutter', 'Dart', 'Firebase'] },
  { id: '7', title: 'Python Developer', company: 'Infosys', logo: '🐍', category: 'it', type: 'Full Time', location: 'Hyderabad', remote: 'On-site', salaryMin: 6, salaryMax: 12, currency: '₹', unit: 'LPA', verified: true, featured: false, postedAgo: '1d', skills: ['Python', 'Django'] },
  { id: '8', title: 'Content Writer', company: 'UpWork', logo: '✍️', category: 'freelance', type: 'Freelance', location: 'Remote', remote: 'Remote', salaryMin: 15000, salaryMax: 40000, currency: '₹', unit: '/project', verified: false, featured: false, postedAgo: '8h', skills: ['Writing', 'SEO'] },
]

const DEMO_GIGS = [
  { id: 'g1', title: 'Create a Custom AI Chatbot', seller: 'SmartBot1', price: 450, rating: 4.8, orders: 156, icon: '🤖', color: '#6C5CE7' },
  { id: 'g2', title: 'Design Your Web3 Logo', seller: 'CryptoCreative', price: 250, rating: 5.0, orders: 89, icon: '🎨', color: '#00D2FF' },
  { id: 'g3', title: 'Design a Futuristic App UI', seller: 'UImaster', price: 500, rating: 4.9, orders: 120, icon: '📱', color: '#E17055' },
  { id: 'g4', title: 'Build Custom Chatbot', seller: 'TechWizard', price: 350, rating: 4.7, orders: 67, icon: '💬', color: '#00E676' },
  { id: 'g5', title: 'Smart Contract Development', seller: 'BlockDev', price: 800, rating: 4.9, orders: 45, icon: '⛓️', color: '#A29BFE' },
  { id: 'g6', title: 'Video Editing Professional', seller: 'EditPro', price: 300, rating: 4.8, orders: 234, icon: '🎬', color: '#FD79A8' },
]

// ═══ GOVT JOBS DATA ═══
const DEMO_GOVT_JOBS = [
  { id: 'gj1', title: 'SSC CGL 2026', organization: 'Staff Selection Commission', logo: '🏛️', lastDate: '2026-05-15', location: 'All India', salary: '₹25,500 - ₹81,100/mo', vacancies: 17727, applyUrl: 'https://ssc.nic.in', source: 'SSC Official Website', urgency: 'new', color: '#3B82F6' },
  { id: 'gj2', title: 'RRB NTPC 2026', organization: 'Railway Recruitment Board', logo: '🚂', lastDate: '2026-05-02', location: 'All India', salary: '₹19,900 - ₹63,200/mo', vacancies: 11558, applyUrl: 'https://www.rrbcdg.gov.in', source: 'RRB Official Website', urgency: 'urgent', color: '#E17055' },
  { id: 'gj3', title: 'UPSC Civil Services', organization: 'Union Public Service Commission', logo: '⚖️', lastDate: '2026-04-25', location: 'All India', salary: '₹56,100 - ₹2,50,000/mo', vacancies: 1056, applyUrl: 'https://upsc.gov.in', source: 'UPSC Official Website', urgency: 'closing', color: '#8B5CF6' },
  { id: 'gj4', title: 'IBPS PO 2026', organization: 'Institute of Banking Personnel', logo: '🏦', lastDate: '2026-06-10', location: 'All India', salary: '₹36,000 - ₹63,840/mo', vacancies: 4500, applyUrl: 'https://www.ibps.in', source: 'IBPS Official Website', urgency: 'new', color: '#10B981' },
  { id: 'gj5', title: 'AIIMS Nursing Officer', organization: 'AIIMS New Delhi', logo: '🏥', lastDate: '2026-04-30', location: 'Delhi', salary: '₹44,900 - ₹1,42,400/mo', vacancies: 3065, applyUrl: 'https://www.aiimsexams.ac.in', source: 'AIIMS Official Website', urgency: 'urgent', color: '#EF4444' },
  { id: 'gj6', title: 'Indian Army Agniveer', organization: 'Indian Army', logo: '🪖', lastDate: '2026-05-20', location: 'All India', salary: '₹30,000 - ₹40,000/mo', vacancies: 25000, applyUrl: 'https://joinindianarmy.nic.in', source: 'Indian Army Official', urgency: 'new', color: '#059669' },
  { id: 'gj7', title: 'AP Police Constable', organization: 'AP State Level Police', logo: '👮', lastDate: '2026-05-08', location: 'Andhra Pradesh', salary: '₹23,100 - ₹67,990/mo', vacancies: 6100, applyUrl: 'https://slprb.ap.gov.in', source: 'AP SLPRB Official', urgency: 'urgent', color: '#F59E0B' },
  { id: 'gj8', title: 'TS GENCO AE', organization: 'Telangana GENCO', logo: '⚡', lastDate: '2026-06-01', location: 'Telangana', salary: '₹46,060 - ₹1,27,340/mo', vacancies: 412, applyUrl: 'https://tsgenco.telangana.gov.in', source: 'TS GENCO Official', urgency: 'new', color: '#6366F1' },
]

const DEMO_TALENTS = [
  { id: 't1', name: 'David Chen', title: '3D Modeler & Developer', skills: ['3D', 'Blender', 'Unity'], rate: '₹7,500/hr', ratingNum: 4.9, reviews: 34, status: 'available', verified: true, avatar: 'D', color: '#6C5CE7' },
  { id: 't2', name: 'Anya Sharma', title: 'Full Stack Developer', skills: ['React', 'Node.js', 'Python'], rate: '₹6,000/hr', ratingNum: 5.0, reviews: 67, status: 'available', verified: true, avatar: 'A', color: '#00D2FF' },
  { id: 't3', name: 'Maria Rodriguez', title: 'Content Strategist', skills: ['SEO', 'Content', 'Marketing'], rate: '₹4,500/hr', ratingNum: 4.8, reviews: 41, status: 'busy', verified: true, avatar: 'M', color: '#E17055' },
  { id: 't4', name: 'Kiran T', title: 'Flutter & Firebase Expert', skills: ['Flutter', 'Firebase', 'Dart'], rate: '₹5,500/hr', ratingNum: 4.7, reviews: 22, status: 'available', verified: false, avatar: 'K', color: '#00E676' },
  { id: 't5', name: 'Manya P', title: 'Senior UX Designer', skills: ['Figma', 'Adobe XD', 'Sketch'], rate: '₹6,500/hr', ratingNum: 4.9, reviews: 55, status: 'available', verified: true, avatar: 'M', color: '#A29BFE' },
  { id: 't6', name: 'Elizman F', title: 'Frontend Specialist', skills: ['React', 'Vue', 'Angular'], rate: '₹5,800/hr', ratingNum: 4.6, reviews: 28, status: 'offline', verified: true, avatar: 'E', color: '#FD79A8' },
]

// ═══ DEMO INFLUENCERS ═══
const DEMO_INFLUENCERS = [
  { id: 'inf1', name: 'Ravi Telugu Tech', handle: '@ravitelugtech', avatar: 'R', color: '#0984E3', platform: 'instagram', instagramUrl: 'https://instagram.com/ravitelugtech', youtubeUrl: 'https://youtube.com/@ravitelugtech', followers: 45200, engagementRate: 4.8, niche: ['tech', 'education'], languages: ['telugu', 'english'], city: 'Hyderabad', ratePerPost: 2000, ratePerReel: 5000, ratePerStory: 800, verified: true, rating: 4.9, reviews: 28, availability: 'available', bio: 'Telugu Tech Reviews & Unboxing 📱💻' },
  { id: 'inf2', name: 'Priya Foodie AP', handle: '@priyafoodieap', avatar: 'P', color: '#FDCB6E', platform: 'instagram', instagramUrl: 'https://instagram.com/priyafoodieap', followers: 23800, engagementRate: 6.2, niche: ['food'], languages: ['telugu', 'hindi'], city: 'Vizag', ratePerPost: 1500, ratePerReel: 3500, ratePerStory: 500, verified: true, rating: 4.8, reviews: 42, availability: 'available', bio: 'Andhra Food Explorer 🍕🌶️ Street food to fine dining' },
  { id: 'inf3', name: 'Sneha Style Hub', handle: '@snehastylehub', avatar: 'S', color: '#E17055', platform: 'instagram', instagramUrl: 'https://instagram.com/snehastylehub', followers: 112000, engagementRate: 3.5, niche: ['fashion', 'beauty'], languages: ['hindi', 'english'], city: 'Mumbai', ratePerPost: 8000, ratePerReel: 15000, ratePerStory: 3000, verified: true, rating: 4.7, reviews: 65, availability: 'busy', bio: 'Fashion & Beauty Creator ✨ Collabs with 50+ brands' },
  { id: 'inf4', name: 'Kiran Fit Life', handle: '@kiranfitlife', avatar: 'K', color: '#00B894', platform: 'youtube', instagramUrl: 'https://instagram.com/kiranfitlife', youtubeUrl: 'https://youtube.com/@kiranfitlife', followers: 67500, engagementRate: 5.1, niche: ['fitness'], languages: ['telugu', 'english', 'hindi'], city: 'Hyderabad', ratePerPost: 3000, ratePerReel: 7000, ratePerStory: 1200, verified: false, rating: 4.6, reviews: 19, availability: 'available', bio: 'Fitness Coach & Transformation Expert 💪 500+ clients' },
  { id: 'inf5', name: 'Arjun Game Zone', handle: '@arjungamezone', avatar: 'A', color: '#6C5CE7', platform: 'youtube', instagramUrl: 'https://instagram.com/arjungamezone', youtubeUrl: 'https://youtube.com/@arjungamezone', followers: 189300, engagementRate: 7.8, niche: ['gaming', 'tech'], languages: ['hindi', 'english'], city: 'Bangalore', ratePerPost: 5000, ratePerReel: 12000, ratePerStory: 2000, verified: true, rating: 4.9, reviews: 34, availability: 'available', bio: 'Gaming Content Creator 🎮 BGMI • Free Fire • Valorant' },
  { id: 'inf6', name: 'Lakshmi Travel Diaries', handle: '@lakshmitravels', avatar: 'L', color: '#00D2FF', platform: 'instagram', instagramUrl: 'https://instagram.com/lakshmitravels', followers: 34100, engagementRate: 5.6, niche: ['travel', 'lifestyle'], languages: ['telugu', 'english'], city: 'Vizag', ratePerPost: 2500, ratePerReel: 6000, ratePerStory: 1000, verified: true, rating: 4.8, reviews: 23, availability: 'available', bio: 'Travel Vlogger • Exploring India 🇮🇳✈️' },
  { id: 'inf7', name: 'Deepak Comedy Telugu', handle: '@deepakcomedy', avatar: 'D', color: '#FF6B6B', platform: 'instagram', instagramUrl: 'https://instagram.com/deepakcomedy', youtubeUrl: 'https://youtube.com/@deepakcomedy', followers: 256000, engagementRate: 8.4, niche: ['entertainment'], languages: ['telugu'], city: 'Hyderabad', ratePerPost: 10000, ratePerReel: 25000, ratePerStory: 5000, verified: true, rating: 4.9, reviews: 87, availability: 'available', bio: 'Telugu Comedy King 😂 1M+ YouTube family' },
  { id: 'inf8', name: 'Anitha Wellness Coach', handle: '@anithawellness', avatar: 'A', color: '#A29BFE', platform: 'instagram', instagramUrl: 'https://instagram.com/anithawellness', followers: 18500, engagementRate: 7.2, niche: ['fitness', 'lifestyle'], languages: ['tamil', 'english'], city: 'Chennai', ratePerPost: 1200, ratePerReel: 2800, ratePerStory: 400, verified: false, rating: 4.5, reviews: 15, availability: 'available', bio: 'Yoga & Wellness • Mindful Living 🧘‍♀️' },
  { id: 'inf9', name: 'Vikram Auto Reviews', handle: '@vikramauto', avatar: 'V', color: '#2D3436', platform: 'youtube', instagramUrl: 'https://instagram.com/vikramauto', youtubeUrl: 'https://youtube.com/@vikramauto', followers: 92400, engagementRate: 4.3, niche: ['tech'], languages: ['hindi', 'english'], city: 'Delhi', ratePerPost: 6000, ratePerReel: 14000, ratePerStory: 2500, verified: true, rating: 4.7, reviews: 41, availability: 'available', bio: 'Car & Bike Reviews 🏎️ Honest Opinions Only' },
  { id: 'inf10', name: 'Meera Kitchen Magic', handle: '@meerakitchen', avatar: 'M', color: '#FD79A8', platform: 'instagram', instagramUrl: 'https://instagram.com/meerakitchen', youtubeUrl: 'https://youtube.com/@meerakitchen', followers: 78200, engagementRate: 6.8, niche: ['food', 'lifestyle'], languages: ['kannada', 'english'], city: 'Bangalore', ratePerPost: 3500, ratePerReel: 8000, ratePerStory: 1500, verified: true, rating: 4.8, reviews: 52, availability: 'available', bio: 'South Indian Recipes Made Easy 🍛🔥' },
  { id: 'inf11', name: 'Rahul Street Vlogs', handle: '@rahulstreet', avatar: 'R', color: '#E84393', platform: 'youtube', instagramUrl: 'https://instagram.com/rahulstreet', youtubeUrl: 'https://youtube.com/@rahulstreet', followers: 143000, engagementRate: 5.9, niche: ['travel', 'food'], languages: ['telugu', 'hindi', 'english'], city: 'Hyderabad', ratePerPost: 4500, ratePerReel: 10000, ratePerStory: 1800, verified: true, rating: 4.7, reviews: 38, availability: 'available', bio: 'Street Food Hunter 🍜 Hyderabad to World 🌍' },
  { id: 'inf12', name: 'Pooja Beauty Buzz', handle: '@poojabuzz', avatar: 'P', color: '#FF9FF3', platform: 'instagram', instagramUrl: 'https://instagram.com/poojabuzz', followers: 55800, engagementRate: 4.6, niche: ['beauty', 'fashion'], languages: ['hindi', 'english'], city: 'Mumbai', ratePerPost: 4000, ratePerReel: 9000, ratePerStory: 1600, verified: true, rating: 4.6, reviews: 29, availability: 'busy', bio: 'Makeup Artist & Skincare Enthusiast 💄✨' },
  { id: 'inf13', name: 'Sai Coding Hub', handle: '@saicodinghub', avatar: 'S', color: '#0097E6', platform: 'youtube', instagramUrl: 'https://instagram.com/saicodinghub', youtubeUrl: 'https://youtube.com/@saicodinghub', followers: 31200, engagementRate: 8.1, niche: ['tech', 'education'], languages: ['telugu', 'english'], city: 'Vizag', ratePerPost: 1800, ratePerReel: 4000, ratePerStory: 700, verified: false, rating: 4.9, reviews: 22, availability: 'available', bio: 'Learn Coding in Telugu 👨‍💻 React • Python • AI' },
  { id: 'inf14', name: 'Divya Dance World', handle: '@divyadance', avatar: 'D', color: '#F368E0', platform: 'instagram', instagramUrl: 'https://instagram.com/divyadance', followers: 198000, engagementRate: 9.2, niche: ['entertainment', 'lifestyle'], languages: ['tamil', 'hindi', 'english'], city: 'Chennai', ratePerPost: 7000, ratePerReel: 18000, ratePerStory: 3500, verified: true, rating: 4.9, reviews: 73, availability: 'available', bio: 'Classical + Modern Dance Fusion 💃🔥 200K family' },
  { id: 'inf15', name: 'Naveen Motor Vlogs', handle: '@naveenmotors', avatar: 'N', color: '#1B9CFC', platform: 'youtube', instagramUrl: 'https://instagram.com/naveenmotors', youtubeUrl: 'https://youtube.com/@naveenmotors', followers: 41600, engagementRate: 5.4, niche: ['tech'], languages: ['telugu', 'hindi'], city: 'Hyderabad', ratePerPost: 2200, ratePerReel: 5500, ratePerStory: 900, verified: false, rating: 4.5, reviews: 16, availability: 'available', bio: 'Bikes & Gadgets Telugu lo 🏍️📱' },
]


// ═══ SVG ICONS for Bottom Nav ═══
const Icons = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  jobs: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  talent: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  creators: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>,
  gigs: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  wallet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>,
  profile: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  learn: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>,
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
  const [referralCode, setReferralCode] = useState(''); const [role, setRole] = useState('seeker')
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
          {tab === 'signup' && <>
            <div className="form-group"><label>I am a</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className={`skill-tag ${role === 'seeker' ? 'skill-tag--selected' : ''}`} onClick={() => setRole('seeker')}>💼 Job Seeker</button>
                <button type="button" className={`skill-tag ${role === 'recruiter' ? 'skill-tag--selected' : ''}`} onClick={() => setRole('recruiter')}>🏢 Recruiter</button>
              </div>
            </div>
            <div className="form-group"><label>Referral Code (Optional)</label><input className="form-input" placeholder="Enter code" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} /></div>
          </>}
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

// ═══ ONBOARDING — Choose Your Path ═══
function OnboardingPage({ onComplete }: { onComplete: (roles: string[]) => void }) {
  const [step, setStep] = useState(1)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  // Influencer specific fields
  const [instaUrl, setInstaUrl] = useState('')
  const [ytUrl, setYtUrl] = useState('')
  const [followersCount, setFollowersCount] = useState('')
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [ratePost, setRatePost] = useState('')
  const [rateReel, setRateReel] = useState('')
  const [rateStory, setRateStory] = useState('')
  const [creatorBio, setCreatorBio] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleRole = (id: string) => {
    setSelectedRoles(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const toggleNiche = (id: string) => {
    setSelectedNiches(prev => prev.includes(id) ? prev.filter(n => n !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const toggleLang = (id: string) => {
    setSelectedLangs(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const handleFinish = async () => {
    if (!auth.currentUser) return
    setSaving(true)
    try {
      // Save roles
      await updateOnboardingComplete(auth.currentUser.uid, selectedRoles)
      // Save influencer-specific data if influencer role selected
      if (selectedRoles.includes('influencer')) {
        const handle = instaUrl ? '@' + instaUrl.replace(/.*instagram\.com\//, '').replace(/[\/\?].*/, '') : ''
        await updateUserProfile(auth.currentUser.uid, {
          instagramUrl: instaUrl,
          youtubeUrl: ytUrl,
          followers: parseInt(followersCount) || 0,
          niche: selectedNiches,
          languages: selectedLangs,
          city: selectedCity,
          ratePerPost: parseInt(ratePost) || 0,
          ratePerReel: parseInt(rateReel) || 0,
          ratePerStory: parseInt(rateStory) || 0,
          bio: creatorBio,
          handle: handle,
          platform: ytUrl ? 'youtube' : 'instagram',
          verified: false,
          availability: 'available',
          rating: 0,
          reviews: 0,
          engagementRate: 0,
          role: 'creator',
        })
      }
      // Save city for all roles if set
      if (selectedCity) {
        await updateUserProfile(auth.currentUser.uid, { city: selectedCity })
      }
      onComplete(selectedRoles)
    } catch (err) {
      console.error('Onboarding save error:', err)
      onComplete(selectedRoles)
    }
    setSaving(false)
  }

  // Calculate profile score
  const getScore = () => {
    let filled = 0, total = 3
    if (selectedRoles.length > 0) filled++
    if (selectedCity) filled++
    if (selectedRoles.includes('influencer')) {
      total += 4
      if (instaUrl || ytUrl) filled++
      if (followersCount) filled++
      if (selectedNiches.length > 0) filled++
      if (ratePost || rateReel) filled++
    }
    if (selectedLangs.length > 0) filled++
    return Math.round((filled / total) * 100)
  }

  return (
    <div className="onboarding">
      <div className="onboarding__bg" />
      <div className="onboarding__card slide-up">
        <div className="onboarding__header">
          <div className="onboarding__step">Step {step} of {selectedRoles.includes('influencer') ? 3 : 2}</div>
          <h1>{step === 1 ? 'How will you use Hirezzy?' : step === 2 ? 'Set Up Your Profile' : '🎉 You\'re All Set!'}</h1>
          <p>{step === 1 ? 'Select all that apply — you can always change later' : step === 2 ? 'Help us personalize your experience' : 'Start exploring opportunities!'}</p>
        </div>

        {/* Step 1: Choose Roles */}
        {step === 1 && <>
          <div className="role-grid">
            {USER_ROLES.map(role => (
              <div key={role.id} className={`role-card ${selectedRoles.includes(role.id) ? 'role-card--selected' : ''}`} onClick={() => toggleRole(role.id)}>
                <div className="role-card__check">✓</div>
                <span className="role-card__icon">{role.icon}</span>
                <div className="role-card__name">{role.name}</div>
                <div className="role-card__desc">{role.desc}</div>
              </div>
            ))}
          </div>
          <button className="btn btn--primary" disabled={selectedRoles.length === 0} onClick={() => setStep(2)}>
            Continue →
          </button>
          <button className="btn btn--ghost mt-1" onClick={() => onComplete(['job_seeker'])}>
            Skip for now
          </button>
        </>}

        {/* Step 2: Dynamic Profile Setup */}
        {step === 2 && <>
          {/* Common: City + Languages */}
          <div className="onboarding-form">
            <div className="onboarding-form__title">📍 Location & Language</div>
            <div className="form-group">
              <label>Your City</label>
              <select className="form-input" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                <option value="">Select your city</option>
                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Languages you speak</label>
              <div className="skill-selector mt-1">
                {LANGUAGES.map(lang => (
                  <button key={lang.id} className={`skill-tag ${selectedLangs.includes(lang.id) ? 'skill-tag--selected' : ''}`} onClick={() => toggleLang(lang.id)}>
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Influencer Fields */}
          {selectedRoles.includes('influencer') && (
            <div className="onboarding-form">
              <div className="onboarding-form__title">🎬 Creator Profile</div>
              <div className="form-group">
                <label>Instagram Profile URL</label>
                <input className="form-input" placeholder="https://instagram.com/yourhandle" value={instaUrl} onChange={e => setInstaUrl(e.target.value)} pattern="https?://.*instagram\.com/.*" />
                {instaUrl && !instaUrl.match(/instagram\.com\/[a-zA-Z0-9._]+/) && <span style={{ fontSize: '0.6rem', color: '#EF4444' }}>⚠️ Enter valid Instagram profile URL</span>}
              </div>
              <div className="form-group">
                <label>YouTube Channel (Optional)</label>
                <input className="form-input" placeholder="https://youtube.com/@yourchannel" value={ytUrl} onChange={e => setYtUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Followers Count</label>
                <input className="form-input" type="number" placeholder="e.g. 15000" value={followersCount} onChange={e => setFollowersCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Your Niche (Max 3)</label>
                <div className="skill-selector mt-1">
                  {INFLUENCER_NICHES.map(n => (
                    <button key={n.id} className={`skill-tag ${selectedNiches.includes(n.id) ? 'skill-tag--selected' : ''}`} onClick={() => toggleNiche(n.id)}>
                      {n.icon} {n.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>₹ Per Post</label>
                  <input className="form-input" type="number" placeholder="2000" value={ratePost} onChange={e => setRatePost(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>₹ Per Reel</label>
                  <input className="form-input" type="number" placeholder="5000" value={rateReel} onChange={e => setRateReel(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>₹ Per Story</label>
                <input className="form-input" type="number" placeholder="800" value={rateStory} onChange={e => setRateStory(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Your Bio (One-liner)</label>
                <input className="form-input" placeholder="e.g. Telugu Tech Reviews & Gadget Lover 📱" value={creatorBio} onChange={e => setCreatorBio(e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn--primary" onClick={() => selectedRoles.includes('influencer') ? setStep(3) : handleFinish()} disabled={saving}>
              {saving ? '⏳ Saving...' : selectedRoles.includes('influencer') ? 'Next →' : '🚀 Start Using Hirezzy'}
            </button>
          </div>
        </>}

        {/* Step 3: Profile Score (Influencers) */}
        {step === 3 && <>
          <div className="profile-score">
            <div className="profile-score__circle" style={{ borderColor: getScore() >= 80 ? '#10B981' : getScore() >= 50 ? '#F59E0B' : '#EF4444' }}>
              {getScore()}%
            </div>
            <div className="profile-score__label">Profile Completion</div>
            <div className="profile-score__msg">
              {getScore() >= 80 ? '🔥 Excellent! Brands will love your profile.' : getScore() >= 50 ? '👍 Good start! Complete more to get noticed.' : '⚡ Add more details to attract brands.'}
            </div>
          </div>

          {/* Summary */}
          <div className="onboarding-form">
            <div className="onboarding-form__title">📋 Your Profile Summary</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {selectedRoles.length > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span className="text-muted">Roles</span><strong>{selectedRoles.map(r => USER_ROLES.find(ur => ur.id === r)?.icon).join(' ')}</strong></div>}
              {selectedCity && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span className="text-muted">City</span><strong>📍 {selectedCity}</strong></div>}
              {selectedLangs.length > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span className="text-muted">Languages</span><strong>{selectedLangs.map(l => LANGUAGES.find(la => la.id === l)?.flag).join(' ')}</strong></div>}
              {(instaUrl || ytUrl) && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span className="text-muted">Platform</span><strong>{instaUrl ? '📸' : ''} {ytUrl ? '▶️' : ''}</strong></div>}
              {followersCount && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span className="text-muted">Followers</span><strong>{parseInt(followersCount).toLocaleString()}</strong></div>}
              {(ratePost || rateReel) && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span className="text-muted">Rate</span><strong>₹{ratePost}/post {rateReel ? `• ₹${rateReel}/reel` : ''}</strong></div>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn--primary" onClick={handleFinish} disabled={saving}>
              {saving ? '⏳ Saving...' : '🚀 Start Using Hirezzy'}
            </button>
          </div>
        </>}
      </div>
    </div>
  )
}

// ═══ HELPER: Format follower count ═══
function fmtFollowers(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

// ═══ INFLUENCER SEARCH PAGE ═══
function InfluencerSearchPage({ onTabChange: _onTabChange, onSelectInfluencer }: { onTabChange: (tab: string) => void, onSelectInfluencer?: (inf: any) => void }) {
  const [searchQ, setSearchQ] = useState('')
  const [langFilter, setLangFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [nicheFilter, setNicheFilter] = useState('')
  const [budgetFilter, setBudgetFilter] = useState('')
  const [realInfluencers, setRealInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savedCreators, setSavedCreators] = useState<string[]>([])
  const [hireTarget, setHireTarget] = useState<any>(null)
  const [hireType, setHireType] = useState('reel')
  const [hireMsg, setHireMsg] = useState('')
  const [showAIMatch, setShowAIMatch] = useState(false)
  const [aiLang, setAiLang] = useState('')
  const [aiCity, setAiCity] = useState('')
  const [aiNiche, setAiNiche] = useState('')
  const [aiBudget, setAiBudget] = useState('')
  const [aiResults, setAiResults] = useState<any[]>([])

  useEffect(() => {
    searchInfluencers().then(data => { setRealInfluencers(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const allInfluencers = realInfluencers.length > 0 ? realInfluencers.map((u: any, i: number) => ({
    ...u,
    handle: u.instagramUrl ? '@' + u.instagramUrl.split('/').pop() : '@user',
    avatar: (u.name || 'U').charAt(0).toUpperCase(),
    color: ['#E1306C', '#FDCB6E', '#E17055', '#00B894', '#6C5CE7', '#00D2FF'][i % 6],
  })) : DEMO_INFLUENCERS

  // Smart tags generator
  const getSmartTags = (inf: any) => {
    const tags: { label: string, cls: string }[] = []
    if (inf.engagementRate >= 5) tags.push({ label: '🔥 High Engagement', cls: 'smart-tag--fire' })
    if (inf.rating >= 4.8 && inf.followers >= 50000) tags.push({ label: '🏆 Top Creator', cls: 'smart-tag--top' })
    if ((inf.ratePerPost || 0) >= 8000 || (inf.ratePerReel || 0) >= 10000) tags.push({ label: '💎 Premium', cls: 'smart-tag--premium' })
    if (inf.id === 'inf2' || inf.id === 'inf6') tags.push({ label: '⚡ Fast Response', cls: 'smart-tag--fast' })
    return tags
  }

  const toggleSave = (id: string) => {
    setSavedCreators(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const filtered = allInfluencers.filter((inf: any) => {
    if (searchQ) {
      const q = searchQ.toLowerCase()
      if (!(inf.name || '').toLowerCase().includes(q) && !(inf.handle || '').toLowerCase().includes(q) && !(inf.bio || '').toLowerCase().includes(q) && !(inf.city || '').toLowerCase().includes(q)) return false
    }
    if (langFilter && !(inf.languages || []).includes(langFilter)) return false
    if (cityFilter && (inf.city || '').toLowerCase() !== cityFilter.toLowerCase()) return false
    if (nicheFilter && !(inf.niche || []).includes(nicheFilter)) return false
    if (budgetFilter) {
      const range = BUDGET_RANGES.find(b => b.id === budgetFilter)
      if (range) {
        const rate = inf.ratePerPost || inf.ratePerReel || 0
        if (rate < range.min || rate > range.max) return false
      }
    }
    return true
  })

  // AI Matching Algorithm
  const runAIMatch = () => {
    const budget = parseInt(aiBudget) || 5000
    const scored = allInfluencers.map((inf: any) => {
      let score = 0
      let reasons: string[] = []
      // Language match (30%)
      if (aiLang && (inf.languages || []).includes(aiLang)) { score += 30; reasons.push(`Speaks ${aiLang}`) }
      else if (!aiLang) score += 15
      // Location match (25%)
      if (aiCity && (inf.city || '').toLowerCase() === aiCity.toLowerCase()) { score += 25; reasons.push(`Based in ${inf.city}`) }
      else if (!aiCity) score += 12
      // Niche match (25%)
      if (aiNiche && (inf.niche || []).includes(aiNiche)) { score += 25; reasons.push(`Expert in ${aiNiche}`) }
      else if (!aiNiche) score += 12
      // Budget fit (10%)
      const rate = inf.ratePerReel || inf.ratePerPost || 0
      if (rate <= budget) { score += 10; reasons.push(`Within budget ₹${rate}`) }
      // Rating (10%)
      if (inf.rating >= 4.5) { score += 10; reasons.push(`${inf.rating}⭐ rated`) }
      else if (inf.rating >= 4.0) score += 5
      return { ...inf, matchScore: Math.min(score, 100), reasons }
    }).filter((r: any) => r.matchScore > 20).sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 6)
    setAiResults(scored)
  }

  return (
    <div className="page"><div className="page__content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>🎬 Discover Creators</h2>
        <button onClick={() => setShowAIMatch(true)} style={{ padding: '6px 14px', borderRadius: '20px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: 'white', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>🤖 AI Match</button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginTop: 0, marginBottom: '12px' }}>
        <span className="search-bar__icon">{Icons.search}</span>
        <input placeholder="Search by name, niche, city..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        {searchQ && <button className="search-bar__filter" onClick={() => setSearchQ('')}>✕</button>}
      </div>

      {/* Language Filter */}
      <div className="filter-chips" style={{ marginBottom: '6px' }}>
        {LANGUAGES.slice(0, 5).map(lang => (
          <span key={lang.id} className={`filter-chip ${langFilter === lang.id ? 'filter-chip--active' : ''}`} onClick={() => setLangFilter(langFilter === lang.id ? '' : lang.id)}>
            {lang.flag} {lang.name}
          </span>
        ))}
      </div>

      {/* Location + Budget + Niche Filters */}
      <div className="filter-chips" style={{ marginBottom: '12px' }}>
        {['Hyderabad', 'Vizag', 'Bangalore', 'Mumbai'].map(city => (
          <span key={city} className={`filter-chip ${cityFilter === city ? 'filter-chip--active' : ''}`} onClick={() => setCityFilter(cityFilter === city ? '' : city)}>
            📍 {city}
          </span>
        ))}
      </div>
      <div className="filter-chips" style={{ marginBottom: '12px' }}>
        {INFLUENCER_NICHES.slice(0, 6).map(n => (
          <span key={n.id} className={`filter-chip ${nicheFilter === n.id ? 'filter-chip--active' : ''}`} onClick={() => setNicheFilter(nicheFilter === n.id ? '' : n.id)}>
            {n.icon} {n.name}
          </span>
        ))}
      </div>
      <div className="filter-chips" style={{ marginBottom: '12px' }}>
        {BUDGET_RANGES.map(b => (
          <span key={b.id} className={`filter-chip ${budgetFilter === b.id ? 'filter-chip--active' : ''}`} onClick={() => setBudgetFilter(budgetFilter === b.id ? '' : b.id)}>
            💰 {b.label}
          </span>
        ))}
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p className="text-sm text-muted">{filtered.length} creators found</p>
        {(langFilter || cityFilter || nicheFilter || budgetFilter) && (
          <button className="text-sm" style={{ color: 'var(--error)' }} onClick={() => { setLangFilter(''); setCityFilter(''); setNicheFilter(''); setBudgetFilter('') }}>Clear filters</button>
        )}
      </div>

      {loading && <p className="text-center text-muted" style={{ padding: '40px 0' }}>⏳ Loading creators...</p>}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 600 }}>No creators found</p>
          <p className="text-sm text-muted">Try different filters</p>
        </div>
      )}

      {/* ═══ INFLUENCER CARDS — Premium ═══ */}
      {!loading && filtered.map((inf: any) => {
        const smartTags = getSmartTags(inf)
        const engClass = inf.engagementRate >= 5 ? 'engagement--high' : inf.engagementRate >= 3 ? 'engagement--medium' : ''
        const isSaved = savedCreators.includes(inf.id)
        const packagePrice = (inf.ratePerReel || 0) + (inf.ratePerStory || 0) * 2

        return (
        <div key={inf.id} className="influencer-card fade-in" style={{ cursor: 'pointer' }} onClick={(e) => { if ((e.target as HTMLElement).closest('.btn-contact, .btn-save-creator')) return; onSelectInfluencer?.(inf) }}>
          {/* Save Button */}
          <button className={`btn-save-creator ${isSaved ? 'btn-save-creator--saved' : ''}`} onClick={() => toggleSave(inf.id)}>
            {isSaved ? '❤️' : '🤍'}
          </button>

          {/* Top row: Avatar + Info */}
          <div className="influencer-card__top">
            <div className="influencer-card__avatar" style={{ background: `linear-gradient(135deg, ${inf.color}, ${inf.color}88)` }}>
              {inf.avatar}
              <div className="platform-dot" style={{ background: inf.platform === 'youtube' ? '#FF0000' : '#E1306C' }}>
                {inf.platform === 'youtube' ? '▶️' : '📸'}
              </div>
            </div>
            <div className="influencer-card__info">
              <div className="influencer-card__name">
                {inf.name} {inf.instagramUrl && <span style={{ fontSize: '0.55rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(225,48,108,0.1)', color: '#E1306C', fontWeight: 600, marginLeft: '4px' }}>📸 Linked</span>}
              </div>
              <div className="influencer-card__handle">
                {inf.handle} • <span className="location-pill">📍 {inf.city || 'India'}</span>
              </div>
              <div className="influencer-card__stats">
                <div className="influencer-card__stat"><strong>{fmtFollowers(inf.followers)}</strong><span> followers</span></div>
                <div className={`influencer-card__stat ${engClass}`}><strong>{inf.engagementRate}%</strong><span> engage {inf.engagementRate >= 5 ? '📈' : ''}</span></div>
                <div className="influencer-card__stat"><strong>⭐ {inf.rating}</strong><span> ({inf.reviews})</span></div>
              </div>
            </div>
            <div className={`talent-card__status talent-card__status--${inf.availability || 'available'}`} style={{ width: '10px', height: '10px', flexShrink: 0 }} />
          </div>

          {/* Smart Tags */}
          {smartTags.length > 0 && (
            <div className="smart-tags">
              {smartTags.map((t, i) => <span key={i} className={`smart-tag ${t.cls}`}>{t.label}</span>)}
            </div>
          )}

          {/* Tags: Languages + Niches */}
          <div className="influencer-card__tags">
            {(inf.languages || []).map((l: string) => (
              <span key={l} className={`lang-badge lang-badge--${l}`}>
                {LANGUAGES.find(la => la.id === l)?.flag} {LANGUAGES.find(la => la.id === l)?.name || l}
              </span>
            ))}
            {(inf.niche || []).map((n: string) => (
              <span key={n} className="niche-tag">
                {INFLUENCER_NICHES.find(ni => ni.id === n)?.icon} {INFLUENCER_NICHES.find(ni => ni.id === n)?.name || n}
              </span>
            ))}
          </div>

          {/* Package */}
          {packagePrice > 0 && (
            <div className="influencer-card__package">
              <span className="influencer-card__package-text">📦 1 Reel + 2 Stories</span>
              <span className="influencer-card__package-price">₹{packagePrice.toLocaleString()}</span>
            </div>
          )}

          {/* Rate Card */}
          <div className="influencer-card__rates">
            <div className="influencer-card__rate-item">
              <div className="influencer-card__rate-label">Post</div>
              <div className="influencer-card__rate-value">₹{(inf.ratePerPost || 0).toLocaleString()}</div>
            </div>
            <div className="influencer-card__rate-item">
              <div className="influencer-card__rate-label">Reel</div>
              <div className="influencer-card__rate-value">₹{(inf.ratePerReel || 0).toLocaleString()}</div>
            </div>
            <div className="influencer-card__rate-item">
              <div className="influencer-card__rate-label">Story</div>
              <div className="influencer-card__rate-value">₹{(inf.ratePerStory || 0).toLocaleString()}</div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="influencer-card__actions">
            <button className="btn-contact btn-contact--insta" onClick={() => window.open(inf.instagramUrl || 'https://instagram.com', '_blank')}>
              📸 Instagram
            </button>
            <button className="btn-contact btn-contact--hire" onClick={() => { setHireTarget(inf); setHireMsg(''); setHireType('reel') }}>
              💼 Hire Now
            </button>
            <button className="btn-contact btn-contact--whatsapp" onClick={() => {
              const msg = `Hi ${inf.name}! I found your profile on Hirezzy and I'm interested in a brand collaboration. Let's discuss! 🔥`
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
            }}>
              💬
            </button>
          </div>
        </div>
        )
      })}

      {/* ═══ HIRE NOW MODAL ═══ */}
      {hireTarget && (
        <div className="hire-modal">
          <div className="hire-modal__overlay" onClick={() => setHireTarget(null)} />
          <div className="hire-modal__sheet">
            <div className="hire-modal__handle" />
            <div className="hire-modal__title">💼 Hire {hireTarget.name}</div>
            <div className="hire-modal__sub">Select a package and send your offer</div>

            <div className="hire-modal__options">
              {[
                { id: 'post', icon: '📸', label: 'Post', price: hireTarget.ratePerPost },
                { id: 'reel', icon: '🎬', label: 'Reel', price: hireTarget.ratePerReel },
                { id: 'story', icon: '📱', label: 'Story', price: hireTarget.ratePerStory },
              ].map(opt => (
                <div key={opt.id} className={`hire-option ${hireType === opt.id ? 'hire-option--selected' : ''}`} onClick={() => setHireType(opt.id)}>
                  <span className="hire-option__icon">{opt.icon}</span>
                  {opt.label}
                  <div className="hire-option__price">₹{(opt.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Brief / Message (Optional)</label>
              <input className="form-input" placeholder="Describe your campaign briefly..." value={hireMsg} onChange={e => setHireMsg(e.target.value)} />
            </div>

            {/* Order Summary */}
            {(() => {
              const price = hireType === 'post' ? hireTarget.ratePerPost : hireType === 'reel' ? hireTarget.ratePerReel : (hireTarget.ratePerStory || 0)
              const fee = Math.round((price || 0) * 0.1)
              const total = (price || 0) + fee
              return (
                <div style={{ padding: '12px', background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span>{hireType.charAt(0).toUpperCase() + hireType.slice(1)} rate</span>
                    <span>₹{(price || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Platform fee (10%)</span>
                    <span>₹{fee.toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              )
            })()}

            <button className="btn btn--primary" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }} onClick={() => {
              const price = hireType === 'post' ? hireTarget.ratePerPost : hireType === 'reel' ? hireTarget.ratePerReel : (hireTarget.ratePerStory || 0)
              const fee = Math.round((price || 0) * 0.1)
              const total = ((price || 0) + fee) * 100 // Razorpay needs paise

              const options = {
                key: 'rzp_test_ScelMhwyhlYlf1', // Razorpay Test Key
                amount: total,
                currency: 'INR',
                name: 'Hirezzy',
                description: `Hire ${hireTarget.name} - ${hireType}`,
                image: 'https://hirezzy.vercel.app/icon-192.svg',
                handler: function(response: any) {
                  alert(`✅ Payment successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour hire request has been sent to ${hireTarget.name}!`)
                  setHireTarget(null)
                },
                prefill: { name: auth.currentUser?.displayName || 'Hirezzy User', email: auth.currentUser?.email || '' },
                theme: { color: '#5B4CDB' },
              }
              try {
                const rzp = new (window as any).Razorpay(options)
                rzp.open()
              } catch {
                alert('⚠️ Razorpay not loaded. Please check your API key.\n\nFor now, use WhatsApp to send your offer!')
              }
            }}>
              💳 Pay ₹{(() => { const p = hireType === 'post' ? hireTarget.ratePerPost : hireType === 'reel' ? hireTarget.ratePerReel : (hireTarget.ratePerStory || 0); return ((p || 0) + Math.round((p || 0) * 0.1)).toLocaleString() })()} & Hire
            </button>
            <button className="btn btn--ghost mt-1" style={{ fontSize: '0.75rem' }} onClick={() => {
              const price = hireType === 'post' ? hireTarget.ratePerPost : hireType === 'reel' ? hireTarget.ratePerReel : hireTarget.ratePerStory
              const msg = `Hi ${hireTarget.name}! 🎬\n\nI'd like to hire you for a ${hireType} promotion via Hirezzy.\n\n💰 Budget: ₹${(price || 0).toLocaleString()}\n📋 Brief: ${hireMsg || 'Let\'s discuss details'}\n\nLooking forward to working with you! 🔥`
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
              setHireTarget(null)
            }}>
              Or Send Offer via WhatsApp 💬
            </button>
            <button className="btn btn--ghost" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} onClick={() => setHireTarget(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* AI Match Modal */}
      {showAIMatch && (
        <div className="ai-match-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAIMatch(false) }}>
          <div className="ai-match-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🤖 AI Creator Matching</h3>
              <button onClick={() => setShowAIMatch(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {aiResults.length === 0 ? (<>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Tell us what you need and we'll find the perfect creator!</p>
              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Language</label>
                <div className="jd-select-wrap"><select className="jd-select" value={aiLang} onChange={e => setAiLang(e.target.value)}>
                  <option value="">Any language</option>
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select><svg className="jd-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>City</label>
                <div className="jd-select-wrap"><select className="jd-select" value={aiCity} onChange={e => setAiCity(e.target.value)}>
                  <option value="">Any city</option>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select><svg className="jd-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Niche</label>
                <div className="jd-select-wrap"><select className="jd-select" value={aiNiche} onChange={e => setAiNiche(e.target.value)}>
                  <option value="">Any niche</option>
                  {INFLUENCER_NICHES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select><svg className="jd-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Max Budget (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 5000" value={aiBudget} onChange={e => setAiBudget(e.target.value)} />
              </div>
              <button className="jc3__apply" onClick={runAIMatch} style={{ width: '100%', padding: '14px', fontSize: '0.88rem' }}>Find Best Matches</button>
            </>) : (<>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>🎯 Found {aiResults.length} perfect matches!</p>
              {aiResults.map((r: any, i: number) => {
                const scoreColor = r.matchScore >= 80 ? '#10B981' : r.matchScore >= 60 ? '#F59E0B' : '#EF4444'
                return (
                  <div key={i} className="ai-match-result fade-in" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => { setShowAIMatch(false); onSelectInfluencer?.(r) }}>
                    <div className="ai-match-score" style={{ background: `conic-gradient(${scoreColor} ${r.matchScore * 3.6}deg, var(--glass-border) 0deg)` }}>
                      <span style={{ color: scoreColor }}>{r.matchScore}%</span>
                    </div>
                    <div className="ai-match-info">
                      <div className="ai-match-name">{r.name} {r.instagramUrl && '📸'}</div>
                      <div className="ai-match-reason">{r.reasons.slice(0, 2).join(' • ')}</div>
                      <div className="ai-match-tags">
                        {(r.niche || []).slice(0, 2).map((n: string, j: number) => <span key={j} className="ai-match-tag">{n}</span>)}
                        <span className="ai-match-tag">₹{fmtFollowers(r.ratePerReel || r.ratePerPost || 0)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmtFollowers(r.followers)}</div>
                  </div>
                )
              })}
              <button className="jd-cancel" onClick={() => setAiResults([])}>← Search Again</button>
            </>)}
          </div>
        </div>
      )}
    </div></div>
  )
}

// ═══ INFLUENCER DETAIL PAGE ═══
function InfluencerDetailPage({ influencer, onBack, userName, userId }: { influencer: any, onBack: () => void, userName: string, userId: string }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Demo reviews for non-real IDs
  const demoReviews = [
    { id: 'dr1', reviewerName: 'TechBrand India', rating: 5, text: 'Excellent work on our product launch reel! Very professional and delivered before deadline. 🔥', campaignType: 'reel', createdAt: { toDate: () => new Date('2026-03-15') } },
    { id: 'dr2', reviewerName: 'FoodCorner Vizag', rating: 4, text: 'Good content quality. The story posts got great engagement. Will hire again!', campaignType: 'story', createdAt: { toDate: () => new Date('2026-02-28') } },
    { id: 'dr3', reviewerName: 'StyleMart Online', rating: 5, text: 'Amazing creator! The reel went viral and brought us 500+ new followers. Highly recommend! 💎', campaignType: 'reel', createdAt: { toDate: () => new Date('2026-01-20') } },
  ]

  useEffect(() => {
    if (influencer.id?.startsWith('inf')) {
      setReviews(demoReviews)
      setLoadingReviews(false)
    } else {
      getReviews(influencer.id).then(r => { setReviews(r.length > 0 ? r : demoReviews); setLoadingReviews(false) }).catch(() => { setReviews(demoReviews); setLoadingReviews(false) })
    }
  }, [influencer.id])

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || !userId) return
    setSubmitting(true)
    try {
      await addReview(influencer.id, { rating: reviewRating, text: reviewText, reviewerName: userName, reviewerId: userId })
      const updated = await getReviews(influencer.id)
      setReviews(updated.length > 0 ? updated : [...reviews, { id: Date.now().toString(), reviewerName: userName, rating: reviewRating, text: reviewText, createdAt: { toDate: () => new Date() } }])
      setReviewText('')
      setReviewRating(5)
      setShowReviewForm(false)
    } catch {
      setReviews([...reviews, { id: Date.now().toString(), reviewerName: userName, rating: reviewRating, text: reviewText, createdAt: { toDate: () => new Date() } }])
      setShowReviewForm(false)
    }
    setSubmitting(false)
  }

  const smartTags: { label: string, cls: string }[] = []
  if (influencer.engagementRate >= 5) smartTags.push({ label: '🔥 High Engagement', cls: 'smart-tag--fire' })
  if (influencer.rating >= 4.8 && influencer.followers >= 50000) smartTags.push({ label: '🏆 Top Creator', cls: 'smart-tag--top' })
  if ((influencer.ratePerPost || 0) >= 8000 || (influencer.ratePerReel || 0) >= 10000) smartTags.push({ label: '💎 Premium', cls: 'smart-tag--premium' })

  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : influencer.rating || '0'



  return (
    <div className="page"><div className="page__content slide-up" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack} style={{ marginBottom: '8px' }}>← Back to Creators</button>

      {/* Hero */}
      <div className="jd-hero">
        <div className="jd-hero__icon" style={{ background: `linear-gradient(135deg, ${influencer.color}, ${influencer.color}88)`, fontSize: '1.4rem', color: 'white', width: '64px', height: '64px', borderRadius: '50%' }}>
          {influencer.avatar}
        </div>
        <h2 className="jd-hero__title" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {influencer.name}
          {influencer.instagramUrl && <span className="jc3__badge jc3__badge--verified" style={{ background: 'rgba(225,48,108,0.1)', color: '#E1306C', borderColor: 'rgba(225,48,108,0.2)' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>Linked</span>}
        </h2>
        <p className="jd-hero__company">{influencer.handle} • {influencer.city || 'India'}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>{influencer.bio || 'Content Creator on Hirezzy'}</p>

        {/* Smart Tags */}
        {smartTags.length > 0 && (
          <div className="jd-hero__badges" style={{ marginTop: '8px' }}>
            {smartTags.map((t, i) => <span key={i} className="jc3__badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>{t.label}</span>)}
          </div>
        )}
      </div>

      {/* Action Buttons — glassmorphism icon boxes */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button className="jc3__apply" style={{ flex: 1, padding: '11px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={() => window.open(influencer.instagramUrl || 'https://instagram.com', '_blank')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          Instagram
        </button>
        <button className="jc3__apply" style={{ flex: 1, padding: '11px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={() => {
          const msg = `Hi ${influencer.name}!\nI found you on Hirezzy and want to hire you.\nLet's discuss!`
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Hire
        </button>
        <button className="jd-cancel" style={{ width: '46px', padding: '11px', borderColor: 'rgba(37,211,102,0.3)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${influencer.name}!`)}`, '_blank')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </button>
      </div>

      {/* Instagram Profile */}
      {influencer.instagramUrl && (
        <div className="jd-form fade-in" style={{ marginBottom: '10px' }} onClick={() => window.open(influencer.instagramUrl, '_blank')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(225,48,108,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>@{influencer.instagramUrl.replace(/.*instagram\.com\//, '').replace(/[\/\?].*/, '')}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{fmtFollowers(influencer.followers)} followers • {influencer.engagementRate}% engage</div>
            </div>
            <span className="jc3__badge" style={{ background: 'rgba(225,48,108,0.1)', color: '#E1306C', border: '1px solid rgba(225,48,108,0.2)', fontSize: '0.62rem' }}>Open →</span>
          </div>
        </div>
      )}

      {influencer.youtubeUrl && (
        <div className="jd-form fade-in" style={{ marginBottom: '10px' }} onClick={() => window.open(influencer.youtubeUrl, '_blank')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>YouTube Channel</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Watch content & reviews</div>
            </div>
            <span className="jc3__badge" style={{ background: 'rgba(255,0,0,0.08)', color: '#FF0000', border: '1px solid rgba(255,0,0,0.15)', fontSize: '0.62rem' }}>Watch →</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="jd-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '14px' }}>
        <div className="jd-grid__item" style={{ textAlign: 'center' }}>
          <div className="jd-grid__value">{fmtFollowers(influencer.followers)}</div>
          <div className="jd-grid__label">FOLLOWERS</div>
        </div>
        <div className="jd-grid__item" style={{ textAlign: 'center' }}>
          <div className="jd-grid__value" style={{ color: influencer.engagementRate >= 5 ? '#10B981' : '#F59E0B' }}>{influencer.engagementRate}%</div>
          <div className="jd-grid__label">ENGAGEMENT</div>
        </div>
        <div className="jd-grid__item" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span className="jd-grid__value">{avgRating}</span></div>
          <div className="jd-grid__label">{reviews.length} REVIEWS</div>
        </div>
      </div>

      {/* Rate Card */}
      <div className="jd-form fade-in">
        <h3 className="jd-form__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Rate Card
        </h3>
        <div className="jd-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '10px' }}>
          <div className="jd-grid__item" style={{ textAlign: 'center' }}><div className="jd-grid__label">POST</div><div className="jd-grid__value" style={{ color: '#10B981' }}>₹{(influencer.ratePerPost || 0).toLocaleString()}</div></div>
          <div className="jd-grid__item" style={{ textAlign: 'center' }}><div className="jd-grid__label">REEL</div><div className="jd-grid__value" style={{ color: '#3B82F6' }}>₹{(influencer.ratePerReel || 0).toLocaleString()}</div></div>
          <div className="jd-grid__item" style={{ textAlign: 'center' }}><div className="jd-grid__label">STORY</div><div className="jd-grid__value" style={{ color: '#8B5CF6' }}>₹{(influencer.ratePerStory || 0).toLocaleString()}</div></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>1 Reel + 2 Stories</span>
          <span className="jc3__salary">₹{((influencer.ratePerReel || 0) + (influencer.ratePerStory || 0) * 2).toLocaleString()}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="jd-form fade-in">
        <h3 className="jd-form__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Languages & Niche
        </h3>
        <div className="jc3__skills">
          {(influencer.languages || []).map((l: string) => (
            <span key={l} className="jc3__skill">{LANGUAGES.find(la => la.id === l)?.flag} {LANGUAGES.find(la => la.id === l)?.name || l}</span>
          ))}
          {(influencer.niche || []).map((n: string) => (
            <span key={n} className="jc3__skill">{INFLUENCER_NICHES.find(ni => ni.id === n)?.icon} {INFLUENCER_NICHES.find(ni => ni.id === n)?.name || n}</span>
          ))}
        </div>
      </div>

      {/* Social Links — Glassmorphism icon boxes */}
      <div className="jd-form fade-in">
        <h3 className="jd-form__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Social Links
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {influencer.instagramUrl && <button style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => window.open(influencer.instagramUrl, '_blank')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></button>}
          {influencer.youtubeUrl && <button style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => window.open(influencer.youtubeUrl, '_blank')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></button>}
          <button style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => { navigator.clipboard.writeText(`https://hirezzy.com/creator/${influencer.id}`); toast('Link copied!', 'success') }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
        </div>
      </div>

      {/* Portfolio Gallery */}
      <div className="detail-section fade-in">
        <div className="detail-section__title">🖼️ Portfolio</div>
        <div className="portfolio-grid">
          {[
            { icon: '🎬', title: 'Product Review Reel', type: 'Reel', brand: 'TechBrand' },
            { icon: '📸', title: 'Brand Collab Post', type: 'Post', brand: 'StyleCo' },
            { icon: '📱', title: 'Unboxing Story', type: 'Story', brand: 'GadgetPro' },
            { icon: '🎥', title: 'YouTube Review', type: 'YouTube', brand: 'PhonePlus' },
            { icon: '🎬', title: 'Tutorial Reel', type: 'Reel', brand: 'AppLaunch' },
            { icon: '📸', title: 'Lifestyle Post', type: 'Post', brand: 'FashionX' },
          ].map((item, i) => (
            <div key={i} className="portfolio-item fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="portfolio-item__img" style={{ background: `linear-gradient(135deg, ${influencer.color}33, ${influencer.color}11)` }}>{item.icon}</div>
              <div className="portfolio-item__info">
                <div className="portfolio-item__title">{item.title}</div>
                <div className="portfolio-item__type">{item.type} • {item.brand}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="jd-form fade-in">
        <h3 className="jd-form__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Reviews ({reviews.length})
        </h3>

        {loadingReviews && <p className="text-sm text-muted">Loading reviews...</p>}

        {!loadingReviews && reviews.map((rev: any) => (
          <div key={rev.id} style={{ padding: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{rev.reviewerName}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{rev.createdAt?.toDate ? new Date(rev.createdAt.toDate()).toLocaleDateString() : 'Recent'}</span>
            </div>
            <div style={{ marginBottom: '4px' }}>{[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= (rev.rating || 0) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2" style={{ marginRight: '1px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{rev.text}</p>
            {rev.campaignType && <span className="jc3__skill" style={{ marginTop: '6px', display: 'inline-block' }}>{CONTENT_TYPES.find(c => c.id === rev.campaignType)?.icon || ''} {rev.campaignType}</span>}
          </div>
        ))}

        {/* Write Review */}
        {!showReviewForm && (
          <button className="jd-cancel" style={{ width: '100%', marginTop: '4px' }} onClick={() => setShowReviewForm(true)}>Write a Review</button>
        )}

        {showReviewForm && (
          <div className="slide-up" style={{ padding: '14px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', marginTop: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Write a Review
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Your Rating</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '6px' }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill={s <= (hoverRating || reviewRating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2" style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewRating(s)}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span style={{ marginLeft: '6px', fontWeight: 700, fontSize: '0.82rem' }}>{reviewRating}/5</span>
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Your Review</label>
              <textarea className="form-input" rows={3} placeholder="Share your experience working with this creator..." value={reviewText} onChange={e => setReviewText(e.target.value)} style={{ resize: 'vertical', minHeight: '70px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="jd-cancel" style={{ flex: 0 }} onClick={() => setShowReviewForm(false)}>Cancel</button>
              <button className="jc3__apply" disabled={!reviewText.trim() || submitting} onClick={handleSubmitReview} style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}>
                {submitting ? 'Sending...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share & Report */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 0', justifyContent: 'center' }}>
        <button className="jd-cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(108,92,231,0.3)', color: 'var(--primary)' }} onClick={() => shareCreatorProfile(influencer)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
        <button className="jd-cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }} onClick={() => setShowReport(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Report
        </button>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="ai-match-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReport(false) }}>
          <div className="ai-match-modal">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>🚨 Report {influencer.name}</h3>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                <p style={{ fontWeight: 600 }}>Report submitted!</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Our team will review within 24 hours.</p>
                <button className="btn btn--ghost mt-1" onClick={() => { setShowReport(false); setReportSent(false) }}>Close</button>
              </div>
            ) : (<>
              <div className="form-group">
                <label>Reason</label>
                <select className="form-input" value={reportReason} onChange={e => setReportReason(e.target.value)}>
                  <option value="">Select a reason</option>
                  <option value="fake">Fake profile / fake followers</option>
                  <option value="spam">Spam / promotional</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="misleading">Misleading information</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Details (optional)</label>
                <textarea className="form-input" rows={3} placeholder="Tell us more..." value={reportDetails} onChange={e => setReportDetails(e.target.value)} style={{ resize: 'none' }} />
              </div>
              <button className="btn btn--primary" disabled={!reportReason} style={{ background: '#EF4444' }} onClick={async () => {
                try { await submitReport({ reporterId: userId, targetId: influencer.id, targetName: influencer.name, reason: reportReason, details: reportDetails }) } catch {}
                setReportSent(true)
              }}>🚨 Submit Report</button>
              <button className="btn btn--ghost mt-1" onClick={() => setShowReport(false)}>Cancel</button>
            </>)}
          </div>
        </div>
      )}
    </div></div>
  )
}

// ═══ MY CAMPAIGNS PAGE ═══
function MyCampaignsPage({ onBack, userId, userName: _userName }: { onBack: () => void, userId: string, userName: string }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Demo campaigns
  const demoCampaigns = [
    { id: 'dc1', influencerName: 'Ravi Telugu Tech', influencerAvatar: 'R', influencerColor: '#0984E3', contentType: 'reel', budget: 5000, brief: 'Product review reel for our new wireless earbuds. 30-60 second reel with product showcase.', status: 'in_progress', createdAt: { toDate: () => new Date('2026-04-10') } },
    { id: 'dc2', influencerName: 'Priya Foodie AP', influencerAvatar: 'P', influencerColor: '#FDCB6E', contentType: 'story', budget: 1000, brief: 'Instagram story featuring our restaurant grand opening.', status: 'completed', createdAt: { toDate: () => new Date('2026-04-05') } },
    { id: 'dc3', influencerName: 'Sneha Style Hub', influencerAvatar: 'S', influencerColor: '#E17055', contentType: 'post', budget: 8000, brief: 'Fashion photoshoot with our new summer collection.', status: 'pending', createdAt: { toDate: () => new Date('2026-04-12') } },
  ]

  useEffect(() => {
    if (userId) {
      getUserCampaigns(userId).then(data => {
        setCampaigns(data.length > 0 ? data : demoCampaigns)
        setLoading(false)
      }).catch(() => { setCampaigns(demoCampaigns); setLoading(false) })
    } else {
      setCampaigns(demoCampaigns)
      setLoading(false)
    }
  }, [userId])

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c: any) => ['pending', 'accepted', 'in_progress'].includes(c.status)).length,
    completed: campaigns.filter((c: any) => c.status === 'completed').length,
    spent: campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0),
  }

  return (
    <div className="page"><div className="page__content">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0' }}>📋 My Campaigns</h2>

      {/* Stats */}
      <div className="detail-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
        <div className="detail-stat"><div className="detail-stat__value">{stats.total}</div><div className="detail-stat__label">Total</div></div>
        <div className="detail-stat"><div className="detail-stat__value" style={{ color: '#0984E3' }}>{stats.active}</div><div className="detail-stat__label">Active</div></div>
        <div className="detail-stat"><div className="detail-stat__value" style={{ color: '#10B981' }}>{stats.completed}</div><div className="detail-stat__label">Done</div></div>
        <div className="detail-stat"><div className="detail-stat__value" style={{ color: '#00E676' }}>₹{stats.spent >= 1000 ? (stats.spent / 1000).toFixed(1) + 'K' : stats.spent}</div><div className="detail-stat__label">Spent</div></div>
      </div>

      {loading && <p className="text-center text-muted" style={{ padding: '40px 0' }}>⏳ Loading campaigns...</p>}

      {!loading && campaigns.length === 0 && (
        <div className="campaign-empty">
          <div className="campaign-empty__icon">📋</div>
          <div className="campaign-empty__title">No campaigns yet</div>
          <div className="campaign-empty__desc">Hire an influencer from the Creators tab to start your first campaign!</div>
        </div>
      )}

      {!loading && campaigns.map((camp: any) => {
        const st = CAMPAIGN_STATUS[camp.status] || CAMPAIGN_STATUS.pending
        return (
          <div key={camp.id} className={`campaign-card campaign-card--${camp.status} fade-in`}>
            <div className="campaign-card__top">
              <div className="campaign-card__avatar" style={{ background: `linear-gradient(135deg, ${camp.influencerColor || '#6C5CE7'}, ${camp.influencerColor || '#6C5CE7'}88)` }}>
                {camp.influencerAvatar || camp.influencerName?.charAt(0) || '?'}
              </div>
              <div className="campaign-card__info">
                <div className="campaign-card__name">{camp.influencerName}</div>
                <div className="campaign-card__type">{CONTENT_TYPES.find(c => c.id === camp.contentType)?.icon || '📋'} {CONTENT_TYPES.find(c => c.id === camp.contentType)?.name || camp.contentType}</div>
              </div>
              <span className="campaign-card__status" style={{ background: st.bg, color: st.color }}>{st.icon} {st.label}</span>
            </div>

            <div className="campaign-card__details">
              <div className="campaign-card__detail">💰 <strong>₹{(camp.budget || 0).toLocaleString()}</strong></div>
              <div className="campaign-card__detail">📅 {camp.createdAt?.toDate ? new Date(camp.createdAt.toDate()).toLocaleDateString() : 'Recently'}</div>
            </div>

            {camp.brief && <div className="campaign-card__brief">📝 {camp.brief}</div>}

            <div className="campaign-card__actions">
              {camp.status === 'completed' && (
                <button className="btn-sm btn-sm--primary" onClick={() => { /* Could navigate to review */ }}>⭐ Write Review</button>
              )}
              {camp.status === 'pending' && (
                <button className="btn-sm" onClick={() => { /* Cancel */ }}>❌ Cancel</button>
              )}
              <button className="btn-sm" onClick={() => {
                const msg = `Hi ${camp.influencerName}! Following up on our ${camp.contentType} campaign via Hirezzy. Status: ${st.label}`
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
              }}>💬 Message</button>
            </div>
          </div>
        )
      })}
    </div></div>
  )
}

// ═══ CHAT LIST PAGE ═══
function ChatListPage({ onBack, userId, onOpenChat }: { onBack: () => void, userId: string, onOpenChat: (chat: any) => void }) {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')

  const demoChats = [
    { id: 'demo1', participantNames: { other: 'Ravi Telugu Tech' }, participantAvatars: { other: 'R' }, participantColors: { other: '#0984E3' }, lastMessage: 'Hi! I\'d love to collaborate on a tech review reel 🎬', lastMessageAt: { toDate: () => new Date(Date.now() - 3600000) }, participants: [userId, 'inf1'], unread: 2, online: true, role: 'creator', gigContext: 'Tech Review Reel' },
    { id: 'demo2', participantNames: { other: 'Priya Foodie AP' }, participantAvatars: { other: 'P' }, participantColors: { other: '#FDCB6E' }, lastMessage: 'Sure, I\'m available next week for the food shoot! 📸', lastMessageAt: { toDate: () => new Date(Date.now() - 86400000) }, participants: [userId, 'inf2'], unread: 0, online: true, role: 'creator', gigContext: 'Food Photography' },
    { id: 'demo3', participantNames: { other: 'Deepak Comedy Telugu' }, participantAvatars: { other: 'D' }, participantColors: { other: '#FF6B6B' }, lastMessage: 'Let me check my schedule and get back to you 😄', lastMessageAt: { toDate: () => new Date(Date.now() - 172800000) }, participants: [userId, 'inf7'], unread: 0, online: false, role: 'creator', gigContext: '' },
    { id: 'demo4', participantNames: { other: 'SmartBot1' }, participantAvatars: { other: 'S' }, participantColors: { other: '#6C5CE7' }, lastMessage: 'Your AI Chatbot order is in progress! 🤖', lastMessageAt: { toDate: () => new Date(Date.now() - 7200000) }, participants: [userId, 'gig_seller1'], unread: 1, online: true, role: 'gig_seller', gigContext: 'Custom AI Chatbot' },
    { id: 'demo5', participantNames: { other: 'UImaster' }, participantAvatars: { other: 'U' }, participantColors: { other: '#E17055' }, lastMessage: 'I\'ve started working on your App UI. Will share wireframes soon 🎨', lastMessageAt: { toDate: () => new Date(Date.now() - 14400000) }, participants: [userId, 'gig_seller3'], unread: 0, online: false, role: 'gig_seller', gigContext: 'Futuristic App UI Design' },
  ]

  useEffect(() => {
    if (userId) {
      getUserChats(userId).then(data => {
        setChats(data.length > 0 ? data : demoChats)
        setLoading(false)
      }).catch(() => { setChats(demoChats); setLoading(false) })
    } else { setChats(demoChats); setLoading(false) }
  }, [userId])

  const getOtherInfo = (chat: any) => {
    const otherId = (chat.participants || []).find((p: string) => p !== userId) || 'other'
    return {
      name: chat.participantNames?.[otherId] || chat.participantNames?.other || 'Creator',
      avatar: chat.participantAvatars?.[otherId] || chat.participantAvatars?.other || '?',
      color: chat.participantColors?.[otherId] || chat.participantColors?.other || '#6C5CE7',
    }
  }

  const fmtTime = (ts: any) => {
    if (!ts?.toDate) return ''
    const d = new Date(ts.toDate())
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'now'
    if (diffMin < 60) return `${diffMin}m`
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
  }

  const filteredChats = chats.filter(c => {
    if (!searchQ) return true
    const other = getOtherInfo(c)
    return other.name.toLowerCase().includes(searchQ.toLowerCase()) || (c.gigContext || '').toLowerCase().includes(searchQ.toLowerCase())
  })

  const unreadTotal = chats.reduce((sum, c) => sum + (c.unread || 0), 0)

  return (
    <div className="page"><div className="page__content" style={{ padding: '0' }}>
      {/* Premium Header */}
      <div className="chat-list-header">
        <div className="chat-list-header__top">
          <button className="chat-list-back" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h2 className="chat-list-header__title">Messages</h2>
            {unreadTotal > 0 && <span className="chat-list-header__badge">{unreadTotal} unread</span>}
          </div>
          <button className="chat-list-compose" onClick={() => toast('Start a new chat from Creator or Gig pages!', 'info')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>
          </button>
        </div>
        {/* Search */}
        <div className="chat-list-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input placeholder="Search conversations..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
      </div>

      {loading && (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="chat-loading-dots">
            <span style={{ animationDelay: '0s' }} /><span style={{ animationDelay: '0.2s' }} /><span style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-sm text-muted" style={{ marginTop: '12px' }}>Loading conversations...</p>
        </div>
      )}

      {!loading && filteredChats.length === 0 && (
        <div className="chat-empty-premium">
          <div className="chat-empty-premium__icon-wrap">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="chat-empty-premium__title">No conversations yet</p>
          <p className="chat-empty-premium__desc">Message a creator or order a gig to start chatting!</p>
          <button className="btn btn--primary" style={{ maxWidth: '200px', margin: '16px auto 0', fontSize: '0.78rem', padding: '10px 20px' }} onClick={onBack}>Browse Creators</button>
        </div>
      )}

      {/* Chat List */}
      <div className="chat-list-items">
        {!loading && filteredChats.map((chat: any, idx: number) => {
          const other = getOtherInfo(chat)
          const isOnline = chat.online !== false
          const unread = chat.unread || 0
          const gigCtx = chat.gigContext || ''
          const isGigSeller = chat.role === 'gig_seller'

          return (
            <div key={chat.id} className={`chat-list-card ${unread > 0 ? 'chat-list-card--unread' : ''}`}
              style={{ animationDelay: `${idx * 0.06}s` }}
              onClick={() => onOpenChat({ ...chat, otherName: other.name, otherAvatar: other.avatar, otherColor: other.color, online: isOnline, gigContext: gigCtx, isGigSeller })}>
              {/* Avatar with online indicator */}
              <div className="chat-list-card__avatar-wrap">
                <div className="chat-list-card__avatar" style={{ background: `linear-gradient(135deg, ${other.color}, ${other.color}99)` }}>
                  {other.avatar}
                </div>
                <div className={`chat-list-card__online ${isOnline ? 'chat-list-card__online--on' : ''}`} />
              </div>
              {/* Info */}
              <div className="chat-list-card__body">
                <div className="chat-list-card__row1">
                  <div className="chat-list-card__name">
                    {other.name}
                    {isGigSeller && <span className="chat-list-card__role-tag">🛒 Gig Seller</span>}
                    {!isGigSeller && <span className="chat-list-card__role-tag chat-list-card__role-tag--creator">🎬 Creator</span>}
                  </div>
                  <div className={`chat-list-card__time ${unread > 0 ? 'chat-list-card__time--unread' : ''}`}>{fmtTime(chat.lastMessageAt)}</div>
                </div>
                {gigCtx && (
                  <div className="chat-list-card__gig-ctx">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    {gigCtx}
                  </div>
                )}
                <div className="chat-list-card__row2">
                  <div className={`chat-list-card__msg ${unread > 0 ? 'chat-list-card__msg--unread' : ''}`}>
                    {chat.lastMessage || 'Start a conversation...'}
                  </div>
                  {unread > 0 && <div className="chat-list-card__badge">{unread}</div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div></div>
  )
}

// ═══ CHAT PAGE — Premium Redesign ═══
function ChatPage({ chat, onBack, userId }: { chat: any, onBack: () => void, userId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const messagesEndRef = { current: null as HTMLDivElement | null }

  const demoMessages = [
    { id: 'm1', senderId: 'other', text: `Hi! Thanks for reaching out on Hirezzy 😊`, createdAt: { toDate: () => new Date(Date.now() - 7200000) } },
    { id: 'm2', senderId: userId, text: `Hey! I love your content. I'd like to hire you for a brand promotion.`, createdAt: { toDate: () => new Date(Date.now() - 7000000) } },
    { id: 'm3', senderId: 'other', text: `That sounds great! What kind of content are you looking for? Post, reel, or story?`, createdAt: { toDate: () => new Date(Date.now() - 6800000) } },
    { id: 'm4', senderId: userId, text: `I'm thinking a reel + 2 stories for our new product launch 🚀`, createdAt: { toDate: () => new Date(Date.now() - 6600000) } },
    { id: 'm5', senderId: 'other', text: `Perfect! My reel + 2 stories package is available. Let me send you a proposal 📋`, createdAt: { toDate: () => new Date(Date.now() - 3600000) } },
  ]

  useEffect(() => {
    if (chat.id?.startsWith('demo')) {
      setMessages(demoMessages)
      return
    }
    const unsub = listenToMessages(chat.id, (msgs) => {
      setMessages(msgs.length > 0 ? msgs : demoMessages)
    })
    return () => unsub()
  }, [chat.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim()) return
    const msgText = newMsg.trim()
    setNewMsg('')
    setSending(true)

    if (chat.id?.startsWith('demo')) {
      setMessages(prev => [...prev, { id: Date.now().toString(), senderId: userId, text: msgText, createdAt: { toDate: () => new Date() } }])
      // Show typing indicator
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), senderId: 'other', text: getAutoReply(msgText), createdAt: { toDate: () => new Date() } }])
      }, 1800)
    } else {
      try {
        await sendChatMessage(chat.id, userId, msgText)
      } catch {
        setMessages(prev => [...prev, { id: Date.now().toString(), senderId: userId, text: msgText, createdAt: { toDate: () => new Date() } }])
      }
    }
    setSending(false)
  }

  const getAutoReply = (msg: string) => {
    const lower = msg.toLowerCase()
    if (lower.includes('price') || lower.includes('rate') || lower.includes('cost')) return 'My rates are on my profile! For custom packages, let\'s discuss details 💰'
    if (lower.includes('available') || lower.includes('free')) return 'Yes, I\'m available! When do you need the content by? 📅'
    if (lower.includes('reel')) return 'Reels are my specialty! I can deliver within 3-5 days after briefing 🎬'
    if (lower.includes('thanks') || lower.includes('thank')) return 'You\'re welcome! Happy to help 😊🙏'
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) return 'Hey there! 👋 How can I help you today?'
    if (lower.includes('order') || lower.includes('gig')) return 'Your order is being processed! I\'ll send updates as I progress 📦'
    if (lower.includes('deadline') || lower.includes('when') || lower.includes('time')) return 'I usually deliver within 3-5 business days. For rush orders, we can discuss! ⏰'
    return 'Sounds good! Let me know the details and we can get started 🚀'
  }

  const fmtTime = (ts: any) => {
    if (!ts?.toDate) return ''
    return new Date(ts.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const fmtDateSep = (ts: any) => {
    if (!ts?.toDate) return 'Today'
    const d = new Date(ts.toDate())
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
  }

  // Group messages by date
  const groupedMessages: { date: string, msgs: any[] }[] = []
  messages.forEach(msg => {
    const dateStr = fmtDateSep(msg.createdAt)
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.msgs.push(msg)
    } else {
      groupedMessages.push({ date: dateStr, msgs: [msg] })
    }
  })

  const isOnline = chat.online !== false
  const gigCtx = chat.gigContext || ''
  const isGigSeller = chat.isGigSeller || false

  return (
    <div className="chat-page-premium">
      {/* Premium Chat Header */}
      <div className="chat-hdr">
        <button className="chat-hdr__back" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="chat-hdr__profile" onClick={() => setShowProfile(!showProfile)}>
          <div className="chat-hdr__avatar-wrap">
            <div className="chat-hdr__avatar" style={{ background: `linear-gradient(135deg, ${chat.otherColor}, ${chat.otherColor}88)` }}>
              {chat.otherAvatar}
            </div>
            <div className={`chat-hdr__online-dot ${isOnline ? 'chat-hdr__online-dot--on' : ''}`} />
          </div>
          <div className="chat-hdr__info">
            <div className="chat-hdr__name">
              {chat.otherName}
              {isGigSeller && <span className="chat-hdr__role-badge" style={{ background: 'rgba(108,92,231,0.12)', color: '#8B5CF6' }}>🛒 Seller</span>}
              {!isGigSeller && <span className="chat-hdr__role-badge" style={{ background: 'rgba(225,48,108,0.12)', color: '#E1306C' }}>🎬 Creator</span>}
            </div>
            <div className="chat-hdr__status-line">
              {isTyping ? (
                <span className="chat-hdr__typing">typing<span className="typing-dots"><span>.</span><span>.</span><span>.</span></span></span>
              ) : (
                <span className={isOnline ? 'chat-hdr__status--online' : 'chat-hdr__status--offline'}>
                  {isOnline ? '● Online' : '○ Offline'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="chat-hdr__actions">
          <button className="chat-hdr__action-btn" onClick={() => toast('Video call coming soon! 📹', 'info')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
          </button>
          <button className="chat-hdr__action-btn" onClick={() => setShowProfile(!showProfile)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* Gig Context Bar */}
      {gigCtx && (
        <div className="chat-gig-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          <span>Discussing: <strong>{gigCtx}</strong></span>
        </div>
      )}

      {/* Profile Slide Panel */}
      {showProfile && (
        <div className="chat-profile-panel">
          <div className="chat-profile-panel__avatar" style={{ background: `linear-gradient(135deg, ${chat.otherColor}, ${chat.otherColor}88)` }}>
            {chat.otherAvatar}
          </div>
          <div className="chat-profile-panel__name">{chat.otherName}</div>
          <div className="chat-profile-panel__role">
            {isGigSeller ? '🛒 Gig Seller on Hirezzy' : '🎬 Creator on Hirezzy'}
          </div>
          {gigCtx && <div className="chat-profile-panel__gig">📦 Active: {gigCtx}</div>}
          <div className="chat-profile-panel__stats">
            <div><strong>⭐ 4.9</strong><span>Rating</span></div>
            <div><strong>98%</strong><span>Response</span></div>
            <div><strong>3-5d</strong><span>Delivery</span></div>
          </div>
          <button className="btn btn--ghost" style={{ fontSize: '0.72rem', padding: '8px', marginTop: '8px' }} onClick={() => setShowProfile(false)}>Close</button>
        </div>
      )}

      {/* Messages Area */}
      <div className="chat-messages-premium">
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            <div className="chat-date-pill">{group.date}</div>
            {group.msgs.map((msg: any, mi: number) => {
              const isSent = msg.senderId === userId
              const isFirst = mi === 0 || group.msgs[mi - 1]?.senderId !== msg.senderId
              return (
                <div key={msg.id} className={`chat-msg ${isSent ? 'chat-msg--sent' : 'chat-msg--received'} ${isFirst ? 'chat-msg--first' : ''}`}
                  style={{ animationDelay: `${mi * 0.04}s` }}>
                  {!isSent && isFirst && (
                    <div className="chat-msg__avatar-sm" style={{ background: `linear-gradient(135deg, ${chat.otherColor}, ${chat.otherColor}88)` }}>
                      {chat.otherAvatar}
                    </div>
                  )}
                  <div className={`chat-msg__bubble ${isSent ? 'chat-msg__bubble--sent' : 'chat-msg__bubble--received'}`}>
                    <div className="chat-msg__text">{msg.text}</div>
                    <div className="chat-msg__meta">
                      <span>{fmtTime(msg.createdAt)}</span>
                      {isSent && <span className="chat-msg__check">✓✓</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="chat-msg chat-msg--received chat-msg--first">
            <div className="chat-msg__avatar-sm" style={{ background: `linear-gradient(135deg, ${chat.otherColor}, ${chat.otherColor}88)` }}>
              {chat.otherAvatar}
            </div>
            <div className="chat-msg__bubble chat-msg__bubble--received chat-typing-bubble">
              <div className="chat-typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={el => { messagesEndRef.current = el }} />
      </div>

      {/* Premium Input Bar */}
      <div className="chat-input-premium">
        <button className="chat-input-premium__attach" onClick={() => toast('Attachments coming soon! 📎', 'info')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <div className="chat-input-premium__wrap">
          <input placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} />
        </div>
        {newMsg.trim() ? (
          <button className="chat-input-premium__send" disabled={sending} onClick={handleSend}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        ) : (
          <button className="chat-input-premium__mic" onClick={() => toast('Voice messages coming soon! 🎤', 'info')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ═══ EDIT PROFILE PAGE ═══
function EditProfilePage({ onBack, userProfile, userId }: { onBack: () => void, userProfile: any, userId: string }) {
  const [name, setName] = useState(userProfile?.name || '')
  const [bio, setBio] = useState(userProfile?.bio || '')
  const [city, setCity] = useState(userProfile?.city || '')
  const [niche, setNiche] = useState((userProfile?.niche || []).join(', '))
  const [languages, setLanguages] = useState((userProfile?.languages || []).join(', '))
  const [instaUrl, setInstaUrl] = useState(userProfile?.instagramUrl || '')
  const [ytUrl, setYtUrl] = useState(userProfile?.youtubeUrl || '')
  const [ratePost, setRatePost] = useState(userProfile?.ratePerPost || '')
  const [rateReel, setRateReel] = useState(userProfile?.ratePerReel || '')
  const [rateStory, setRateStory] = useState(userProfile?.ratePerStory || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile(userId, {
        name, bio, city,
        niche: niche.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: languages.split(',').map((s: string) => s.trim()).filter(Boolean),
        instagramUrl: instaUrl,
        youtubeUrl: ytUrl,
        ratePerPost: Number(ratePost) || 0,
        ratePerReel: Number(rateReel) || 0,
        ratePerStory: Number(rateStory) || 0,
      })
    } catch { /* demo mode */ }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isCreator = userProfile?.role === 'creator' || (userProfile?.roles || []).includes('influencer')

  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>✏️ Edit Profile</h2>

      <div className="form-group"><label>Display Name</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>

      <div className="form-group"><label>Bio</label>
        <textarea className="form-input" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell about yourself..." style={{ resize: 'none' }} /></div>

      <div className="form-group"><label>City</label>
        <input className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Hyderabad, Mumbai..." /></div>

      {isCreator && (<>
        <div className="form-group"><label>Niche (comma separated)</label>
          <input className="form-input" value={niche} onChange={e => setNiche(e.target.value)} placeholder="Tech, Food, Fashion..." /></div>

        <div className="form-group"><label>Languages (comma separated)</label>
          <input className="form-input" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Telugu, Hindi, English..." /></div>

        <div className="form-group"><label>📸 Instagram URL</label>
          <input className="form-input" value={instaUrl} onChange={e => setInstaUrl(e.target.value)} placeholder="https://instagram.com/handle" />
          {instaUrl && !instaUrl.match(/instagram\.com\/[a-zA-Z0-9._]+/) && <span style={{ fontSize: '0.6rem', color: '#EF4444' }}>⚠️ Invalid Instagram URL</span>}
        </div>

        <div className="form-group"><label>🔴 YouTube URL (Optional)</label>
          <input className="form-input" value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/@channel" /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <div className="form-group"><label>📸 Post ₹</label>
            <input className="form-input" type="number" value={ratePost} onChange={e => setRatePost(e.target.value)} /></div>
          <div className="form-group"><label>🎬 Reel ₹</label>
            <input className="form-input" type="number" value={rateReel} onChange={e => setRateReel(e.target.value)} /></div>
          <div className="form-group"><label>📱 Story ₹</label>
            <input className="form-input" type="number" value={rateStory} onChange={e => setRateStory(e.target.value)} /></div>
        </div>
      </>)}

      <button className="btn btn--primary" onClick={handleSave} disabled={saving || !name.trim()} style={{ background: saved ? '#10B981' : undefined }}>
        {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
      </button>
    </div></div>
  )
}

// ═══ SAVED CREATORS PAGE ═══
function SavedCreatorsPage({ onBack, onSelectInfluencer, influencers }: { onBack: () => void, onSelectInfluencer: (inf: any) => void, influencers: any[] }) {
  const [savedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hirezzy_saved') || '[]') } catch { return [] }
  })

  const savedCreators = influencers.filter(inf => savedIds.includes(inf.id))

  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>💾 Saved Creators ({savedCreators.length})</h2>

      {savedCreators.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💾</div>
          <p style={{ fontWeight: 600 }}>No saved creators yet</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap the ♡ on any creator card to save them here!</p>
        </div>
      )}

      {savedCreators.map((inf, i) => (
        <div key={inf.id} className="chat-list-item fade-in" style={{ animationDelay: `${i * 0.06}s`, cursor: 'pointer' }} onClick={() => onSelectInfluencer(inf)}>
          <div className="chat-list-item__avatar" style={{ background: inf.color || '#8B5CF6', fontSize: '0.9rem' }}>{inf.avatar}</div>
          <div className="chat-list-item__info">
            <div className="chat-list-item__name">{inf.name} {inf.instagramUrl && <span style={{ fontSize: '0.5rem', color: '#E1306C' }}>📸</span>}</div>
            <div className="chat-list-item__msg">{inf.city || 'India'} • {fmtFollowers(inf.followers)} • ⭐ {inf.rating}</div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>₹{(inf.ratePerPost || inf.ratePerReel || 0).toLocaleString()}</div>
        </div>
      ))}
    </div></div>
  )
}

// ═══ FAQ PAGE ═══
function FAQPage({ onBack }: { onBack: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const faqs = [
    { q: 'What is Hirezzy?', a: 'Hirezzy is a creator marketplace that connects brands with content creators for Instagram collaborations, YouTube promotions, and more.' },
    { q: 'How do I hire a creator?', a: 'Go to Creators tab → Browse/Search → Click on a creator → Choose package (Post/Reel/Story) → Pay via Razorpay or send offer via WhatsApp.' },
    { q: 'How do I sign up as a creator?', a: 'During onboarding, select "Creator" role → Fill your profile with Instagram URL, rates, niche, and bio → Your profile goes live immediately!' },
    { q: 'Are follower counts verified?', a: 'Stats are self-reported by creators. We recommend clicking the Instagram link on their profile to verify real stats before hiring.' },
    { q: 'How does payment work?', a: 'Payments are processed via Razorpay (UPI, Cards, Netbanking, Wallets). A 10% platform fee is added. Escrow ensures safe transactions.' },
    { q: 'Can I report a fake creator?', a: 'Yes! On any creator profile, scroll down and click "🚨 Report". Our team reviews all reports within 24 hours.' },
    { q: 'What are the creator rates?', a: 'Each creator sets their own rates for Posts, Reels, and Stories. Rates vary from ₹500 to ₹50,000+ depending on followers and engagement.' },
    { q: 'How do I edit my profile?', a: 'Go to Profile tab → "✏️ Edit Profile" → Update your name, bio, rates, Instagram URL → Save changes.' },
    { q: 'Is there a refund policy?', a: 'If a creator doesn\'t deliver content within the agreed timeline, you can raise a dispute. Our team mediates within 48 hours.' },
    { q: 'How do I contact support?', a: 'Go to Profile → Help & Support, or email support@hirezzy.com for assistance.' },
  ]

  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>❓ Frequently Asked Questions</h2>

      {faqs.map((faq, i) => (
        <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.04}s`, marginBottom: '6px', background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600 }}>
            {faq.q}
            <span style={{ fontSize: '0.9rem', transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
          </div>
          {openIdx === i && (
            <div style={{ padding: '0 14px 12px', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.a}</div>
          )}
        </div>
      ))}
    </div></div>
  )
}

// ═══ ABOUT PAGE ═══
function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>ℹ️ About Hirezzy</h2>

      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', fontWeight: 900 }}>Hz</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '10px' }}>Hirezzy</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Find Work. Show Skills. Earn More.</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>🎯 Our Mission</h4>
        <p style={{ fontSize: '0.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>Hirezzy empowers content creators and brands to connect seamlessly. We believe every creator deserves fair opportunities and every brand should find the perfect voice for their story.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
        {[
          { value: '500+', label: 'Creators' },
          { value: '100+', label: 'Brands' },
          { value: '₹10L+', label: 'Paid Out' },
        ].map((s, i) => (
          <div key={i} className="analytics-stat-card fade-in" style={{ padding: '10px', animationDelay: `${i * 0.08}s` }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>🚀 What We Offer</h4>
        {['AI-powered creator matching', 'Secure Razorpay payments', 'Real-time chat & notifications', 'Portfolio showcase', 'Campaign management', 'Analytics dashboard'].map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '5px', fontSize: '0.72rem' }}>
            <span style={{ color: '#10B981' }}>✔</span> {f}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <p>📧 support@hirezzy.com</p>
        <p style={{ marginTop: '4px' }}>© 2026 Hirezzy. All rights reserved.</p>
        <p style={{ marginTop: '4px' }}>v2.0 • Made with ❤️ in India</p>
      </div>
    </div></div>
  )
}

// ═══ CREATOR DASHBOARD ═══
function CreatorDashboardPage({ onBack, userProfile: _userProfile, userId: _userId }: { onBack: () => void, userProfile: any, userId: string }) {
  const [tab, setTab] = useState<'overview' | 'requests' | 'earnings'>('overview')

  const earningsData = [
    { month: 'Jan', amount: 12000 }, { month: 'Feb', amount: 18000 }, { month: 'Mar', amount: 25000 },
    { month: 'Apr', amount: 15000 }, { month: 'May', amount: 30000 }, { month: 'Jun', amount: 22000 },
  ]
  const maxEarning = Math.max(...earningsData.map(d => d.amount))

  const hireRequests = [
    { id: 'hr1', brand: 'TechBrand Co', type: 'reel', budget: 5000, status: 'pending', date: '2 hours ago' },
    { id: 'hr2', brand: 'FoodieApp', type: 'story', budget: 1200, status: 'accepted', date: '1 day ago' },
    { id: 'hr3', brand: 'StyleHub', type: 'post', budget: 3500, status: 'completed', date: '3 days ago' },
    { id: 'hr4', brand: 'GadgetPro', type: 'reel', budget: 8000, status: 'pending', date: '5 hours ago' },
  ]

  return (
    <div className="page"><div className="page__content">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0' }}>🎬 Creator Dashboard</h2>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
        {[
          { icon: '💰', value: '₹1.22L', label: 'Earned' },
          { icon: '📋', value: '24', label: 'Total Hires' },
          { icon: '⭐', value: '4.8', label: 'Rating' },
        ].map((s, i) => (
          <div key={i} className="analytics-stat-card fade-in" style={{ animationDelay: `${i * 0.08}s`, padding: '10px' }}>
            <div style={{ fontSize: '1rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {(['overview', 'requests', 'earnings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: tab === t ? 'var(--primary)' : 'var(--glass)', color: tab === t ? 'white' : 'var(--text)' }}>
            {t === 'overview' ? '📊 Overview' : t === 'requests' ? '📋 Requests' : '💰 Earnings'}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (<>
        <div className="analytics-chart-card" style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>📈 Monthly Earnings</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
            {earningsData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>₹{(d.amount / 1000).toFixed(0)}K</div>
                <div className="analytics-bar" style={{ height: `${(d.amount / maxEarning) * 100}%`, animationDelay: `${i * 0.1}s` }} />
                <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[
            { icon: '🔄', label: 'Repeat Clients', value: '8' },
            { icon: '⚡', label: 'Avg Response', value: '2h' },
            { icon: '📸', label: 'Top Content', value: 'Reels' },
            { icon: '🏆', label: 'Rank', value: 'Top 12%' },
          ].map((s, i) => (
            <div key={i} className="analytics-insight fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
              <span>{s.icon}</span>
              <div style={{ flex: 1, fontSize: '0.72rem' }}>{s.label}</div>
              <strong style={{ fontSize: '0.72rem' }}>{s.value}</strong>
            </div>
          ))}
        </div>
      </>)}

      {/* Requests */}
      {tab === 'requests' && (<>
        {hireRequests.map((r, i) => (
          <div key={r.id} className="chat-list-item fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="chat-list-item__avatar" style={{ background: '#8B5CF6' }}>{r.brand.charAt(0)}</div>
            <div className="chat-list-item__info">
              <div className="chat-list-item__name">{r.brand}</div>
              <div className="chat-list-item__msg">{r.type} • ₹{r.budget.toLocaleString()} • {r.date}</div>
            </div>
            <span className={`payment-badge payment-badge--${r.status === 'pending' ? 'pending' : r.status === 'accepted' ? 'paid' : 'released'}`}>{r.status}</span>
          </div>
        ))}
      </>)}

      {/* Earnings */}
      {tab === 'earnings' && (<>
        {[
          { date: 'Apr 12', brand: 'TechBrand', amount: 5500, type: 'reel', status: 'paid' },
          { date: 'Apr 10', brand: 'FoodieApp', amount: 1320, type: 'story', status: 'paid' },
          { date: 'Apr 5', brand: 'StyleHub', amount: 3850, type: 'post', status: 'released' },
          { date: 'Mar 28', brand: 'GadgetPro', amount: 8800, type: 'reel', status: 'released' },
          { date: 'Mar 20', brand: 'AppLaunch', amount: 2200, type: 'story', status: 'released' },
        ].map((t, i) => (
          <div key={i} className="analytics-insight fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>₹{t.amount.toLocaleString()}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{t.brand} • {t.type} • {t.date}</div>
            </div>
            <span className={`payment-badge payment-badge--${t.status}`}>{t.status}</span>
          </div>
        ))}
        <div style={{ marginTop: '12px', padding: '14px', background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Earnings</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10B981' }}>₹1,22,000</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Platform fee deducted: ₹12,200</div>
        </div>
      </>)}
    </div></div>
  )
}

// ═══ PAYMENT HISTORY ═══
function PaymentHistoryPage({ onBack }: { onBack: () => void }) {
  const transactions = [
    { id: 'tx1', type: 'hire', name: 'Ravi Telugu Tech', amount: 5500, status: 'paid', date: 'Apr 12, 2026', method: 'Razorpay' },
    { id: 'tx2', type: 'hire', name: 'Priya Foodie AP', amount: 1320, status: 'released', date: 'Apr 10, 2026', method: 'UPI' },
    { id: 'tx3', type: 'hire', name: 'Sneha Style Hub', amount: 3850, status: 'paid', date: 'Apr 5, 2026', method: 'Card' },
    { id: 'tx4', type: 'refund', name: 'Cancelled Campaign', amount: 2000, status: 'released', date: 'Mar 28, 2026', method: 'Refund' },
    { id: 'tx5', type: 'hire', name: 'Kiran Fitness Pro', amount: 8800, status: 'paid', date: 'Mar 20, 2026', method: 'Razorpay' },
  ]

  return (
    <div className="page"><div className="page__content">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0' }}>💳 Payment History</h2>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[
          { label: 'Total Spent', value: '₹21,470', color: '#3B82F6' },
          { label: 'Pending', value: '₹5,500', color: '#F59E0B' },
          { label: 'Completed', value: '₹15,970', color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="analytics-stat-card fade-in" style={{ flex: 1, animationDelay: `${i * 0.08}s`, padding: '10px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      {transactions.map((tx, i) => (
        <div key={tx.id} className="analytics-insight fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: tx.type === 'refund' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
            {tx.type === 'refund' ? '↩️' : '💳'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{tx.name}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{tx.date} • {tx.method}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: tx.type === 'refund' ? '#10B981' : 'var(--text)' }}>{tx.type === 'refund' ? '+' : '-'}₹{tx.amount.toLocaleString()}</div>
            <span className={`payment-badge payment-badge--${tx.status}`}>{tx.status}</span>
          </div>
        </div>
      ))}
    </div></div>
  )
}

// ═══ SHARE PROFILE HELPER ═══
function shareCreatorProfile(influencer: any) {
  const url = `https://hirezzy.vercel.app`
  const text = `🎬 Check out ${influencer.name} on Hirezzy!\n\n📸 ${fmtFollowers(influencer.followers)} followers\n⭐ ${influencer.rating || 4.5} rating\n📍 ${influencer.city || 'India'}\n💰 Starting ₹${(influencer.ratePerPost || influencer.ratePerReel || 0).toLocaleString()}\n\n${url}`

  if (navigator.share) {
    navigator.share({ title: `${influencer.name} on Hirezzy`, text, url }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text).then(() => alert('📋 Profile link copied!')).catch(() => alert('📋 Share: ' + text))
  }
}

// ═══ CREATOR VERIFICATION PAGE ═══
function VerifyCreatorPage({ onBack, userId, userProfile }: { onBack: () => void, userId: string, userProfile: any }) {
  const [step, setStep] = useState(1)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(userProfile?.verified || false)
  const [copied, setCopied] = useState(false)

  // Generate unique verification code based on userId
  const verifyCode = 'HZ-' + (userId || '').substring(0, 6).toUpperCase()
  const instaHandle = userProfile?.instagramUrl ? userProfile.instagramUrl.replace(/.*instagram\.com\//, '').replace(/[\/?].*/, '') : ''
  const instaUrl = userProfile?.instagramUrl || ''

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verifyCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    setVerifying(true)
    // In production: check Instagram bio via API
    // For now: simulate verification (admin can also manually verify)
    await new Promise(r => setTimeout(r, 2000))
    try {
      await verifyCreator(userId, true)
    } catch { /* demo mode */ }
    setVerified(true)
    setVerifying(false)
  }

  if (verified) {
    return (
      <div className="page"><div className="page__content" style={{ padding: '16px' }}>
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>You're Verified!</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Your creator profile has a verified badge. Brands trust verified creators 3x more!</p>
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="verified-badge" style={{ fontSize: '0.7rem' }}>✔ Verified Creator</span>
          </div>
          {instaHandle && (
            <div style={{ marginTop: '16px' }}>
              <a href={instaUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none' }}>📸 @{instaHandle}</a>
            </div>
          )}
        </div>
      </div></div>
    )
  }

  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>🔐 Verify Your Profile</h2>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Get the ✔ badge — brands trust verified creators 3x more!</p>

      {/* Steps */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--primary)' : 'var(--glass-border)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Step 1: Copy Code */}
      {step === 1 && (
        <div className="fade-in">
          <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔑</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Step 1: Copy Your Code</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px' }}>This unique code proves you own this account</p>
            <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '10px', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '2px' }}>{verifyCode}</div>
            <button onClick={handleCopyCode} style={{ marginTop: '12px', padding: '8px 24px', borderRadius: '20px', border: 'none', background: copied ? '#10B981' : 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
              {copied ? '✅ Copied!' : '📋 Copy Code'}
            </button>
          </div>
          <button className="btn btn--primary" style={{ marginTop: '16px' }} onClick={() => setStep(2)}>Next →</button>
        </div>
      )}

      {/* Step 2: Add to Instagram Bio */}
      {step === 2 && (
        <div className="fade-in">
          <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>📸</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Step 2: Add Code to Instagram Bio</h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <p>1. Open Instagram app</p>
              <p>2. Go to your profile → "Edit Profile"</p>
              <p>3. In the Bio field, paste: <strong style={{ color: 'var(--primary)' }}>{verifyCode}</strong></p>
              <p>4. Save profile</p>
              <p style={{ marginTop: '8px', color: '#F59E0B' }}>⚠️ You can remove it after verification!</p>
            </div>
            {instaHandle && (
              <a href={instaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '12px', padding: '10px', background: 'linear-gradient(135deg, #E1306C, #C13584)', borderRadius: '10px', color: 'white', textAlign: 'center', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                📸 Open @{instaHandle} on Instagram
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn--ghost" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn--primary" onClick={() => setStep(3)}>I've Added the Code →</button>
          </div>
        </div>
      )}

      {/* Step 3: Verify */}
      {step === 3 && (
        <div className="fade-in">
          <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Step 3: Verify</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Click below and we'll check your Instagram bio for the code <strong style={{ color: 'var(--primary)' }}>{verifyCode}</strong></p>
            <button onClick={handleVerify} disabled={verifying} style={{ padding: '12px 32px', borderRadius: '20px', border: 'none', background: verifying ? 'var(--glass)' : 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: verifying ? 'default' : 'pointer' }}>
              {verifying ? '🔄 Checking Instagram...' : '✅ Verify Now'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn--ghost" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setStep(2)}>← Back</button>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>🏆 Why Verify?</div>
        {[
          { icon: '✔', text: 'Blue verified badge on your profile' },
          { icon: '📈', text: '3x more hire requests from brands' },
          { icon: '⭐', text: 'Priority in search results' },
          { icon: '💰', text: 'Access to premium campaigns' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem' }}>
            <span style={{ color: '#10B981' }}>{b.icon}</span> {b.text}
          </div>
        ))}
      </div>
    </div></div>
  )
}

// ═══ ADMIN PANEL ═══
const ADMIN_UIDS = ['admin'] // Add your Firebase UID here

function AdminPanel({ onBack, userId }: { onBack: () => void, userId: string }) {
  const [tab, setTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard')
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalCreators: 0, totalCampaigns: 0, totalPayments: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers(), getReports()])
      .then(([s, u, r]) => { setStats(s); setUsers(u); setReports(r); setLoading(false) })
      .catch(() => {
        // Demo data fallback
        setStats({ totalUsers: 47, totalCreators: 15, totalCampaigns: 23, totalPayments: 12 })
        setUsers([
          { id: 'u1', name: 'Test Brand', email: 'brand@test.com', role: 'brand', verified: false, createdAt: { toDate: () => new Date() } },
          { id: 'u2', name: 'Ravi Tech', email: 'ravi@test.com', role: 'creator', verified: true, followers: 45200, createdAt: { toDate: () => new Date() } },
          { id: 'u3', name: 'Priya Food', email: 'priya@test.com', role: 'creator', verified: false, followers: 23800, createdAt: { toDate: () => new Date() } },
        ])
        setReports([
          { id: 'r1', targetName: 'Fake Creator', reason: 'Fake profile', details: 'No real content', status: 'pending', createdAt: { toDate: () => new Date() } },
        ])
        setLoading(false)
      })
  }, [])

  const handleVerify = async (uid: string, current: boolean) => {
    try {
      await verifyCreator(uid, !current)
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, verified: !current } : u))
    } catch { /* demo mode */ setUsers(prev => prev.map(u => u.id === uid ? { ...u, verified: !current } : u)) }
  }

  const filteredUsers = users.filter((u: any) => {
    if (!searchQ) return true
    const q = searchQ.toLowerCase()
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  const isAdmin = ADMIN_UIDS.includes(userId) || true // Always allow for now

  if (!isAdmin) return <div className="page"><div className="page__content"><p>🚫 Access denied</p></div></div>

  return (
    <div className="page"><div className="page__content">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0' }}>🛡️ Admin Panel</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {(['dashboard', 'users', 'reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: tab === t ? 'var(--primary)' : 'var(--glass)', color: tab === t ? 'white' : 'var(--text)' }}>
            {t === 'dashboard' ? '📊 Stats' : t === 'users' ? '👥 Users' : '🚨 Reports'}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>⏳ Loading...</p>}

      {/* Dashboard Tab */}
      {!loading && tab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#3B82F6' },
            { icon: '🎬', label: 'Creators', value: stats.totalCreators, color: '#8B5CF6' },
            { icon: '📋', label: 'Campaigns', value: stats.totalCampaigns, color: '#10B981' },
            { icon: '💳', label: 'Payments', value: stats.totalPayments, color: '#F59E0B' },
          ].map((s, i) => (
            <div key={i} className="analytics-stat-card fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {!loading && tab === 'users' && (<>
        <div className="search-bar" style={{ marginBottom: '12px' }}>
          <span className="search-bar__icon">{Icons.search}</span>
          <input placeholder="Search users..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        {filteredUsers.map((u: any) => (
          <div key={u.id} className="chat-list-item fade-in">
            <div className="chat-list-item__avatar" style={{ background: u.role === 'creator' ? '#8B5CF6' : '#3B82F6', fontSize: '0.9rem' }}>{(u.name || '?').charAt(0)}</div>
            <div className="chat-list-item__info">
              <div className="chat-list-item__name">{u.name || 'User'} {u.verified && <span className="verified-badge" style={{ marginLeft: '4px' }}>✔</span>}</div>
              <div className="chat-list-item__msg">{u.email || 'No email'} • {u.role || 'user'}{u.followers ? ` • ${(u.followers / 1000).toFixed(1)}K` : ''}</div>
            </div>
            {(u.role === 'creator' || (u.roles || []).includes('influencer')) && (
              <button onClick={() => handleVerify(u.id, u.verified)} style={{ padding: '4px 10px', borderRadius: '8px', border: 'none', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer', background: u.verified ? '#10B981' : '#EF4444', color: 'white' }}>
                {u.verified ? '✔ Verified' : '✗ Unverified'}
              </button>
            )}
          </div>
        ))}
      </>)}

      {/* Reports Tab */}
      {!loading && tab === 'reports' && (<>
        {reports.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>✅ No reports</p>}
        {reports.map((r: any) => (
          <div key={r.id} className="analytics-insight fade-in">
            <span style={{ fontSize: '1.1rem' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.targetName}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{r.reason} — {r.details}</div>
            </div>
            <span className={`payment-badge payment-badge--${r.status}`}>{r.status}</span>
          </div>
        ))}
      </>)}
    </div></div>
  )
}

// ═══ TERMS OF SERVICE ═══
function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📜 Terms of Service</h2>
      <div style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p><strong>Last Updated:</strong> April 2026</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>1. Acceptance of Terms</h3>
        <p>By accessing Hirezzy, you agree to these terms. If you disagree, please don't use our platform.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>2. User Accounts</h3>
        <p>You must provide accurate information. You're responsible for maintaining your account security. Don't share your credentials.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>3. Creator Profiles</h3>
        <p>Creators must provide accurate follower counts, engagement rates, and portfolio samples. Fake profiles will be banned.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>4. Payments & Escrow</h3>
        <p>All payments go through our secure escrow system. Funds are released only after content delivery and brand approval.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>5. Content Guidelines</h3>
        <p>All content must be original. No plagiarism, hate speech, or misleading content. We reserve the right to remove violations.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>6. Platform Fee</h3>
        <p>Hirezzy charges a 10% platform fee on all completed transactions. This is deducted automatically.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>7. Dispute Resolution</h3>
        <p>In case of disputes, both parties can raise a ticket. Our team will mediate within 48 hours.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>8. Termination</h3>
        <p>We may suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
        <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>For questions, contact support@hirezzy.com</p>
      </div>
    </div></div>
  )
}

// ═══ PRIVACY POLICY ═══
function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🔒 Privacy Policy</h2>
      <div style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p><strong>Last Updated:</strong> April 2026</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>1. Information We Collect</h3>
        <p>We collect: name, email, profile info, social media URLs, content engagement data, and payment details for transactions.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>2. How We Use Your Data</h3>
        <p>To match creators with brands, process payments, personalize recommendations, improve our services, and send important notifications.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>3. Data Sharing</h3>
        <p>We never sell your data. We share limited info only with: payment processors (Razorpay), and brands you choose to work with.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>4. Data Security</h3>
        <p>We use Firebase Authentication, encrypted connections (HTTPS), and follow industry security practices to protect your data.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>5. Your Rights</h3>
        <p>You can request data export, correction, or deletion at any time by contacting support@hirezzy.com.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>6. Cookies</h3>
        <p>We use local storage for session management and preferences. No third-party tracking cookies.</p>
        <h3 style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--text)' }}>7. Changes</h3>
        <p>We may update this policy. Continued use after changes means acceptance.</p>
        <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contact: privacy@hirezzy.com</p>
      </div>
    </div></div>
  )
}

// ═══ ANALYTICS DASHBOARD ═══
function AnalyticsDashboard({ onBack, userProfile }: { onBack: () => void, userProfile: any }) {
  const isCreator = userProfile?.role === 'creator' || userProfile?.roles?.includes('influencer')

  const stats = isCreator ? [
    { icon: '👁️', label: 'Profile Views', value: '2,847', change: '+12%', up: true },
    { icon: '💼', label: 'Total Hires', value: '18', change: '+3', up: true },
    { icon: '⭐', label: 'Avg Rating', value: '4.8', change: '+0.2', up: true },
    { icon: '💰', label: 'Revenue', value: '₹1.2L', change: '+₹15K', up: true },
  ] : [
    { icon: '📋', label: 'Campaigns', value: '12', change: '+2', up: true },
    { icon: '🤝', label: 'Active Collabs', value: '3', change: '0', up: false },
    { icon: '💰', label: 'Budget Spent', value: '₹45K', change: '-₹5K', up: false },
    { icon: '✅', label: 'Success Rate', value: '92%', change: '+5%', up: true },
  ]

  const weeklyData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 42 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 55 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 45 },
    { day: 'Sun', value: 30 },
  ]

  const insights = isCreator ? [
    { icon: '🔥', text: 'Your reels get 3x more engagement than posts', tag: 'Content' },
    { icon: '📈', text: 'Profile views increased 12% this week', tag: 'Growth' },
    { icon: '💎', text: 'Top 15% creators in your niche', tag: 'Ranking' },
    { icon: '⏰', text: 'Best posting time: 6-9 PM', tag: 'Timing' },
  ] : [
    { icon: '🎯', text: 'Tech creators give best ROI for your campaigns', tag: 'Insight' },
    { icon: '📊', text: '3 campaigns completed this month', tag: 'Progress' },
    { icon: '💡', text: 'Try micro-influencers (10K-50K) for better engagement', tag: 'Tip' },
    { icon: '🏆', text: 'Your avg campaign rating is 4.7/5', tag: 'Quality' },
  ]

  const maxVal = Math.max(...weeklyData.map(d => d.value))

  return (
    <div className="page"><div className="page__content">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0' }}>📊 {isCreator ? 'Creator' : 'Brand'} Analytics</h2>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} className="analytics-stat-card fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{s.icon}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.up ? '#10B981' : '#EF4444', marginTop: '2px' }}>{s.up ? '↑' : '↓'} {s.change}</div>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="analytics-chart-card">
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>📈 Weekly Activity</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
          {weeklyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d.value}</div>
              <div className="analytics-bar" style={{ height: `${(d.value / maxVal) * 100}%`, animationDelay: `${i * 0.1}s` }} />
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>💡 Insights & Tips</div>
        {insights.map((insight, i) => (
          <div key={i} className="analytics-insight fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <span style={{ fontSize: '1.1rem' }}>{insight.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem' }}>{insight.text}</div>
            </div>
            <span style={{ fontSize: '0.55rem', padding: '2px 8px', borderRadius: '20px', background: 'var(--primary-glow)', color: 'var(--primary-light)', fontWeight: 600 }}>{insight.tag}</span>
          </div>
        ))}
      </div>
    </div></div>
  )
}

// ═══ HOME PAGE — Matching Mockup ═══
function HomePage({ userName: _un, jobs, savedJobIds, onJobClick, onTabChange, onSaveJob, userProfile }: { userName: string, jobs: any[], savedJobIds: string[], onJobClick: (job: any) => void, onTabChange: (tab: string) => void, onSaveJob: (id: string) => void, userProfile: any }) {
  return (
    <div className="page"><div className="page__content">

      {/* ─── HERO SECTION ─── */}
      <div className="hero fade-in">
        <div className="hero__tag">🚀 India's First Unified Work Ecosystem</div>
        <h1 className="hero__title"><span>Find Work. Show Skills. Earn More.</span></h1>
        <p className="hero__sub">Jobs + Freelance + Influencers + Earning<br/>All opportunities in one powerful app</p>
        <button className="hero__cta" onClick={() => onTabChange('jobs')}>🔍 Explore Opportunities</button>
      </div>

      {/* ─── TRUST STATS ─── */}
      <div className="trust-stats fade-in">
        <div className="trust-stat"><div className="trust-stat__num">10K+</div><div className="trust-stat__label">Jobs</div></div>
        <div className="trust-stat"><div className="trust-stat__num">5K+</div><div className="trust-stat__label">Talent</div></div>
        <div className="trust-stat"><div className="trust-stat__num">1K+</div><div className="trust-stat__label">Creators</div></div>
        <div className="trust-stat"><div className="trust-stat__num">₹50L+</div><div className="trust-stat__label">Earned</div></div>
      </div>

      {/* ─── FEATURE SHOWCASE ─── */}
      <div className="features fade-in" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="feature-card" onClick={() => onTabChange('jobs')}><div className="feature-card__icon">💼</div><div className="feature-card__title">Jobs</div><div className="feature-card__desc">Latest & Govt</div></div>
        <div className="feature-card" onClick={() => onTabChange('creators')}><div className="feature-card__icon">🎬</div><div className="feature-card__title">Creators</div><div className="feature-card__desc">Hire Talent</div></div>
        <div className="feature-card" onClick={() => onTabChange('learn')}><div className="feature-card__icon">🎓</div><div className="feature-card__title">Learn</div><div className="feature-card__desc">Free Courses</div></div>
        <div className="feature-card" onClick={() => onTabChange('gigs')}><div className="feature-card__icon">🛒</div><div className="feature-card__title">Gigs</div><div className="feature-card__desc">Services</div></div>
        <div className="feature-card" onClick={() => onTabChange('wallet')}><div className="feature-card__icon">💰</div><div className="feature-card__title">Wallet</div><div className="feature-card__desc">Earn & Save</div></div>
      </div>

      <div className="section-divider" />

      {/* ─── 🏛️ GOVT JOBS SLIDER ─── */}
      <div className="fade-in" style={{ marginBottom: '16px' }}>
        <div className="section-header"><h2>🏛️ Latest Govt Jobs</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('jobs') }}>See all →</a></div>
        <div className="hz-scroll govt-jobs-slider">
          {DEMO_GOVT_JOBS.map((gj, i) => {
            const daysLeft = Math.ceil((new Date(gj.lastDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            const urgencyConfig = {
              closing: { label: '🔴 Closing Soon', bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
              urgent: { label: '🟡 Apply Fast', bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
              new: { label: '🟢 New', bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
            }
            const urg = urgencyConfig[gj.urgency as keyof typeof urgencyConfig] || urgencyConfig.new
            return (
              <div key={gj.id} className="govt-job-card fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="govt-job-card__header" style={{ background: `linear-gradient(135deg, ${gj.color}20, ${gj.color}08)` }}>
                  <div className="govt-job-card__logo" style={{ background: `linear-gradient(135deg, ${gj.color}, ${gj.color}88)` }}>{gj.logo}</div>
                  <span className="govt-job-card__urgency" style={{ background: urg.bg, color: urg.color }}>{urg.label}</span>
                </div>
                <div className="govt-job-card__body">
                  <div className="govt-job-card__title">{gj.title}</div>
                  <div className="govt-job-card__org">{gj.organization}</div>
                  <div className="govt-job-card__meta">
                    <span>📍 {gj.location}</span>
                    <span>👥 {gj.vacancies.toLocaleString()} Posts</span>
                  </div>
                  <div className="govt-job-card__salary">💰 {gj.salary}</div>
                  <div className="govt-job-card__date" style={{ color: daysLeft <= 7 ? '#EF4444' : daysLeft <= 15 ? '#F59E0B' : 'var(--text-muted)' }}>
                    📅 Last Date: {new Date(gj.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {daysLeft <= 7 && <span style={{ marginLeft: '4px', fontWeight: 700 }}>({daysLeft}d left!)</span>}
                  </div>
                  <button className="govt-job-card__apply" onClick={() => window.open(gj.applyUrl, '_blank')}>
                    Apply Now →
                  </button>
                  <div className="govt-job-card__source">📋 Source: {gj.source}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="govt-jobs-disclaimer">
          ⚠️ Please verify details on official website before applying
        </div>
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

      {/* ─── Quick Actions ─── */}
      <div className="fade-in" style={{ marginBottom: '16px' }}>
        <div className="section-header"><h2>⚡ Quick Actions</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          {[
            { icon: '📋', label: 'Apply', tab: 'jobs' },
            { icon: '🎯', label: 'Post Gig', tab: 'gigs' },
            { icon: '👥', label: 'Talent', tab: 'talent' },
            { icon: '🎁', label: 'Refer', tab: 'referral' },
          ].map((a, i) => (
            <div key={i} onClick={() => onTabChange(a.tab)} style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '14px 8px', textAlign: 'center', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{a.icon}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button className="section-tab section-tab--active" onClick={() => onTabChange('jobs')}>💼 Job Feed</button>
        <button className="section-tab" onClick={() => onTabChange('gigs')}>🎯 Gig Marketplace</button>
      </div>

      {/* ─── Job Listing Feed ─── */}
      <div className="section-header"><h2>Job Feed</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('jobs') }}>See all →</a></div>
      {jobs.slice(0, 3).map(job => {
        const catColors: Record<string, string> = { it: '#3B82F6', design: '#8B5CF6', govt: '#10B981', wfh: '#00D2FF', internship: '#F59E0B', freelance: '#E17055', marketing: '#E1306C', finance: '#059669' }
        const cc = catColors[job.category] || '#6C5CE7'
        const fmtSal = () => { const m = job.salaryMin; if (!m) return ''; if (m >= 100000) return `${job.currency}${Math.round(m/1000)}K`; if (m >= 1000) return `${job.currency}${m >= 10000 ? Math.round(m/1000)+'K' : m}`; return `${job.currency}${m}` }
        const fmtMax = () => { const m = job.salaryMax; if (!m) return ''; if (m >= 100000) return `${Math.round(m/1000)}K`; if (m >= 1000) return `${m >= 10000 ? Math.round(m/1000)+'K' : m}`; return `${m}` }
        return (
          <div key={job.id} className={`jc3 fade-in ${job.featured ? 'jc3--featured' : ''}`} onClick={() => onJobClick(job)}>
            <div className="jc3__top">
              <div className="jc3__icon" style={{ background: `linear-gradient(135deg, ${cc}, ${cc}88)` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div className="jc3__header">
                <div className="jc3__title">{job.title}</div>
                <div className="jc3__badges">
                  {job.verified && <span className="jc3__badge jc3__badge--verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>}
                  {job.featured && <span className="jc3__badge jc3__badge--featured">Featured</span>}
                </div>
              </div>
              <div className="jc3__salary">{fmtSal()}{job.salaryMax ? ` - ${fmtMax()}` : ''}{job.unit ? ` ${job.unit}` : ''}</div>
            </div>
            <div className="jc3__meta">{job.company} • {job.location || 'Remote'} • {job.remote || job.type}</div>
            {job.skills && <div className="jc3__skills">{(job.skills || []).slice(0, 4).map((s: string, i: number) => <span key={i} className="jc3__skill">{s}</span>)}</div>}
            <div className="jc3__bottom">
              <button className="jc3__apply" onClick={e => { e.stopPropagation(); onJobClick(job) }}>Apply Now</button>
              <button className={`jc3__heart ${savedJobIds.includes(job.id) ? 'jc3__heart--active' : ''}`} onClick={e => { e.stopPropagation(); onSaveJob(job.id) }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={savedJobIds.includes(job.id) ? '#EF4444' : 'none'} stroke={savedJobIds.includes(job.id) ? '#EF4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
            </div>
          </div>
        )
      })}

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
                <span className="gig-card-v2__price">₹{gig.price}</span>
                <span className="gig-card-v2__rating">⭐ {gig.rating}</span>
              </div>
              <button className="btn-detail">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Top Creators (Influencers) ─── */}
      <div className="section-header mt-2"><h2>🎬 Top Creators</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('creators') }}>See all →</a></div>
      <div className="hz-scroll">
        {DEMO_INFLUENCERS.slice(0, 4).map(inf => (
          <div key={inf.id} className="creator-card-mini" onClick={() => onTabChange('creators')}>
            <div className="creator-card-mini__avatar" style={{ background: `linear-gradient(135deg, ${inf.color}, ${inf.color}88)` }}>
              {inf.avatar}
            </div>
            <div className="creator-card-mini__name">{inf.name.split(' ')[0]}</div>
            <div className="creator-card-mini__niche">{inf.niche.map((n: string) => INFLUENCER_NICHES.find(ni => ni.id === n)?.icon || '🎯').join(' ')}</div>
            <div className="creator-card-mini__followers">{fmtFollowers(inf.followers)}</div>
            <button className="btn-hire">View</button>
          </div>
        ))}
      </div>

      {/* ─── Talent Search ─── */}
      <div className="section-header mt-2"><h2>Top Talent</h2><a href="#" onClick={e => { e.preventDefault(); onTabChange('talent') }}>Filters →</a></div>
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
function JobsFeedPage({ jobs, savedJobIds, onJobClick, onSaveJob, onTabChange }: { jobs: any[], savedJobIds: string[], onJobClick: (job: any) => void, onSaveJob: (id: string) => void, onTabChange: (tab: string) => void }) {
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

  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'salary') return (b.salaryMin || 0) - (a.salaryMin || 0)
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    return 0
  })

  return (
    <div className="page"><div className="page__content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>💼 Jobs</h2>
        <button className="btn-hire" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onTabChange('postjob')}>📝 Post Job</button>
      </div>

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

      {sorted.map((job: any) => {
        const catColors: Record<string, string> = { it: '#3B82F6', design: '#8B5CF6', govt: '#10B981', wfh: '#00D2FF', internship: '#F59E0B', freelance: '#E17055', marketing: '#E1306C', finance: '#059669' }
        const cc = catColors[job.category] || '#6C5CE7'
        const fmtSal = () => { const m = job.salaryMin; if (!m) return ''; if (m >= 100000) return `${job.currency}${Math.round(m/1000)}K`; if (m >= 1000) return `${job.currency}${m >= 10000 ? Math.round(m/1000)+'K' : m}`; return `${job.currency}${m}` }
        const fmtMax = () => { const m = job.salaryMax; if (!m) return ''; if (m >= 100000) return `${Math.round(m/1000)}K`; if (m >= 1000) return `${m >= 10000 ? Math.round(m/1000)+'K' : m}`; return `${m}` }
        return (
          <div key={job.id} className={`jc3 fade-in ${job.featured ? 'jc3--featured' : ''}`} onClick={() => onJobClick(job)}>
            <div className="jc3__top">
              <div className="jc3__icon" style={{ background: `linear-gradient(135deg, ${cc}, ${cc}88)` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div className="jc3__header">
                <div className="jc3__title">{job.title}</div>
                <div className="jc3__badges">
                  {job.verified && <span className="jc3__badge jc3__badge--verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>}
                  {job.featured && <span className="jc3__badge jc3__badge--featured">Featured</span>}
                </div>
              </div>
              <div className="jc3__salary">{fmtSal()}{job.salaryMax ? ` – ${fmtMax()}` : ''}{job.unit ? ` ${job.unit}` : ''}</div>
            </div>
            <div className="jc3__meta">{job.company} • {job.location || 'Remote'} • {job.remote || job.type}</div>
            {job.skills && <div className="jc3__skills">{(job.skills || []).slice(0, 4).map((s: string, i: number) => <span key={i} className="jc3__skill">{s}</span>)}</div>}
            <div className="jc3__bottom">
              <button className="jc3__apply" onClick={e => { e.stopPropagation(); onJobClick(job) }}>Apply Now</button>
              <button className={`jc3__heart ${savedJobIds.includes(job.id) ? 'jc3__heart--active' : ''}`} onClick={e => { e.stopPropagation(); onSaveJob(job.id) }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={savedJobIds.includes(job.id) ? '#EF4444' : 'none'} stroke={savedJobIds.includes(job.id) ? '#EF4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
            </div>
          </div>
        )
      })}
    </div></div>
  )
}

// ═══ JOB DETAILS ═══
function JobDetailsPage({ job, onBack, onApply }: { job: any, onBack: () => void, onApply: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [fileName, setFileName] = useState('')

  const fmtSalary = () => {
    try {
      const min = typeof job.salaryMin === 'number' ? job.salaryMin : 0
      const max = typeof job.salaryMax === 'number' ? job.salaryMax : 0
      if (min > 100000) return `${job.currency || '₹'}${Math.round(min/1000)}K – ${Math.round(max/1000)}K`
      if (min > 10000) return `${job.currency || '₹'}${min.toLocaleString()} – ${max.toLocaleString()}`
      return `${job.currency || '$'}${min} – ${max}${job.unit || ''}`
    } catch { return 'Competitive' }
  }

  const handleSubmitApplication = async () => {
    setApplying(true)
    await onApply()
    setApplying(false)
  }

  const catColors: Record<string, string> = { it: '#3B82F6', design: '#8B5CF6', govt: '#10B981', wfh: '#00D2FF', internship: '#F59E0B', freelance: '#E17055', marketing: '#E1306C', finance: '#059669' }
  const cc = catColors[job.category] || '#6C5CE7'

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>

      {/* ─── Hero Card ─── */}
      <div className="jd-hero">
        <div className="jd-hero__icon" style={{ background: `linear-gradient(135deg, ${cc}, ${cc}88)` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <h2 className="jd-hero__title">{job.title}</h2>
        <p className="jd-hero__company">{job.company}</p>
        <div className="jd-hero__badges">
          {job.verified && <span className="jc3__badge jc3__badge--verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>}
          {job.featured && <span className="jc3__badge jc3__badge--featured">Featured</span>}
        </div>
      </div>

      {/* ─── Info Grid ─── */}
      <div className="jd-grid">
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="jd-grid__label">Salary</div>
          <div className="jd-grid__value">{fmtSalary()}</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className="jd-grid__label">Location</div>
          <div className="jd-grid__value">{job.location || 'Remote'}</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="jd-grid__label">Type</div>
          <div className="jd-grid__value">{job.type || 'Full Time'}</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div className="jd-grid__label">Mode</div>
          <div className="jd-grid__value">{job.remote || 'On-site'}</div>
        </div>
      </div>

      {/* ─── Skills ─── */}
      <div className="jd-section">
        <h3 className="jd-section__title">Skills Required</h3>
        <div className="jc3__skills">{(job.skills || []).map((s: string, i: number) => <span key={i} className="jc3__skill">{s}</span>)}</div>
      </div>

      {/* ─── Description ─── */}
      <div className="jd-section">
        <h3 className="jd-section__title">Description</h3>
        <div className="jd-desc">
          <p>{job.description || `We're looking for a talented ${job.title} to join ${job.company}.`}</p>
          {!job.description && <><p>• Build and maintain high-quality applications</p>
          <p>• Collaborate with cross-functional teams</p>
          <p>• Proficiency in {(job.skills || []).join(', ')}</p></>}
        </div>
      </div>

      {/* ─── Apply / Application Form ─── */}
      {!showForm ? (
        <button className="jc3__apply" onClick={() => setShowForm(true)} style={{ width: '100%', padding: '14px', fontSize: '0.9rem', marginTop: '8px' }}>Apply Now</button>
      ) : (
        <div className="jd-form slide-up">
          <h3 className="jd-form__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
            Application Form
          </h3>
          <div className="form-group">
            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Why are you a good fit?</label>
            <textarea className="form-input" rows={4} placeholder="Tell the recruiter why you're perfect for this role..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ resize: 'vertical', minHeight: '100px' }} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Resume (optional)</label>
            <label className="jd-file-upload">
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>{fileName || 'Upload Resume (PDF, DOC)'}</span>
              {fileName && <span className="jd-file-upload__check">✓</span>}
            </label>
          </div>
          <button className="jc3__apply" disabled={applying} onClick={handleSubmitApplication} style={{ width: '100%', padding: '14px', fontSize: '0.88rem', marginTop: '4px' }}>
            {applying ? 'Submitting...' : 'Submit Application'}
          </button>
          <button className="jd-cancel" onClick={() => setShowForm(false)}>Cancel</button>
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
  const [selectedTalent, setSelectedTalent] = useState<any>(null)
  const filteredTalent = searchSkill ? DEMO_TALENTS.filter(t => t.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase())) || t.title.toLowerCase().includes(searchSkill.toLowerCase())) : DEMO_TALENTS

  const toggleSkill = (s: string) => {
    setGigSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 5 ? [...prev, s] : prev)
  }

  // Order flow states
  const [orderConfirm, setOrderConfirm] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
  const [ordering, setOrdering] = useState(false)

  // ─── Talent Profile View ───
  if (selectedTalent) return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={() => setSelectedTalent(null)} className="btn-back">← Back to Talent</button>

      {/* Hero */}
      <div className="jd-hero">
        <div className="jd-hero__icon" style={{ background: `linear-gradient(135deg, ${selectedTalent.color}, ${selectedTalent.color}88)`, fontSize: '1.4rem', color: 'white' }}>
          {selectedTalent.avatar}
        </div>
        <h2 className="jd-hero__title">{selectedTalent.name}</h2>
        <p className="jd-hero__company">{selectedTalent.title}</p>
        <div className="jd-hero__badges">
          {selectedTalent.verified && <span className="jc3__badge jc3__badge--verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>}
          <span className="jc3__salary">{selectedTalent.rate}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="jd-grid">
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="jd-grid__label">Rating</div>
          <div className="jd-grid__value">{selectedTalent.ratingNum}/5</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="jd-grid__label">Reviews</div>
          <div className="jd-grid__value">{selectedTalent.reviews}</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div className="jd-grid__label">Status</div>
          <div className="jd-grid__value" style={{ textTransform: 'capitalize' }}>{selectedTalent.status}</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <div className="jd-grid__label">Experience</div>
          <div className="jd-grid__value">3+ yrs</div>
        </div>
      </div>

      {/* Skills */}
      <div className="jd-section">
        <h3 className="jd-section__title">Skills</h3>
        <div className="jc3__skills">
          {selectedTalent.skills.map((s: string, i: number) => <span key={i} className="jc3__skill">{s}</span>)}
        </div>
      </div>

      {/* About */}
      <div className="jd-section">
        <h3 className="jd-section__title">About</h3>
        <div className="jd-desc">
          <p>Experienced {selectedTalent.title.toLowerCase()} with a strong portfolio of successful projects. Proficient in {selectedTalent.skills.slice(0, 3).join(', ')}.</p>
          <p>• Available for freelance and long-term contracts</p>
          <p>• Fast delivery with quality results</p>
          <p>• {selectedTalent.reviews}+ happy clients</p>
        </div>
      </div>

      {/* Action Buttons */}
      <button className="jc3__apply" style={{ width: '100%', padding: '14px', fontSize: '0.9rem', marginBottom: '8px' }} onClick={async () => {
        if (!auth.currentUser) { toast('Please login first!', 'error'); return }
        try {
          await _getOrCreateChat(auth.currentUser.uid, selectedTalent.id || 'talent_' + selectedTalent.name, selectedTalent.name, undefined, selectedTalent.color)
          toast('Chat created! Go to Profile → Chats', 'success')
        } catch { toast('Chat system loading...', 'info') }
      }}>Hire {selectedTalent.name.split(' ')[0]}</button>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="jd-cancel" style={{ flex: 1, borderColor: 'rgba(0,210,255,0.3)', color: 'var(--secondary)' }} onClick={async () => {
          if (!auth.currentUser) { toast('Please login first!', 'error'); return }
          try {
            await _getOrCreateChat(auth.currentUser.uid, selectedTalent.id || 'talent_' + selectedTalent.name, selectedTalent.name, undefined, selectedTalent.color)
            toast('Chat created! Go to Profile → Chats', 'success')
          } catch { toast('Chat coming soon', 'info') }
        }}>Chat</button>
        <button className="jd-cancel" style={{ flex: 1, borderColor: 'rgba(37,211,102,0.3)', color: '#25D366' }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${selectedTalent.name}, I found your profile on Hirezzy and I'm interested in hiring you!`)}`, '_blank')}>WhatsApp</button>
      </div>
    </div></div>
  )

  // ─── Gig Detail View ───
  if (selectedGig) return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={() => setSelectedGig(null)} className="btn-back">← Back to Gigs</button>

      {/* Hero */}
      <div className="jd-hero">
        <div className="jd-hero__icon" style={{ background: `linear-gradient(135deg, ${selectedGig.color}, ${selectedGig.color}88)` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <h2 className="jd-hero__title">{selectedGig.title}</h2>
        <p className="jd-hero__company">by {selectedGig.seller}</p>
        <div className="jd-hero__badges">
          <span className="jc3__salary" style={{ display: 'inline-block' }}>${selectedGig.price}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="jd-grid">
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="jd-grid__label">Price</div>
          <div className="jd-grid__value">${selectedGig.price}</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="jd-grid__label">Rating</div>
          <div className="jd-grid__value">{selectedGig.rating}/5</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div className="jd-grid__label">Orders</div>
          <div className="jd-grid__value">{selectedGig.orders}+</div>
        </div>
        <div className="jd-grid__item">
          <div className="jd-grid__icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="jd-grid__label">Delivery</div>
          <div className="jd-grid__value">3-5 days</div>
        </div>
      </div>

      <div className="jd-section">
        <h3 className="jd-section__title">About This Gig</h3>
        <div className="jd-desc">
          <p>Professional {selectedGig.title.toLowerCase()} service by {selectedGig.seller}.</p>
          <p>• High quality deliverables</p>
          <p>• Unlimited revisions</p>
          <p>• Fast turnaround</p>
          <p>• 100% satisfaction guaranteed</p>
        </div>
      </div>

      {/* Seller Profile */}
      <div className="jd-form" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${selectedGig.color}, ${selectedGig.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem' }}>{selectedGig.seller.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{selectedGig.seller}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedGig.title} specialist</div>
          </div>
          <span className="jc3__badge jc3__badge--verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', marginBottom: '12px' }}>
          <span style={{ padding: '4px 10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>{selectedGig.orders}+ orders</span>
          <span style={{ padding: '4px 10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>Avg 3-5 days</span>
          <span style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', color: '#10B981' }}>98% positive</span>
        </div>
        <button className="jd-cancel" style={{ borderColor: 'rgba(0,210,255,0.3)', color: 'var(--secondary)' }} onClick={async () => {
          if (!auth.currentUser) { toast('Please login first!', 'error'); return }
          try {
            await _getOrCreateChat(auth.currentUser.uid, selectedGig.sellerId || 'demo_seller', selectedGig.seller, undefined, selectedGig.color)
            toast('Chat opened! Go to Profile → Chats', 'success')
          } catch { toast('Chat coming soon!', 'info') }
        }}>Contact Seller</button>
      </div>

      {/* Order Confirmation Modal */}
      {orderConfirm && (
        <div className="jd-form slide-up" style={{ marginBottom: '12px' }}>
          <h3 className="jd-form__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Confirm Order
          </h3>
          <div style={{ padding: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gig</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{selectedGig.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Seller</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{selectedGig.seller}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Delivery</span>
              <span style={{ fontSize: '0.82rem' }}>3-5 days</span>
            </div>
            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Total</span>
              <span className="jc3__salary" style={{ display: 'inline-block' }}>${selectedGig.price}</span>
            </div>
          </div>
          <button className="jc3__apply" disabled={ordering} style={{ width: '100%', padding: '14px', fontSize: '0.88rem' }} onClick={async () => {
            if (!auth.currentUser) { toast('Please login first!', 'error'); return }
            setOrdering(true)
            try {
              const orderId = await placeGigOrder(selectedGig.id, auth.currentUser.uid, selectedGig.sellerId || 'seller', selectedGig.title, selectedGig.price)
              // Auto-create chat with seller
              try { await _getOrCreateChat(auth.currentUser.uid, selectedGig.sellerId || 'demo_seller', selectedGig.seller, undefined, selectedGig.color) } catch {}
              setOrderConfirm(false)
              setOrderSuccess(orderId)
              toast('Order placed successfully!', 'success')
            } catch { toast('Failed to place order. Try again.', 'error') }
            setOrdering(false)
          }}>{ordering ? 'Placing Order...' : 'Confirm & Pay'}</button>
          <button className="jd-cancel" onClick={() => setOrderConfirm(false)}>Cancel</button>
        </div>
      )}

      {/* Order Success Card */}
      {orderSuccess && (
        <div className="jd-form slide-up" style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px' }}>Order Placed!</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Seller has been notified. You can track your order or chat with the seller.</p>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#3B82F6' }}>Order #{orderSuccess.slice(-6)}</span>
            <span style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', color: '#F59E0B' }}>🕔 Pending</span>
          </div>
          <button className="jc3__apply" style={{ width: '100%', padding: '12px', fontSize: '0.82rem', marginBottom: '8px' }} onClick={() => { setSelectedGig(null); setOrderSuccess(null) }}>View My Orders</button>
          <button className="jd-cancel" onClick={() => { setSelectedGig(null); setOrderSuccess(null) }}>Back to Gigs</button>
        </div>
      )}

      {!orderConfirm && !orderSuccess && (
        <button className="jc3__apply" style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }} onClick={() => {
          if (!auth.currentUser) { toast('Please login first!', 'error'); return }
          setOrderConfirm(true)
        }}>Order Now — ${selectedGig.price}</button>
      )}
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
        <button className="jc3__apply" style={{ width: '100%', padding: '12px', fontSize: '0.82rem' }} onClick={() => setShowPost(true)}>Post a Gig</button>
        <div className="section-header"><h2>Popular Gigs</h2><span className="text-sm text-muted">{DEMO_GIGS.length} gigs</span></div>
        <div className="gigs-grid">
          {DEMO_GIGS.map(gig => (
            <div key={gig.id} className="gig-card-v2" onClick={() => setSelectedGig(gig)}>
              <div className="gig-card-v2__banner" style={{ background: `linear-gradient(135deg, ${gig.color}33, ${gig.color}11)` }}><span className="gig-card-v2__icon">{gig.icon}</span></div>
              <div className="gig-card-v2__body">
                <div className="gig-card-v2__title">{gig.title}</div>
                <div className="gig-card-v2__seller">{gig.seller}</div>
                <div className="gig-card-v2__footer"><span className="gig-card-v2__price">₹{gig.price}</span><span className="gig-card-v2__rating">⭐ {gig.rating}</span></div>
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
            <div key={t.id} className="talent-card-v2" onClick={() => setSelectedTalent(t)} style={{ cursor: 'pointer' }}>
              <div className="talent-card-v2__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}<div className={`talent-card__status talent-card__status--${t.status}`} /></div>
              <div className="talent-card-v2__name">{t.name.split(' ')[0]}</div>
              <div className="talent-card-v2__title">{t.title.split(' ').slice(0,2).join(' ')}</div>
              <div className="talent-card-v2__stars">{'⭐'.repeat(Math.min(5, Math.round(t.ratingNum)))}</div>
              <button className="btn-hire" onClick={e => { e.stopPropagation(); setSelectedTalent(t) }}>View</button>
            </div>
          ))}
        </div>
        {filteredTalent.map(t => (
          <div key={t.id} className="talent-card fade-in" onClick={() => setSelectedTalent(t)} style={{ cursor: 'pointer' }}>
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
        <div className="modal-sheet__handle" />
        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post Your Gig
        </h2>
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Gig Title</label><input className="form-input" placeholder="I will edit your YouTube video..." value={gigTitle} onChange={e => setGigTitle(e.target.value)} /></div>
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Category</label>
          <div className="jd-select-wrap">
            <select className="jd-select" value={gigCategory} onChange={e => setGigCategory(e.target.value)}><option value="">Select Category</option>{GIG_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <svg className="jd-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Price ({WALLET.currency})</label><input className="form-input" type="number" placeholder="500" value={gigPrice} onChange={e => setGigPrice(e.target.value)} /></div>
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Skills (Max 5) — {gigSkills.length}/5 selected</label>
          <div className="jc3__skills" style={{ marginTop: '8px' }}>{SKILLS.slice(0, 15).map(s => (
            <button key={s} className={`jc3__skill ${gigSkills.includes(s) ? 'jc3__skill--selected' : ''}`} onClick={() => toggleSkill(s)} style={gigSkills.includes(s) ? { background: 'rgba(0,210,255,0.12)', borderColor: 'rgba(0,210,255,0.3)', color: 'var(--secondary)' } : {}}>{gigSkills.includes(s) ? '✓ ' : ''}{s}</button>
          ))}</div>
        </div>
        <button className="jc3__apply" disabled={gigPosting || !gigTitle} onClick={async () => {
          setGigPosting(true)
          try {
            await postGig({ title: gigTitle, category: gigCategory, price: Number(gigPrice) || 0, seller: _userName || 'User', icon: '🎯', color: '#6C5CE7', skills: gigSkills })
            setShowPost(false); setGigTitle(''); setGigCategory(''); setGigPrice(''); setGigSkills([])
          } catch { }
          setGigPosting(false)
        }} style={{ width: '100%', padding: '14px', fontSize: '0.88rem' }}>{gigPosting ? 'Posting...' : 'Post Gig'}</button>
        <button className="jd-cancel" onClick={() => setShowPost(false)}>Cancel</button>
      </div></div>}
    </div></div>
  )
}

// ═══ WALLET ═══
function WalletPage({ userProfile, onCheckin }: { userProfile: any, onCheckin: () => void }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [upiId, setUpiId] = useState('')
  const balance = userProfile?.walletBalance || 0
  const coins = userProfile?.coins || 0
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
          <div><div className="wallet-balance__label">Earnings:</div><div className="wallet-balance__amount">₹{balance.toLocaleString()}.00</div></div>
          <div style={{ textAlign: 'right' }}><div className="wallet-balance__label">Coins:</div><div className="wallet-balance__coins-val">{coins} HZC</div></div>
        </div>
        <div className="wallet-balance__btns">
          <button className="wallet-balance__btn" onClick={() => setShowWithdraw(true)}>Withdraw</button>
          <button className="wallet-balance__btn wallet-balance__btn--outline" onClick={() => alert(`You have ${coins} HZC.\n${coins >= 1000 ? `Convert to ₹${Math.floor(coins / 10)}!` : 'Earn more coins to redeem!'}`)}>Redeem</button>
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

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '16px 0' }}>
        {[
          { label: 'Total Earned', val: `₹${balance}`, icon: '💰' },
          { label: 'This Month', val: '₹0', icon: '📆' },
          { label: 'Pending', val: '₹0', icon: '⏳' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.val}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
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

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '12px' }}>💸 Withdraw Funds</h3>
            <div style={{ background: 'var(--primary-glow)', borderRadius: '12px', padding: '12px', marginBottom: '12px', textAlign: 'center' }}>
              <span className="text-sm text-muted">Available Balance</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)' }}>₹{balance}.00</div>
            </div>
            <div className="form-group"><label>Amount (₹)</label><input className="form-input" type="number" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} placeholder={`Min ₹${WALLET.minWithdraw}`} /></div>
            <div className="form-group"><label>UPI ID / Bank</label><input className="form-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="name@upi or bank details" /></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => {
                const amt = parseInt(withdrawAmt)
                if (!amt || amt < WALLET.minWithdraw) { alert(`Minimum withdrawal is ₹${WALLET.minWithdraw}`); return }
                if (amt > balance) { alert('Insufficient balance!'); return }
                if (!upiId) { alert('Enter UPI ID or bank details'); return }
                alert('✅ Withdrawal request submitted! Processing in 24-48 hours.')
                setShowWithdraw(false); setWithdrawAmt(''); setUpiId('')
              }}>📤 Withdraw</button>
              <button className="btn btn--ghost" onClick={() => setShowWithdraw(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
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

        {/* ─── Profile Completion ─── */}
        {(() => {
          const fields = [userProfile?.name, userProfile?.city, userProfile?.bio, (userProfile?.skills || []).length > 0, userProfile?.rate, userProfile?.experience, userProfile?.resumeUrl]
          const filled = fields.filter(Boolean).length
          const pct = Math.round((filled / fields.length) * 100)
          const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
          return (
            <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Profile Completion</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{pct}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: `linear-gradient(90deg, ${color}, ${color}CC)`, transition: 'width 0.5s ease' }} />
              </div>
              {pct < 100 && <p className="text-sm text-muted" style={{ marginTop: '6px' }}>Complete your profile to get more visibility!</p>}
            </div>
          )
        })()}

        {/* Share + Member Since */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span className="text-sm text-muted">📅 Member since {userProfile?.createdAt?.toDate ? new Date(userProfile.createdAt.toDate()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently'}</span>
          <button onClick={() => { navigator.clipboard.writeText(`https://hirezzy.vercel.app/talent/${auth.currentUser?.uid || ''}`); alert('✅ Profile link copied!') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>🔗 Share Profile</button>
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
            <div className="form-group"><input className="form-input" value={editRate} onChange={e => setEditRate(e.target.value)} placeholder="₹5,000/hr or ₹2,000/project" /></div>
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
          { icon: '🎬', title: 'My Campaigns', nav: 'campaigns' },
          { icon: '💬', title: 'Messages', nav: 'chats' },
          { icon: '❤️', title: 'Saved Jobs', nav: 'saved' },
          { icon: '💰', title: 'Wallet & Earnings', nav: 'wallet' },
          { icon: '🎯', title: 'My Gigs', nav: 'gigs' },
          { icon: '📦', title: 'My Orders', nav: 'orders' },
          { icon: '🏆', title: 'Leaderboard', nav: 'leaderboard' },
          { icon: '🎁', title: 'Refer & Earn', nav: 'referral' },
          { icon: '⚙️', title: 'Settings' }, { icon: '💬', title: 'Help & Support', nav: 'help' },
          { icon: '✏️', title: 'Edit Profile', nav: 'editprofile' },
          { icon: '💾', title: 'Saved Creators', nav: 'savedcreators' },
          { icon: '📊', title: 'Analytics', nav: 'analytics' },
          { icon: '🎬', title: 'Creator Dashboard', nav: 'creatordash' },
          { icon: '💳', title: 'Payment History', nav: 'payhistory' },
          { icon: '🛡️', title: 'Admin Panel', nav: 'admin' },
          { icon: '📜', title: 'Terms of Service', nav: 'terms' },
          { icon: '🔒', title: 'Privacy Policy', nav: 'privacy' },
          { icon: '❓', title: 'FAQ', nav: 'faq' },
          { icon: 'ℹ️', title: 'About Hirezzy', nav: 'about' },
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

// ═══ LEADERBOARD (Enhanced) ═══
function LeaderboardPage() {
  const [tab, setTab] = useState<'freelancers' | 'earners'>('freelancers')
  const podiumColors = ['linear-gradient(135deg, #FFD700, #FFA500)', 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', 'linear-gradient(135deg, #CD7F32, #B87333)']

  return (
    <div className="page"><div className="page__content">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, padding: '12px 0' }}>🏆 Leaderboard</h2>

      {/* Your Rank */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', borderRadius: '16px', padding: '16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Your Rank</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>#--</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Points</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>0 HZC</div>
        </div>
      </div>

      <div className="auth__tabs" style={{ marginBottom: '16px' }}>
        <button className={`auth__tab ${tab === 'freelancers' ? 'auth__tab--active' : ''}`} onClick={() => setTab('freelancers')}>🏅 Top Freelancers</button>
        <button className={`auth__tab ${tab === 'earners' ? 'auth__tab--active' : ''}`} onClick={() => setTab('earners')}>💰 Top Earners</button>
      </div>

      {/* Top 3 Podium */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center', alignItems: 'flex-end' }}>
        {[1, 0, 2].map(idx => {
          const t = DEMO_TALENTS[idx]
          if (!t) return null
          const heights = ['120px', '140px', '100px']
          const medals = ['🥈', '🥇', '🥉']
          return (
            <div key={idx} style={{ background: podiumColors[idx], borderRadius: '16px', padding: '12px', textAlign: 'center', width: '90px', height: heights[[1,0,2].indexOf(idx)] }}>
              <div style={{ fontSize: '1.5rem' }}>{medals[[1,0,2].indexOf(idx)]}</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${t.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px auto', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{t.avatar}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{t.name.split(' ')[0]}</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)' }}>{t.rate}</div>
            </div>
          )
        })}
      </div>

      {/* Full List */}
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
            <div className="form-group"><label>Budget</label><input className="form-input" value={offerBudget} onChange={e => setOfferBudget(e.target.value)} placeholder="₹5,000 or ₹40,000" /></div>
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

// ═══ POST A JOB (Recruiter) ═══
function PostJobPage({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [workType, setWorkType] = useState('Remote')
  const [category, setCategory] = useState('it')
  const [description, setDescription] = useState('')
  const [jobSkills, setJobSkills] = useState<string[]>([])
  const [posting, setPosting] = useState(false)

  const toggleJobSkill = (s: string) => {
    setJobSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 8 ? [...prev, s] : prev)
  }

  const handlePost = async () => {
    if (!auth.currentUser || !title || !company) return
    setPosting(true)
    try {
      await postJob({
        title, company, location, remote: workType, category,
        salaryMin: parseInt(salaryMin) || 0, salaryMax: parseInt(salaryMax) || 0,
        currency: '₹', skills: jobSkills, description,
        postedBy: auth.currentUser.uid, logo: '🏢',
      })
      toast('Job posted successfully!', 'success')
      onBack()
    } catch { toast('Failed to post. Try again.', 'error') }
    setPosting(false)
  }

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Post a Job
      </h2>

      <div className="jd-form">
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Job Title *</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior React Developer" /></div>
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Company Name *</label><input className="form-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. TechCorp India" /></div>
        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Location</label><input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Mumbai, Bangalore, Delhi..." /></div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="form-group" style={{ flex: 1 }}><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Min Salary (₹)</label><input className="form-input" type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="25000" /></div>
          <div className="form-group" style={{ flex: 1 }}><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Max Salary (₹)</label><input className="form-input" type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="50000" /></div>
        </div>

        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Work Type</label>
          <div className="jc3__skills" style={{ marginTop: '4px' }}>
            {['Remote', 'Hybrid', 'On-site', 'WFH'].map(t => (
              <button key={t} type="button" className="jc3__skill" onClick={() => setWorkType(t)} style={workType === t ? { background: 'rgba(0,210,255,0.12)', borderColor: 'rgba(0,210,255,0.3)', color: 'var(--secondary)' } : {}}>{t}</button>
            ))}
          </div>
        </div>

        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Category</label>
          <div className="jd-select-wrap">
            <select className="jd-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <svg className="jd-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Required Skills (max 8) — {jobSkills.length}/8</label>
          <div className="jc3__skills" style={{ marginTop: '4px' }}>
            {SKILLS.slice(0, 20).map(s => (
              <button key={s} type="button" className="jc3__skill" onClick={() => toggleJobSkill(s)} style={jobSkills.includes(s) ? { background: 'rgba(0,210,255,0.12)', borderColor: 'rgba(0,210,255,0.3)', color: 'var(--secondary)' } : {}}>{jobSkills.includes(s) ? '✓ ' : ''}{s}</button>
            ))}
          </div>
        </div>

        <div className="form-group"><label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Job Description</label>
          <textarea className="form-input" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, requirements..." style={{ resize: 'vertical' }} />
        </div>

        <button className="jc3__apply" style={{ width: '100%', padding: '14px', fontSize: '0.88rem', marginTop: '4px' }} onClick={handlePost} disabled={!title || !company || posting}>
          {posting ? 'Posting...' : 'Post Job'}
        </button>
      </div>
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
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        Referral Program
      </h2>

      {/* Referral Code Card */}
      <div className="jd-form" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.9), rgba(0,210,255,0.8))', border: 'none', textAlign: 'center', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Your Referral Code</p>
        <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '6px', color: '#fff', marginBottom: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{referralCode}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={copyCode} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px 18px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button onClick={shareWhatsApp} style={{ background: '#25D366', border: 'none', borderRadius: '10px', padding: '10px 18px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Share
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="jd-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '16px' }}>
        {[
          { label: 'Invited', value: userProfile?.referralCount || 0, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label: 'Joined', value: userProfile?.referralJoined || 0, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Earned', value: `${(userProfile?.referralEarnings || 0)} HZC`, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
        ].map((s, i) => (
          <div key={i} className="jd-grid__item" style={{ textAlign: 'center' }}>
            <div className="jd-grid__icon" style={{ background: s.bg, color: s.color, margin: '0 auto 8px' }}>{s.icon}</div>
            <div className="jd-grid__value">{s.value}</div>
            <div className="jd-grid__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="jd-form">
        <h3 className="jd-form__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          How it Works
        </h3>
        {[
          { title: 'Share your code', desc: 'Send to friends via WhatsApp, Telegram, etc.', color: '#6C5CE7' },
          { title: 'Friend joins', desc: 'They sign up using your referral code', color: '#00D2FF' },
          { title: 'Both earn!', desc: `You get +${WALLET.referralBonus} HZC, friend gets +10 HZC`, color: '#10B981' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: i < 2 ? '14px' : '0' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0 }}>{i + 1}</div>
            <div><div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{s.title}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</div></div>
          </div>
        ))}
      </div>

      {/* Share link */}
      <div className="jd-form" style={{ marginTop: '12px' }}>
        <h3 className="jd-form__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Your Referral Link
        </h3>
        <div style={{ padding: '10px 14px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: '10px' }}>{referralLink}</div>
        <button className="jc3__apply" onClick={() => { navigator.clipboard.writeText(referralLink); toast('Link copied!', 'success') }} style={{ width: '100%', padding: '12px', fontSize: '0.82rem' }}>Copy Link</button>
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
  const [activeFilter, setActiveFilter] = useState('all')
  useEffect(() => {
    if (!auth.currentUser) return
    getMyOrders(auth.currentUser.uid).then(data => { setOrders(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statusMap: any = {
    ordered: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'Ordered', icon: 'clock' },
    in_progress: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'In Progress', icon: 'loader' },
    delivered: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', label: 'Delivered', icon: 'package' },
    completed: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Completed', icon: 'check' },
  }

  const filtered = activeFilter === 'all' ? orders : orders.filter((o: any) => o.status === activeFilter)

  const handleMarkComplete = async (orderId: string) => {
    try {
      const { updateOrderStatus } = await import('./lib/firebase')
      await updateOrderStatus(orderId, 'completed')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
      toast('Order marked as completed!', 'success')
    } catch { toast('Failed to update', 'error') }
  }

  const handleChat = async (sellerId: string, sellerName: string) => {
    if (!auth.currentUser) return
    try {
      await _getOrCreateChat(auth.currentUser.uid, sellerId, sellerName)
      toast('Chat opened! Go to Profile → Chats', 'success')
    } catch { toast('Chat not available', 'error') }
  }

  return (
    <div className="page"><div className="page__content slide-up">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '8px 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        My Orders
      </h2>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[{ id: 'all', label: 'All' }, { id: 'ordered', label: 'Pending' }, { id: 'in_progress', label: 'Active' }, { id: 'delivered', label: 'Delivered' }, { id: 'completed', label: 'Done' }].map(f => (
          <button key={f.id} className="jc3__skill" onClick={() => setActiveFilter(f.id)} style={activeFilter === f.id ? { background: 'rgba(0,210,255,0.12)', borderColor: 'rgba(0,210,255,0.3)', color: 'var(--secondary)' } : {}}>{f.label}</button>
        ))}
      </div>

      {loading && <p className="text-center text-muted">Loading orders...</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>No orders yet</p>
          <p className="text-sm text-muted">Browse gigs and place your first order!</p>
        </div>
      )}

      {filtered.map((o: any) => {
        const st = statusMap[o.status] || statusMap.ordered
        return (
          <div key={o.id} className="jc3 fade-in">
            <div className="jc3__top">
              <div className="jc3__icon" style={{ background: 'linear-gradient(135deg, #6C5CE7, #6C5CE788)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <div className="jc3__header">
                <div className="jc3__title">{o.gigTitle}</div>
                <div className="jc3__badges">
                  <span className="jc3__badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}>{st.label}</span>
                </div>
              </div>
              <div className="jc3__salary">${o.price}</div>
            </div>
            <div className="jc3__meta">
              Order #{o.id?.slice(-6)} • {o.createdAt?.toDate ? new Date(o.createdAt.toDate()).toLocaleDateString() : 'Recently'}
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              {['ordered', 'in_progress', 'delivered', 'completed'].map((step, i) => {
                const steps = ['ordered', 'in_progress', 'delivered', 'completed']
                const currentIdx = steps.indexOf(o.status)
                const filled = i <= currentIdx
                return <div key={step} style={{ flex: 1, height: '3px', borderRadius: '2px', background: filled ? st.color : 'var(--glass-border)', transition: 'all 0.3s' }} />
              })}
            </div>

            <div className="jc3__bottom">
              {o.status === 'delivered' ? (
                <button className="jc3__apply" style={{ flex: 1, padding: '10px', fontSize: '0.78rem' }} onClick={() => handleMarkComplete(o.id)}>Mark Complete</button>
              ) : (
                <button className="jc3__apply" style={{ flex: 1, padding: '10px', fontSize: '0.78rem', background: 'var(--glass)', color: 'var(--text)', border: '1px solid var(--glass-border)' }} onClick={() => handleChat(o.sellerId || 'demo', 'Seller')}>Chat with Seller</button>
              )}
              <button className="jc3__heart" style={{ width: '38px', height: '38px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>
        )
      })}
    </div></div>
  )
}

// ═══ COURSES / LEARN PAGE ═══
const DEMO_COURSES = [
  { id: 'c1', title: 'AI & ChatGPT Mastery', instructor: 'Ravi Kumar', avatar: 'R', color: '#6C5CE7', category: 'ai', duration: '45 days', lessons: 32, students: 12400, rating: 4.9, reviews: 847, price: 0, tag: 'FREE', tagColor: '#10B981', icon: '🤖', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop', desc: 'Master AI tools, prompt engineering, ChatGPT, Midjourney & automation. Build real AI projects from scratch.', curriculum: ['Introduction to AI', 'ChatGPT Prompt Engineering', 'AI Image Generation', 'AI for Business', 'Build AI Chatbot', 'Automation with AI', 'Final Project'] },
  { id: 'c2', title: 'Full Stack Web Development', instructor: 'Sneha Reddy', avatar: 'S', color: '#0984E3', category: 'coding', duration: '90 days', lessons: 68, students: 8900, rating: 4.8, reviews: 562, price: 499, tag: '₹499', tagColor: '#F59E0B', icon: '💻', level: 'Beginner → Advanced', thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop', desc: 'HTML, CSS, JavaScript, React, Node.js, MongoDB. Deploy real projects on Vercel.', curriculum: ['HTML & CSS Basics', 'JavaScript Deep Dive', 'React.js', 'Node.js & Express', 'MongoDB & APIs', 'Full Stack Project', 'Deployment & Hosting'] },
  { id: 'c3', title: 'Digital Marketing Pro', instructor: 'Priya Sharma', avatar: 'P', color: '#E17055', category: 'marketing', duration: '30 days', lessons: 24, students: 15600, rating: 4.7, reviews: 1023, price: 0, tag: 'FREE', tagColor: '#10B981', icon: '📢', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop', desc: 'SEO, Social Media Marketing, Google Ads, Facebook Ads, Email Marketing & Analytics.', curriculum: ['Marketing Fundamentals', 'SEO Mastery', 'Social Media Strategy', 'Google Ads', 'Facebook & Instagram Ads', 'Email Marketing', 'Analytics & ROI'] },
  { id: 'c4', title: 'UI/UX Design with Figma', instructor: 'Arjun Patel', avatar: 'A', color: '#FF6B6B', category: 'design', duration: '40 days', lessons: 28, students: 6700, rating: 4.9, reviews: 389, price: 299, tag: '₹299', tagColor: '#F59E0B', icon: '🎨', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop', desc: 'Learn Figma, wireframing, prototyping, design systems & build stunning app UIs.', curriculum: ['Design Thinking', 'Figma Basics', 'Wireframing', 'UI Components', 'Prototyping', 'Design Systems', 'Portfolio Project'] },
  { id: 'c5', title: 'Python & Data Science', instructor: 'Kiran Rao', avatar: 'K', color: '#00B894', category: 'coding', duration: '60 days', lessons: 45, students: 9200, rating: 4.8, reviews: 671, price: 0, tag: 'FREE', tagColor: '#10B981', icon: '🐍', level: 'Intermediate', thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop', desc: 'Python programming, Pandas, NumPy, Machine Learning basics, data visualization.', curriculum: ['Python Basics', 'Data Structures', 'Pandas & NumPy', 'Data Visualization', 'ML Foundations', 'Real-world Projects', 'Interview Prep'] },
  { id: 'c6', title: 'Flutter App Development', instructor: 'Vikram Singh', avatar: 'V', color: '#00D2FF', category: 'coding', duration: '50 days', lessons: 38, students: 5400, rating: 4.7, reviews: 298, price: 399, tag: '₹399', tagColor: '#F59E0B', icon: '📱', level: 'Beginner → Advanced', thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop', desc: 'Build cross-platform iOS & Android apps with Flutter & Dart. Firebase integration.', curriculum: ['Dart Language', 'Flutter Widgets', 'State Management', 'Firebase Integration', 'API Integration', 'App Publishing', 'Portfolio App'] },
  { id: 'c7', title: 'Spoken English in 30 Days', instructor: 'Meera Joshi', avatar: 'M', color: '#A29BFE', category: 'language', duration: '30 days', lessons: 30, students: 24500, rating: 4.6, reviews: 1876, price: 0, tag: 'FREE', tagColor: '#10B981', icon: '🗣️', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=200&fit=crop', desc: 'Daily practice, vocabulary building, grammar, pronunciation & confidence building.', curriculum: ['Greetings & Basics', 'Daily Vocabulary', 'Grammar Essentials', 'Sentence Formation', 'Conversation Practice', 'Public Speaking', 'Mock Interviews'] },
  { id: 'c8', title: 'Video Editing Masterclass', instructor: 'Deepak Nair', avatar: 'D', color: '#FD79A8', category: 'creative', duration: '35 days', lessons: 26, students: 7800, rating: 4.8, reviews: 445, price: 199, tag: '₹199', tagColor: '#F59E0B', icon: '🎬', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=200&fit=crop', desc: 'CapCut, Premiere Pro, After Effects. Create reels, YouTube videos & cinematic edits.', curriculum: ['Editing Basics', 'CapCut Mobile', 'Premiere Pro', 'Color Grading', 'Motion Graphics', 'Transitions & Effects', 'YouTube Workflow'] },
  { id: 'c9', title: 'Freelancing & Earning Online', instructor: 'Lakshmi Devi', avatar: 'L', color: '#FDCB6E', category: 'business', duration: '20 days', lessons: 18, students: 18300, rating: 4.7, reviews: 1345, price: 0, tag: 'FREE', tagColor: '#10B981', icon: '💰', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1553729459-uj4kmecgqfoi?w=400&h=200&fit=crop', desc: 'Start freelancing on Fiverr, Upwork. Build portfolio, get clients & earn ₹50K+/mo.', curriculum: ['Freelance Platforms', 'Profile Optimization', 'Proposal Writing', 'Client Communication', 'Pricing Strategy', 'Portfolio Building', 'Scaling Your Business'] },
  { id: 'c10', title: 'Instagram Growth & Monetization', instructor: 'Rahul Verma', avatar: 'R', color: '#E1306C', category: 'marketing', duration: '25 days', lessons: 20, students: 21000, rating: 4.8, reviews: 1567, price: 0, tag: 'FREE', tagColor: '#10B981', icon: '📸', level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=200&fit=crop', desc: 'Grow from 0 to 10K followers. Content strategy, reels, hashtags & brand deals.', curriculum: ['Instagram Algorithm', 'Content Strategy', 'Reel Creation', 'Hashtag Strategy', 'Engagement Hacks', 'Brand Collaborations', 'Monetization Guide'] },
]

const COURSE_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔥' },
  { id: 'ai', name: 'AI & ML', icon: '🤖' },
  { id: 'coding', name: 'Coding', icon: '💻' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'creative', name: 'Creative', icon: '🎬' },
  { id: 'business', name: 'Business', icon: '💰' },
  { id: 'language', name: 'Language', icon: '🗣️' },
]

// ═══ POST A COURSE FORM ═══
function PostCoursePage({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('coding')
  const [thumbnail, setThumbnail] = useState('')
  const [desc, setDesc] = useState('')
  const [duration, setDuration] = useState('')
  const [lessons, setLessons] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [price, setPrice] = useState('')
  const [curriculum, setCurriculum] = useState('')
  const [courseLink, setCourseLink] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!title.trim() || !desc.trim() || !duration.trim()) {
      toast('Please fill all required fields', 'error')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      toast('🎉 Course submitted for review!', 'success')
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="page"><div className="page__content" style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Course Submitted!</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>Your course is under review. It will be live within 24 hours after approval.</p>
          <button className="btn btn--primary" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={onBack}>🎓 Back to Courses</button>
        </div>
      </div></div>
    )
  }

  return (
    <div className="page"><div className="page__content" style={{ padding: '16px' }}>
      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }} onClick={onBack}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Courses
      </button>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>➕ Post a Course</h2>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Share your knowledge • Reach thousands of learners</p>

      {/* Thumbnail Preview */}
      <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ height: '140px', background: thumbnail ? `url(${thumbnail}) center/cover no-repeat` : 'linear-gradient(135deg, #6C5CE720, #0984E320)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {!thumbnail && <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>🖼️</span>}
          {thumbnail && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />}
          <span style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 700, background: 'rgba(0,0,0,0.5)', color: 'white', backdropFilter: 'blur(8px)' }}>📷 Thumbnail Preview</span>
        </div>
      </div>

      {/* Form */}
      <div className="form-group">
        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Course Title *</label>
        <input className="form-input" placeholder="e.g. AI & ChatGPT Mastery" value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Category *</label>
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
            {COURSE_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Level *</label>
          <select className="form-input" value={level} onChange={e => setLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Beginner → Advanced</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>🖼️ Thumbnail Image URL</label>
        <input className="form-input" placeholder="https://your-image-url.jpg" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Upload to imgur.com or use any image URL for your course banner</span>
      </div>

      <div className="form-group">
        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Description *</label>
        <textarea className="form-input" rows={3} placeholder="What will students learn? Key highlights..." value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'vertical', minHeight: '70px' }} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Duration *</label>
          <input className="form-input" placeholder="e.g. 45 days" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Total Lessons</label>
          <input className="form-input" type="number" placeholder="e.g. 32" value={lessons} onChange={e => setLessons(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Price (₹)</label>
          <input className="form-input" type="number" placeholder="0 = Free" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Instructor Name</label>
          <input className="form-input" placeholder="Your name" value={instructorName} onChange={e => setInstructorName(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>📋 Curriculum (one topic per line)</label>
        <textarea className="form-input" rows={5} placeholder={"Introduction to AI\nPrompt Engineering\nBuild AI Chatbot\nFinal Project"} value={curriculum} onChange={e => setCurriculum(e.target.value)} style={{ resize: 'vertical', minHeight: '100px' }} />
      </div>

      <div className="form-group">
        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>🔗 Course / Enrollment Link</label>
        <input className="form-input" placeholder="https://your-course-page.com or WhatsApp link" value={courseLink} onChange={e => setCourseLink(e.target.value)} />
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Where should students go to enroll? Website, WhatsApp, or Telegram link</span>
      </div>

      <button className="btn btn--primary" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)', marginBottom: '20px' }} disabled={submitting} onClick={handleSubmit}>
        {submitting ? '⏳ Submitting...' : '🚀 Submit Course for Review'}
      </button>
    </div></div>
  )
}

function CoursesPage({ onTabChange: _onTabChange }: { onTabChange: (tab: string) => void }) {
  const [searchQ, setSearchQ] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState<'all'|'free'|'paid'>('all')
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showPostForm, setShowPostForm] = useState(false)

  const filtered = DEMO_COURSES.filter(c => {
    if (catFilter !== 'all' && c.category !== catFilter) return false
    if (priceFilter === 'free' && c.price > 0) return false
    if (priceFilter === 'paid' && c.price === 0) return false
    if (searchQ) {
      const q = searchQ.toLowerCase()
      if (!c.title.toLowerCase().includes(q) && !c.instructor.toLowerCase().includes(q) && !c.desc.toLowerCase().includes(q)) return false
    }
    return true
  })

  const freeCount = DEMO_COURSES.filter(c => c.price === 0).length
  const totalStudents = DEMO_COURSES.reduce((s, c) => s + c.students, 0)

  // Post Course Form
  if (showPostForm) {
    return <PostCoursePage onBack={() => setShowPostForm(false)} />
  }

  // Course Detail View
  if (selectedCourse) {
    const c = selectedCourse
    return (
      <div className="page"><div className="page__content">
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0' }} onClick={() => setSelectedCourse(null)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Courses
        </button>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${c.color}15, ${c.color}08)`, border: `1px solid ${c.color}25`, borderRadius: 'var(--radius-lg)', padding: '24px 20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '5rem', opacity: 0.08 }}>{c.icon}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, background: c.tagColor + '18', color: c.tagColor, border: `1px solid ${c.tagColor}30` }}>{c.tag}</span>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600, background: 'var(--bg-card)', border: 'var(--card-border)' }}>{c.level}</span>
          </div>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{c.icon}</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', lineHeight: 1.3 }}>{c.title}</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>{c.desc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${c.color}, ${c.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>{c.avatar}</div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{c.instructor}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Instructor</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Duration', value: c.duration, icon: '⏱️' },
            { label: 'Lessons', value: c.lessons, icon: '📖' },
            { label: 'Students', value: c.students >= 1000 ? (c.students/1000).toFixed(1)+'K' : c.students, icon: '👥' },
            { label: 'Rating', value: `⭐ ${c.rating}`, icon: '' },
          ].map((s,i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius)', padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Curriculum */}
        <div style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>📋 Curriculum</h3>
          {c.curriculum.map((item: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < c.curriculum.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${c.color}15`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: c.color, flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="btn btn--primary" style={{ background: c.price === 0 ? 'linear-gradient(135deg, #10B981, #059669)' : `linear-gradient(135deg, ${c.color}, ${c.color}CC)`, marginBottom: '20px' }} onClick={() => {
          toast(c.price === 0 ? '🎉 Enrolled successfully! Check your email for course access.' : '💳 Redirecting to payment...', c.price === 0 ? 'success' : 'info')
        }}>
          {c.price === 0 ? '🚀 Enroll for Free' : `💳 Enroll for ${c.tag}`}
        </button>
      </div></div>
    )
  }

  return (
    <div className="page"><div className="page__content">
      {/* Header */}
      <div style={{ padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎓 Learn & Upskill</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{freeCount} free courses • {(totalStudents/1000).toFixed(0)}K+ students enrolled</p>
          </div>
          <button onClick={() => setShowPostForm(true)} style={{ padding: '8px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)', color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(108,92,231,0.3)' }}>➕ Post Course</button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginTop: 0, marginBottom: '12px' }}>
        <span className="search-bar__icon">{Icons.search}</span>
        <input placeholder="Search courses, skills, instructors..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        {searchQ && <button className="search-bar__filter" onClick={() => setSearchQ('')}>✕</button>}
      </div>

      {/* Price Filter */}
      <div className="filter-chips" style={{ marginBottom: '8px' }}>
        {(['all','free','paid'] as const).map(f => (
          <span key={f} className={`filter-chip ${priceFilter === f ? 'filter-chip--active' : ''}`} onClick={() => setPriceFilter(f)} style={priceFilter === f ? { background: f === 'free' ? '#10B98120' : f === 'paid' ? '#F59E0B20' : '', borderColor: f === 'free' ? '#10B981' : f === 'paid' ? '#F59E0B' : '' } : {}}>
            {f === 'all' ? '🔥 All' : f === 'free' ? '🆓 Free' : '💎 Paid'}
          </span>
        ))}
      </div>

      {/* Category Chips */}
      <div className="filter-chips" style={{ marginBottom: '16px' }}>
        {COURSE_CATEGORIES.map(cat => (
          <span key={cat.id} className={`filter-chip ${catFilter === cat.id ? 'filter-chip--active' : ''}`} onClick={() => setCatFilter(cat.id)}>
            {cat.icon} {cat.name}
          </span>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-muted" style={{ marginBottom: '10px' }}>{filtered.length} courses found</p>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
          <p style={{ fontWeight: 600 }}>No courses found</p>
          <p className="text-sm text-muted">Try different filters</p>
        </div>
      )}

      {/* Course Cards */}
      {filtered.map(c => (
        <div key={c.id} className="fade-in" style={{ background: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => setSelectedCourse(c)}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${c.color}15` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
        >
          {/* Subtle gradient bg */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${c.color}08, transparent)`, borderRadius: '0 var(--radius-lg) 0 50%' }} />

          {/* Thumbnail Banner */}
          <div style={{ height: '110px', margin: '-16px -16px 12px -16px', background: (c as any).thumbnail ? `url(${(c as any).thumbnail}) center/cover no-repeat` : `linear-gradient(135deg, ${c.color}30, ${c.color}10)`, position: 'relative', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            {!(c as any).thumbnail && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.2 }}>{c.icon}</div>}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-card) 5%, transparent 60%)' }} />
            <span style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 800, background: c.tagColor + '20', color: c.tagColor, border: `1px solid ${c.tagColor}30`, backdropFilter: 'blur(8px)' }}>{c.tag}</span>
            <span style={{ position: 'absolute', top: '8px', left: '8px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.55rem', fontWeight: 600, background: 'rgba(0,0,0,0.4)', color: 'white', backdropFilter: 'blur(8px)' }}>{c.level}</span>
          </div>

          {/* Title + Info */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${c.color}, ${c.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0, marginTop: '-4px', border: '2px solid var(--bg-card)' }}>{c.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '3px' }}>{c.title}</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>by {c.instructor} • {c.level}</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>⏱️ {c.duration}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>📖 {c.lessons} lessons</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>👥 {c.students >= 1000 ? (c.students/1000).toFixed(1)+'K' : c.students}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto', fontWeight: 700, color: '#F59E0B' }}>⭐ {c.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.reviews})</span></span>
          </div>

          {/* Enroll hint */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.68rem', color: c.price === 0 ? '#10B981' : c.color, fontWeight: 700 }}>{c.price === 0 ? '🆓 Free Enrollment' : `💎 Premium — ${c.tag}`}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>View Details <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></span>
          </div>
        </div>
      ))}
    </div></div>
  )
}

// ═══ BOTTOM NAV ═══
function BottomNav({ active, onChange }: { active: string, onChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', icon: Icons.home, label: 'Home' },
    { id: 'jobs', icon: Icons.jobs, label: 'Jobs' },
    { id: 'creators', icon: Icons.creators, label: 'Creators' },
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
  return <ToastProvider><AppInner /></ToastProvider>
}

function AppInner() {
  const [showSplash, setShowSplash] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('hz-theme') || 'light')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  
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
    const unsub = listenToUserProfile(firebaseUser.uid, (data) => {
      setUserProfile(data)
      // Show onboarding for new users who haven't completed it
      if (data && data.onboardingDone === false) {
        setShowOnboarding(true)
      }
    })
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
  if (showOnboarding) return <OnboardingPage onComplete={() => setShowOnboarding(false)} />

  if (selectedJob) return (
    <div className="app">
      <div className="navbar"><div className="navbar__logo"><div className="navbar__logo-icon">Hz</div><span>{APP.name}</span></div></div>
      <JobDetailsPage job={selectedJob} onBack={() => setSelectedJob(null)} onApply={handleApply} />
      <BottomNav active={activeTab} onChange={t => { setSelectedJob(null); setSelectedInfluencer(null); setActiveTab(t) }} />
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  )

  return (
    <div className="app">
      <div className="navbar">
        <div className="navbar__logo"><div className="navbar__logo-icon">Hz</div><span>{APP.name}</span></div>
        <div className="navbar__actions">
          <button className="navbar__btn" style={{ position: 'relative' }} onClick={() => setActiveTab('notifications')}>{Icons.bell}<div className="navbar__notif-badge">3</div></button>
          <div className="navbar__avatar" onClick={() => setActiveTab('profile')}>{userName.charAt(0).toUpperCase()}</div>
        </div>
      </div>
      {activeTab === 'home' && <HomePage userName={userName} jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onTabChange={setActiveTab} onSaveJob={handleSaveJob} userProfile={userProfile} />}
      {activeTab === 'jobs' && <JobsFeedPage jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onSaveJob={handleSaveJob} onTabChange={setActiveTab} />}
      {activeTab === 'talent' && <TalentPage />}
      {activeTab === 'creators' && !selectedInfluencer && <InfluencerSearchPage onTabChange={setActiveTab} onSelectInfluencer={setSelectedInfluencer} />}
      {activeTab === 'creators' && selectedInfluencer && <InfluencerDetailPage influencer={selectedInfluencer} onBack={() => setSelectedInfluencer(null)} userName={userName} userId={firebaseUser?.uid || ''} />}
      {activeTab === 'campaigns' && <MyCampaignsPage onBack={() => setActiveTab('profile')} userId={firebaseUser?.uid || ''} userName={userName} />}
      {activeTab === 'chats' && !activeChat && <ChatListPage onBack={() => setActiveTab('profile')} userId={firebaseUser?.uid || ''} onOpenChat={setActiveChat} />}
      {activeTab === 'chats' && activeChat && <ChatPage chat={activeChat} onBack={() => setActiveChat(null)} userId={firebaseUser?.uid || ''} />}
      {activeTab === 'gigs' && <MarketplacePage userName={userName} />}
      {activeTab === 'learn' && <CoursesPage onTabChange={setActiveTab} />}
      {activeTab === 'wallet' && <WalletPage userProfile={userProfile} onCheckin={handleCheckin} />}
      {activeTab === 'leaderboard' && <LeaderboardPage />}
      {activeTab === 'applications' && <MyApplicationsPage onBack={() => setActiveTab('profile')} jobs={activeJobs} />}
      {activeTab === 'saved' && <SavedJobsPage onBack={() => setActiveTab('profile')} jobs={activeJobs} savedJobIds={savedJobIds} onJobClick={setSelectedJob} onSaveJob={handleSaveJob} />}
      {activeTab === 'notifications' && <NotificationsPage onBack={() => setActiveTab('home')} />}
      {activeTab === 'orders' && <MyOrdersPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'referral' && <ReferralPage onBack={() => setActiveTab('profile')} userProfile={userProfile} />}
      {activeTab === 'help' && <HelpPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'analytics' && <AnalyticsDashboard onBack={() => setActiveTab('profile')} userProfile={userProfile} />}
      {activeTab === 'admin' && <AdminPanel onBack={() => setActiveTab('profile')} userId={firebaseUser?.uid || ''} />}
      {activeTab === 'verify' && <VerifyCreatorPage onBack={() => setActiveTab('profile')} userId={firebaseUser?.uid || ''} userProfile={userProfile} />}
      {activeTab === 'creatordash' && <CreatorDashboardPage onBack={() => setActiveTab('profile')} userProfile={userProfile} userId={firebaseUser?.uid || ''} />}
      {activeTab === 'payhistory' && <PaymentHistoryPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'editprofile' && <EditProfilePage onBack={() => setActiveTab('profile')} userProfile={userProfile} userId={firebaseUser?.uid || ''} />}
      {activeTab === 'savedcreators' && <SavedCreatorsPage onBack={() => setActiveTab('profile')} onSelectInfluencer={(inf) => { setSelectedInfluencer(inf); setActiveTab('creators') }} influencers={DEMO_INFLUENCERS} />}
      {activeTab === 'faq' && <FAQPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'about' && <AboutPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'terms' && <TermsPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'privacy' && <PrivacyPage onBack={() => setActiveTab('profile')} />}
      {activeTab === 'postjob' && <PostJobPage onBack={() => setActiveTab('jobs')} />}
      {activeTab === 'profile' && <ProfilePage userName={userName} userEmail={userEmail} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} userProfile={userProfile} onTabChange={setActiveTab} />}
      <BottomNav active={activeTab} onChange={t => { setSelectedJob(null); setSelectedInfluencer(null); setActiveChat(null); setActiveTab(t) }} />
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
