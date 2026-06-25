# TruthBoard - Public Accountability Platform

TruthBoard is a modern, community-driven social database built to bring internet accountability to light. It allows users to safely and permanently log evidence of toxic behavior, scams, harassment, and misinformation across the web.

## 🚀 Features

- **Permanent Evidence Logs:** Uses Upstash Redis to permanently store text and metadata, and Vercel Blob Storage to securely host image evidence.
- **Centralized Social Timeline:** A sleek, fully responsive, mobile-first feed that presents data just like Twitter/X.
- **Community Corroboration:** Users can verify and "upvote" evidence, which acts as a credibility metric for reports.
- **Dynamic Hall of Shame Profiles:** Automatically aggregates all evidence against a specific user into a dedicated public profile page. Flags repeat offenders automatically.
- **Custom Categorization:** Tag posts with predefined categories (e.g., `#Scam`, `#HateSpeech`, `#FakeFeminism`) or create custom tags.
- **Advanced Filtering & Archives:** Filter the database by specific platforms or browse through Monthly Historical Archives.
- **Highly Shareable:** Built with native Web Share API integration and Open Graph SEO metadata so links generate beautiful preview cards when texted or tweeted.

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** CSS Grid/Flexbox with Modern Glassmorphism UI
- **Database:** Upstash Redis (Serverless)
- **File Storage:** Vercel Blob

## 🛡️ Moderation & Administration
TruthBoard includes a built-in administrative capability. Posts and images can be permanently deleted from the database and Blob storage using an admin password prompt, ensuring the platform can be moderated effectively against false reports.

## 🤝 Community Mission
This project was built with a clear purpose: to protect the community. It is designed not for profit, but to empower individuals to warn others and foster a safer, more accountable internet.
