// ═══════════════════════════════════════════════════════════════
// 🔥 HIREZZY — App Configuration
// Edit this ONE file to change app-wide settings
// ═══════════════════════════════════════════════════════════════

export const APP = {
  name: 'Hirezzy',
  tagline: 'Find Work. Show Skills. Earn More.',
  description: 'Jobs + Freelance + Influencers + Earning — India\'s first unified work ecosystem.',
  version: '2.0.0',
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

// ═══ USER ROLES (Multi-select) ═══
export const USER_ROLES = [
  { id: 'job_seeker', name: 'Find Jobs', icon: '💼', desc: 'Search & apply to jobs', color: '#6C5CE7' },
  { id: 'freelancer', name: 'Freelance', icon: '🧑‍💻', desc: 'Offer skills & services', color: '#00D2FF' },
  { id: 'influencer', name: 'Creator / Influencer', icon: '🎬', desc: 'Get brand deals & promotions', color: '#E17055' },
  { id: 'recruiter', name: 'Hire Talent', icon: '🏢', desc: 'Post jobs & find people', color: '#00B894' },
]

// ═══ INFLUENCER NICHES ═══
export const INFLUENCER_NICHES = [
  { id: 'tech', name: 'Tech & Gadgets', icon: '💻', color: '#0984E3' },
  { id: 'fashion', name: 'Fashion & Style', icon: '👗', color: '#E17055' },
  { id: 'food', name: 'Food & Cooking', icon: '🍕', color: '#FDCB6E' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#6C5CE7' },
  { id: 'fitness', name: 'Fitness & Health', icon: '💪', color: '#00B894' },
  { id: 'travel', name: 'Travel & Vlog', icon: '✈️', color: '#00D2FF' },
  { id: 'beauty', name: 'Beauty & Skincare', icon: '💄', color: '#FD79A8' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟', color: '#A29BFE' },
  { id: 'comedy', name: 'Comedy & Memes', icon: '😂', color: '#FF7675' },
  { id: 'education', name: 'Education', icon: '📚', color: '#74B9FF' },
  { id: 'business', name: 'Business & Finance', icon: '📈', color: '#55EFC4' },
  { id: 'music', name: 'Music & Dance', icon: '🎵', color: '#FAB1A0' },
]

// ═══ INFLUENCER PLATFORMS ═══
export const INFLUENCER_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { id: 'twitter', name: 'X / Twitter', icon: '🐦', color: '#1DA1F2' },
]

// ═══ LANGUAGES ═══
export const LANGUAGES = [
  { id: 'telugu', name: 'Telugu', flag: '🟢', color: '#00B894' },
  { id: 'hindi', name: 'Hindi', flag: '🟡', color: '#FDCB6E' },
  { id: 'english', name: 'English', flag: '🔵', color: '#0984E3' },
  { id: 'tamil', name: 'Tamil', flag: '🟠', color: '#E17055' },
  { id: 'kannada', name: 'Kannada', flag: '🟣', color: '#6C5CE7' },
  { id: 'malayalam', name: 'Malayalam', flag: '🔴', color: '#FF7675' },
  { id: 'bengali', name: 'Bengali', flag: '⚪', color: '#636E72' },
  { id: 'marathi', name: 'Marathi', flag: '🟤', color: '#A29BFE' },
]

// ═══ INDIAN CITIES ═══
export const INDIAN_CITIES = [
  'Hyderabad', 'Vizag', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi',
]

// ═══ BUDGET RANGES ═══
export const BUDGET_RANGES = [
  { id: 'micro', label: '₹500 – ₹1K', min: 500, max: 1000 },
  { id: 'small', label: '₹1K – ₹5K', min: 1000, max: 5000 },
  { id: 'medium', label: '₹5K – ₹10K', min: 5000, max: 10000 },
  { id: 'large', label: '₹10K – ₹25K', min: 10000, max: 25000 },
  { id: 'premium', label: '₹25K+', min: 25000, max: 999999 },
]

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

// ═══ CAMPAIGN STATUS ═══
export const CAMPAIGN_STATUS: Record<string, { label: string, color: string, bg: string, icon: string }> = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
  accepted: { label: 'Accepted', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
  in_progress: { label: 'In Progress', color: '#0984E3', bg: 'rgba(9,132,227,0.1)', icon: '🔄' },
  completed: { label: 'Completed', color: '#6C5CE7', bg: 'rgba(108,92,231,0.1)', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: '❌' },
}

// ═══ CONTENT TYPES ═══
export const CONTENT_TYPES = [
  { id: 'post', name: 'Instagram Post', icon: '📸', desc: 'Static image post' },
  { id: 'reel', name: 'Instagram Reel', icon: '🎬', desc: 'Short video (15-90s)' },
  { id: 'story', name: 'Instagram Story', icon: '📱', desc: '24hr story post' },
  { id: 'youtube', name: 'YouTube Video', icon: '▶️', desc: 'Full YouTube video' },
  { id: 'collab', name: 'Brand Collab Post', icon: '🤝', desc: 'Collaborative content' },
]
