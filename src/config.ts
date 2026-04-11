// ═══════════════════════════════════════════════════════════════
// 🔥 HIREZZY — App Configuration
// Edit this ONE file to change app-wide settings
// ═══════════════════════════════════════════════════════════════

export const APP = {
  name: 'Hirezzy',
  tagline: 'Hiring Made Easy',
  description: 'Find your dream job — Govt, Private, IT, Remote, Freelance & more. All in one app.',
  version: '1.0.0',
  website: 'hirezzy.com',
  contact: {
    email: 'support@hirezzy.com',
    whatsapp: '916299950842',
    phone: '+91 62999 50842',
  },
  company: {
    name: 'Sofviz Technologies',
    website: 'sofviz.live',
  },
}

// ═══ JOB CATEGORIES ═══
export const CATEGORIES = [
  { id: 'govt', name: 'Government', icon: '🏛️', color: '#6C5CE7' },
  { id: 'private', name: 'Private', icon: '🏢', color: '#00D2FF' },
  { id: 'it', name: 'IT & Tech', icon: '💻', color: '#0984E3' },
  { id: 'remote', name: 'Remote', icon: '🌐', color: '#00B894' },
  { id: 'wfh', name: 'Work From Home', icon: '🏠', color: '#FDCB6E' },
  { id: 'freelance', name: 'Freelance', icon: '💼', color: '#E17055' },
  { id: 'internship', name: 'Internships', icon: '🎓', color: '#A29BFE' },
  { id: 'parttime', name: 'Part-Time', icon: '⏰', color: '#FD79A8' },
  { id: 'freshers', name: 'Freshers', icon: '🌟', color: '#55EFC4' },
  { id: 'design', name: 'Design & Creative', icon: '🎨', color: '#FF7675' },
  { id: 'nonit', name: 'Non-IT', icon: '🏥', color: '#74B9FF' },
  { id: 'local', name: 'Local / City', icon: '📍', color: '#FAB1A0' },
]

// ═══ JOB TYPES ═══
export const JOB_TYPES = [
  { id: 'fulltime', name: 'Full Time' },
  { id: 'parttime', name: 'Part Time' },
  { id: 'contract', name: 'Contract' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'internship', name: 'Internship' },
]

// ═══ EXPERIENCE LEVELS ═══
export const EXP_LEVELS = [
  { id: 'fresher', name: 'Fresher (0-1 yr)' },
  { id: 'junior', name: 'Junior (1-3 yr)' },
  { id: 'mid', name: 'Mid (3-5 yr)' },
  { id: 'senior', name: 'Senior (5-10 yr)' },
  { id: 'lead', name: 'Lead (10+ yr)' },
]

// ═══ APPLICATION STATUS ═══
export const APP_STATUS = {
  applied: { label: 'Applied', color: '#6C5CE7', icon: '📝' },
  viewed: { label: 'Viewed', color: '#00D2FF', icon: '👀' },
  shortlisted: { label: 'Shortlisted', color: '#00E676', icon: '⭐' },
  rejected: { label: 'Rejected', color: '#FF5252', icon: '❌' },
  selected: { label: 'Selected', color: '#FFD600', icon: '🎉' },
}

// ═══ FIREBASE CONFIG ═══
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDTMvrxPAEnURFbl-NFuq5OUIKGPE3J34Q",
  authDomain: "hirezzy-14975.firebaseapp.com",
  projectId: "hirezzy-14975",
  storageBucket: "hirezzy-14975.firebasestorage.app",
  messagingSenderId: "491069427091",
  appId: "1:491069427091:web:7f5b7236d624532d13ec66",
  measurementId: "G-8S27LQVMC2",
}

// ═══ POPULAR SKILLS ═══
export const SKILLS = [
  'Video Editing', 'Graphic Design', 'Web Development', 'App Development',
  'Content Writing', 'SEO', 'Digital Marketing', 'Social Media',
  'Data Entry', 'Translation', 'Photography', 'UI/UX Design',
  'Python', 'JavaScript', 'React', 'Flutter', 'Node.js', 'Java',
  'WordPress', 'Shopify', 'Logo Design', 'Animation', '3D Modeling',
  'Voice Over', 'Music Production', 'Accounting', 'Virtual Assistant',
  'Customer Support', 'Sales', 'Teaching', 'Tutoring', 'Cooking',
  'Fitness Training', 'Yoga', 'Driving', 'Delivery', 'Plumbing',
  'Electrical Work', 'Carpentry', 'Painting', 'Tailoring',
]

// ═══ GIG CATEGORIES (Marketplace) ═══
export const GIG_CATEGORIES = [
  { id: 'video', name: 'Video & Animation', icon: '🎬', color: '#E17055' },
  { id: 'design', name: 'Graphics & Design', icon: '🎨', color: '#6C5CE7' },
  { id: 'writing', name: 'Writing & Content', icon: '✍️', color: '#00B894' },
  { id: 'digital', name: 'Digital Marketing', icon: '📢', color: '#0984E3' },
  { id: 'tech', name: 'Programming & Tech', icon: '💻', color: '#00D2FF' },
  { id: 'business', name: 'Business & Finance', icon: '📊', color: '#FDCB6E' },
  { id: 'music', name: 'Music & Audio', icon: '🎵', color: '#A29BFE' },
  { id: 'lifestyle', name: 'Lifestyle & Services', icon: '🌟', color: '#FD79A8' },
]

// ═══ WALLET / EARNING CONFIG ═══
export const WALLET = {
  currency: '₹',
  minWithdraw: 100,
  referralBonus: 25,
  dailyCheckinCoins: 5,
  gigCommission: 10,  // 10% platform fee
  featuredProfilePrice: 99, // per month
  verifiedBadgePrice: 49,
}
