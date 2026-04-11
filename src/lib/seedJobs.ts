// ═══ Seed Jobs Script ═══
// Run this ONCE to populate Firestore with initial job listings
// Usage: Open browser console on localhost and paste this

import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const SEED_JOBS = [
  { title: 'Senior UI/UX Designer', company: 'CyberTech Solutions', category: 'design', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 120000, salaryMax: 150000, currency: '$', description: 'We are looking for a talented Senior UI/UX Designer to create beautiful, user-centered designs for our SaaS products.', skills: ['Figma', 'React', 'UI/UX', 'Adobe XD'], verified: true, featured: true },
  { title: 'Blockchain Developer', company: 'MetaCorp', category: 'it', type: 'Full Time', location: 'Hyderabad', remote: 'Hybrid', salaryMin: 1500000, salaryMax: 2500000, currency: '₹', description: 'Join our blockchain team to build decentralized applications and smart contracts on Ethereum and Solana.', skills: ['Solidity', 'Web3', 'React', 'Node.js'], verified: true, featured: true },
  { title: 'Frontend Developer - Web3', company: 'CryptoNova', category: 'it', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 100000, salaryMax: 120000, currency: '$', description: 'Build cutting-edge Web3 frontend applications using React, TypeScript, and blockchain integration.', skills: ['React', 'TypeScript', 'Web3', 'Ethers.js'], verified: true, featured: false },
  { title: 'Data Entry Operator', company: 'State Government', category: 'govt', type: 'Full Time', location: 'Vizag', remote: 'On-site', salaryMin: 25000, salaryMax: 35000, currency: '₹', description: 'Government data entry position. 10th pass with typing speed 30 WPM required.', skills: ['Typing', 'MS Office', 'Data Entry'], verified: true, featured: false },
  { title: 'Digital Marketing Intern', company: 'Sofviz Technologies', category: 'internship', type: 'Internship', location: 'Vizag', remote: 'Remote', salaryMin: 5000, salaryMax: 10000, currency: '₹', description: 'Learn and execute digital marketing strategies including SEO, social media marketing, and content creation.', skills: ['SEO', 'Social Media', 'Content Writing', 'Google Ads'], verified: true, featured: false },
  { title: 'Flutter Developer (WFH)', company: 'StartupX', category: 'wfh', type: 'Full Time', location: 'Work From Home', remote: 'Remote', salaryMin: 1000000, salaryMax: 1800000, currency: '₹', description: 'Build cross-platform mobile apps using Flutter and Dart. Firebase experience preferred.', skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'], verified: false, featured: true },
  { title: 'Python Developer', company: 'Infosys', category: 'it', type: 'Full Time', location: 'Hyderabad', remote: 'On-site', salaryMin: 600000, salaryMax: 1200000, currency: '₹', description: 'Develop and maintain Python-based backend services, APIs, and microservices.', skills: ['Python', 'Django', 'PostgreSQL', 'Docker'], verified: true, featured: false },
  { title: 'Content Writer - Freelance', company: 'ContentHub', category: 'freelance', type: 'Freelance', location: 'Remote', remote: 'Remote', salaryMin: 500, salaryMax: 1500, currency: '$', description: 'Write SEO-optimized blog posts, articles, and web content for technology companies.', skills: ['Content Writing', 'SEO', 'Copywriting', 'Research'], verified: false, featured: false },
  { title: 'React Native Developer', company: 'AppForge', category: 'it', type: 'Full Time', location: 'Bangalore', remote: 'Hybrid', salaryMin: 800000, salaryMax: 1500000, currency: '₹', description: 'Build and maintain React Native mobile applications for iOS and Android platforms.', skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux'], verified: true, featured: true },
  { title: 'DevOps Engineer', company: 'CloudTech India', category: 'it', type: 'Full Time', location: 'Remote', remote: 'Remote', salaryMin: 1200000, salaryMax: 2000000, currency: '₹', description: 'Manage CI/CD pipelines, containerization, and cloud infrastructure on AWS/GCP.', skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'], verified: true, featured: false },
  { title: 'Social Media Manager', company: 'BrandBuzz', category: 'marketing', type: 'Full Time', location: 'Mumbai', remote: 'Hybrid', salaryMin: 400000, salaryMax: 800000, currency: '₹', description: 'Create and manage social media strategies across Instagram, LinkedIn, Twitter, and YouTube.', skills: ['Social Media', 'Content Strategy', 'Analytics', 'Canva'], verified: true, featured: false },
  { title: 'Video Editor', company: 'CreativeMinds', category: 'design', type: 'Freelance', location: 'Remote', remote: 'Remote', salaryMin: 300, salaryMax: 800, currency: '$', description: 'Edit YouTube videos, reels, and promotional content. Proficiency in Premiere Pro required.', skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'], verified: false, featured: false },
]

export async function seedJobs() {
  console.log('🌱 Seeding jobs...')
  for (const job of SEED_JOBS) {
    await addDoc(collection(db, 'jobs'), {
      ...job,
      applicantCount: 0,
      viewCount: 0,
      status: 'active',
      postedBy: 'admin',
      createdAt: serverTimestamp(),
    })
    console.log(`  ✅ ${job.title}`)
  }
  console.log('🎉 All jobs seeded!')
}
