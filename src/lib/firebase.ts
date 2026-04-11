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
    role: 'seeker', // seeker | recruiter | admin
    skills: [],
    city: '',
    resumeUrl: '',
    availability: 'available', // available | busy | offline
    bio: '',
    rate: '',
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

export async function getGigs() {
  const q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'), limit(30))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
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

// Re-export types
export type { User }
