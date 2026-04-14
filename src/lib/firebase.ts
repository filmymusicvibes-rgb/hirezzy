// ═══════════════════════════════════════════════════════════
// 🔥 HIREZZY — Firebase Initialization
// Auth + Firestore + Storage
// ═══════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { FIREBASE_CONFIG } from '../config'

// ═══ Initialize Firebase ═══
const app = initializeApp(FIREBASE_CONFIG)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

// ═══ AUTH FUNCTIONS ═══

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signupWithEmail(name: string, email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  // Update display name
  await updateProfile(result.user, { displayName: name })
  // Create user document in Firestore
  await createUserDoc(result.user, name)
  return result.user
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  // Check if user doc exists, if not create it
  const userDoc = await getDoc(doc(db, 'users', result.user.uid))
  if (!userDoc.exists()) {
    await createUserDoc(result.user, result.user.displayName || 'User')
  }
  return result.user
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// ═══ USER FUNCTIONS ═══

async function createUserDoc(user: User, name: string) {
  await setDoc(doc(db, 'users', user.uid), {
    name: name,
    email: user.email,
    phone: '',
    avatar: user.photoURL || '',
    role: 'seeker', // legacy field kept for compat
    roles: ['job_seeker'], // multi-role array
    onboardingDone: false,
    skills: [],
    city: '',
    resumeUrl: '',
    availability: 'available', // available | busy | offline
    bio: '',
    rate: '',
    // ═══ Influencer Fields ═══
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    followers: 0,
    engagementRate: 0,
    niche: [],
    languages: [],
    ratePerPost: 0,
    ratePerReel: 0,
    ratePerStory: 0,
    platform: 'instagram', // primary platform
    // ═══ Common Fields ═══
    savedJobs: [],
    walletBalance: 0,
    coins: 0,
    totalEarned: 0,
    gigsDone: 0,
    referralCount: 0,
    referralCode: generateReferralCode(),
    checkinStreak: 0,
    lastCheckin: null,
    verified: false,
    featured: false,
    rating: 0,
    reviewCount: 0,
    fcmToken: '',
    createdAt: serverTimestamp(),
    status: 'active',
  })
}

function generateReferralCode() {
  return 'HZ' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function getUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) return { id: userDoc.id, ...userDoc.data() }
  return null
}

export async function updateUserProfile(uid: string, data: any) {
  await updateDoc(doc(db, 'users', uid), data)
}

// ═══ JOBS FUNCTIONS ═══

export async function getJobs(categoryFilter?: string, limitCount = 20) {
  let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(limitCount))
  if (categoryFilter && categoryFilter !== 'all') {
    q = query(collection(db, 'jobs'), where('category', '==', categoryFilter), orderBy('createdAt', 'desc'), limit(limitCount))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function postJob(jobData: any) {
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...jobData,
    applicantCount: 0,
    viewCount: 0,
    status: 'active',
    verified: false,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// ═══ GIGS FUNCTIONS ═══

export async function getGigs(categoryFilter?: string) {
  let q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'), limit(20))
  if (categoryFilter && categoryFilter !== 'all') {
    q = query(collection(db, 'gigs'), where('category', '==', categoryFilter), orderBy('createdAt', 'desc'), limit(20))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function postGig(gigData: any) {
  const docRef = await addDoc(collection(db, 'gigs'), {
    ...gigData,
    orders: 0,
    rating: 0,
    reviewCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// ═══ GIG ORDERS ═══

export async function placeGigOrder(gigId: string, buyerId: string, sellerId: string, gigTitle: string, price: number) {
  const docRef = await addDoc(collection(db, 'gig_orders'), {
    gigId, buyerId, sellerId, gigTitle, price,
    status: 'ordered', // ordered → in_progress → delivered → completed
    createdAt: serverTimestamp(),
  })
  await addNotification(sellerId, {
    type: 'order', title: '🎉 New Order!',
    body: `New order for "${gigTitle}" — $${price}`,
  })
  return docRef.id
}

export async function getMyOrders(userId: string) {
  const q = query(collection(db, 'gig_orders'), where('buyerId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getMyGigOrders(userId: string) {
  const q = query(collection(db, 'gig_orders'), where('sellerId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateOrderStatus(orderId: string, status: string) {
  await updateDoc(doc(db, 'gig_orders', orderId), { status })
}

// ═══ APPLICATIONS ═══

export async function applyToJob(jobId: string, userId: string, resumeUrl: string, coverLetter: string, recruiterId: string) {
  const docRef = await addDoc(collection(db, 'applications'), {
    jobId,
    userId,
    recruiterId,
    resumeUrl,
    coverLetter,
    status: 'applied',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getMyApplications(userId: string) {
  const q = query(collection(db, 'applications'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ═══ TALENT SEARCH ═══

export async function searchTalent(skill?: string) {
  let q = query(collection(db, 'users'), where('role', '==', 'seeker'), where('skills', '!=', []), limit(20))
  const snap = await getDocs(q)
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  if (skill) {
    results = results.filter((u: any) =>
      u.skills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())) ||
      u.bio?.toLowerCase().includes(skill.toLowerCase())
    )
  }
  return results
}

// ═══ INFLUENCER SEARCH ═══

export async function searchInfluencers(filters?: {
  language?: string, city?: string, niche?: string, budgetMin?: number, budgetMax?: number
}) {
  // Get all users who have 'influencer' in roles array
  const q = query(collection(db, 'users'), where('roles', 'array-contains', 'influencer'), limit(50))
  const snap = await getDocs(q)
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  if (filters) {
    if (filters.language) {
      results = results.filter((u: any) =>
        (u.languages || []).some((l: string) => l.toLowerCase() === filters.language!.toLowerCase())
      )
    }
    if (filters.city) {
      results = results.filter((u: any) =>
        (u.city || '').toLowerCase().includes(filters.city!.toLowerCase())
      )
    }
    if (filters.niche) {
      results = results.filter((u: any) =>
        (u.niche || []).some((n: string) => n.toLowerCase() === filters.niche!.toLowerCase())
      )
    }
    if (filters.budgetMin !== undefined && filters.budgetMax !== undefined) {
      results = results.filter((u: any) => {
        const rate = u.ratePerPost || u.ratePerReel || 0
        return rate >= filters.budgetMin! && rate <= filters.budgetMax!
      })
    }
  }
  return results
}

// ═══ ONBOARDING ═══

export async function updateOnboardingComplete(uid: string, roles: string[]) {
  await updateDoc(doc(db, 'users', uid), {
    roles: roles,
    onboardingDone: true,
  })
}

// ═══ WALLET ═══

export async function addTransaction(userId: string, txData: any) {
  await addDoc(collection(db, 'users', userId, 'transactions'), {
    ...txData,
    createdAt: serverTimestamp(),
  })
}

export async function getTransactions(userId: string) {
  const q = query(collection(db, 'users', userId, 'transactions'), orderBy('createdAt', 'desc'), limit(20))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dailyCheckin(userId: string, currentCoins: number, currentStreak: number) {
  const newCoins = currentCoins + 5
  const newStreak = currentStreak + 1
  await updateDoc(doc(db, 'users', userId), {
    coins: newCoins,
    checkinStreak: newStreak,
    lastCheckin: serverTimestamp(),
  })
  await addTransaction(userId, {
    type: 'credit',
    title: 'Daily Check-in',
    description: `Day ${newStreak} streak`,
    amount: 5,
    unit: 'coins',
    icon: '📱',
  })
  return { coins: newCoins, streak: newStreak }
}

// ═══ FILE UPLOAD ═══

export async function uploadResume(userId: string, file: File) {
  const storageRef = ref(storage, `resumes/${userId}/${file.name}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  await updateDoc(doc(db, 'users', userId), { resumeUrl: url })
  return url
}

// ═══ REAL-TIME LISTENERS ═══

export function listenToUserProfile(uid: string, callback: (data: any) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

// ═══ SAVE/UNSAVE JOBS ═══

export async function saveJob(userId: string, jobId: string) {
  await setDoc(doc(db, 'saved_jobs', `${userId}_${jobId}`), {
    userId,
    jobId,
    savedAt: serverTimestamp(),
  })
}

export async function unsaveJob(userId: string, jobId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'saved_jobs', `${userId}_${jobId}`))
}

export async function getSavedJobs(userId: string) {
  const q = query(collection(db, 'saved_jobs'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data().jobId)
}
// ═══ SHORTLIST TALENT ═══

export async function shortlistTalent(userId: string, talentId: string) {
  await setDoc(doc(db, 'shortlists', `${userId}_${talentId}`), {
    userId, talentId, savedAt: serverTimestamp(),
  })
}

export async function unshortlistTalent(userId: string, talentId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'shortlists', `${userId}_${talentId}`))
}

export async function getShortlistedTalent(userId: string) {
  const q = query(collection(db, 'shortlists'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data().talentId)
}

// ═══ NOTIFICATIONS ═══

export async function addNotification(userId: string, notif: { type: string, title: string, body: string, icon?: string }) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    ...notif,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function getNotifications(userId: string) {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(30))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}

// ═══ REFERRAL SYSTEM ═══

export async function processReferral(referrerId: string, newUserId: string) {
  // Record the referral
  await addDoc(collection(db, 'referrals'), {
    referrerId,
    referredId: newUserId,
    coinsEarned: 25,
    createdAt: serverTimestamp(),
  })
  // Credit coins to referrer
  const referrerDoc = await getDoc(doc(db, 'users', referrerId))
  if (referrerDoc.exists()) {
    const currentCoins = referrerDoc.data().coins || 0
    const currentCount = referrerDoc.data().referralCount || 0
    await updateDoc(doc(db, 'users', referrerId), {
      coins: currentCoins + 25,
      referralCount: currentCount + 1,
    })
    await addTransaction(referrerId, {
      type: 'credit',
      title: 'Referral Bonus',
      description: 'New friend joined!',
      amount: 25,
      unit: 'coins',
      icon: '🎁',
    })
  }
}

export async function getReferralByCode(code: string) {
  const q = query(collection(db, 'users'), where('referralCode', '==', code), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

// ═══ SEARCH JOBS ═══

export async function searchJobs(searchTerm: string) {
  // Get all active jobs and filter client-side (for MVP — later use Algolia)
  const q = query(collection(db, 'jobs'), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(50))
  const snap = await getDocs(q)
  const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const term = searchTerm.toLowerCase()
  return jobs.filter((j: any) =>
    j.title?.toLowerCase().includes(term) ||
    j.company?.toLowerCase().includes(term) ||
    j.location?.toLowerCase().includes(term) ||
    j.skills?.some((s: string) => s.toLowerCase().includes(term))
  )
}

// ═══ OFFERS ═══

export async function sendOffer(fromUserId: string, toUserId: string, offerData: any) {
  const docRef = await addDoc(collection(db, 'offers'), {
    fromUserId,
    toUserId,
    ...offerData,
    status: 'pending', // pending | accepted | rejected
    createdAt: serverTimestamp(),
  })
  // Also notify the talent
  await addNotification(toUserId, {
    type: 'offer',
    title: '🎉 New Job Offer!',
    body: `You received an offer: ${offerData.title}`,
  })
  return docRef.id
}

// ═══ REVIEWS ═══

export async function addReview(influencerId: string, review: {
  rating: number, text: string, reviewerName: string, reviewerId: string, campaignType?: string
}) {
  await addDoc(collection(db, 'reviews'), {
    influencerId,
    ...review,
    createdAt: serverTimestamp(),
  })
  // Update influencer's average rating
  const reviews = await getReviews(influencerId)
  const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / Math.max(reviews.length, 1)
  // Try to update user doc with new rating
  try {
    await updateDoc(doc(db, 'users', influencerId), {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    })
  } catch {}
}

export async function getReviews(influencerId: string) {
  const q = query(collection(db, 'reviews'), where('influencerId', '==', influencerId), orderBy('createdAt', 'desc'), limit(20))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ═══ CAMPAIGNS (HIRE REQUESTS) ═══

export async function createCampaign(campaign: {
  brandId: string, brandName: string, influencerId: string, influencerName: string,
  contentType: string, budget: number, brief: string, influencerAvatar?: string, influencerColor?: string
}) {
  const docRef = await addDoc(collection(db, 'campaigns'), {
    ...campaign,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // Notify influencer
  try {
    await addNotification(campaign.influencerId, {
      type: 'campaign',
      title: '💼 New Hire Request!',
      body: `${campaign.brandName} wants to hire you for a ${campaign.contentType}`,
      icon: '🎬',
    })
  } catch {}
  return docRef.id
}

export async function getUserCampaigns(userId: string) {
  const q = query(collection(db, 'campaigns'), where('brandId', '==', userId), orderBy('createdAt', 'desc'), limit(30))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateCampaignStatus(campaignId: string, status: string) {
  await updateDoc(doc(db, 'campaigns', campaignId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

// ═══ CHAT SYSTEM ═══

export async function getOrCreateChat(userId: string, otherUserId: string, otherUserName: string, otherUserAvatar?: string, otherUserColor?: string) {
  // Check if chat already exists
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId), limit(50))
  const snap = await getDocs(q)
  const existing = snap.docs.find(d => {
    const data = d.data()
    return data.participants?.includes(otherUserId)
  })
  if (existing) return existing.id

  // Create new chat
  const chatRef = await addDoc(collection(db, 'chats'), {
    participants: [userId, otherUserId],
    participantNames: { [userId]: 'You', [otherUserId]: otherUserName },
    participantAvatars: { [otherUserId]: otherUserAvatar || '?' },
    participantColors: { [otherUserId]: otherUserColor || '#6C5CE7' },
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return chatRef.id
}

export async function sendChatMessage(chatId: string, senderId: string, text: string) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  })
  // Update last message on chat doc
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text.substring(0, 100),
    lastMessageAt: serverTimestamp(),
  })
}

export async function getUserChats(userId: string) {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId), orderBy('lastMessageAt', 'desc'), limit(30))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function listenToMessages(chatId: string, callback: (messages: any[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'), limit(100))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

// ═══ PORTFOLIO SYSTEM ═══

export async function savePortfolioItem(userId: string, item: { title: string, imageUrl: string, type: string, description: string, brandName?: string }) {
  return addDoc(collection(db, 'portfolios'), {
    userId,
    ...item,
    createdAt: serverTimestamp(),
  })
}

export async function getPortfolio(userId: string) {
  const q = query(collection(db, 'portfolios'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ═══ PAYMENT SYSTEM ═══

export async function createPayment(data: { brandId: string, creatorId: string, creatorName: string, amount: number, campaignId?: string, description: string }) {
  return addDoc(collection(db, 'payments'), {
    ...data,
    status: 'pending',
    razorpayId: '',
    createdAt: serverTimestamp(),
  })
}

export async function getUserPayments(userId: string) {
  const q = query(collection(db, 'payments'), where('brandId', '==', userId), orderBy('createdAt', 'desc'), limit(30))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updatePaymentStatus(paymentId: string, status: string, razorpayId?: string) {
  await updateDoc(doc(db, 'payments', paymentId), {
    status,
    ...(razorpayId ? { razorpayId } : {}),
    updatedAt: serverTimestamp(),
  })
}

// ═══ ADMIN SYSTEM ═══

export async function getAllUsers(limitCount = 50) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getAdminStats() {
  const [usersSnap, campaignsSnap, paymentsSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), limit(500))),
    getDocs(query(collection(db, 'campaigns'), limit(500))),
    getDocs(query(collection(db, 'payments'), limit(500))),
  ])
  const creators = usersSnap.docs.filter(d => d.data().role === 'creator' || (d.data().roles || []).includes('influencer'))
  return {
    totalUsers: usersSnap.size,
    totalCreators: creators.length,
    totalCampaigns: campaignsSnap.size,
    totalPayments: paymentsSnap.size,
  }
}

export async function verifyCreator(userId: string, verified: boolean) {
  await updateDoc(doc(db, 'users', userId), { verified })
}

// ═══ REPORT SYSTEM ═══

export async function submitReport(data: { reporterId: string, targetId: string, targetName: string, reason: string, details: string }) {
  return addDoc(collection(db, 'reports'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function getReports() {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Re-export types
export type { User }
