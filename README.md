<div align="center">
  <h1>📖 ONE STORY</h1>
  <p><em>A Document Written by Humanity</em></p>
</div>

---

<br/>

**One Story** is an experimental, collaborative storytelling web application. It is not a social network or an AI product; it is a living historical archive. The concept is simple: **humanity is collectively writing a single story, one sentence at a time.**

The design philosophy is deeply inspired by old books, archives, libraries, newspapers, public records, and museum exhibits. The interface feels timeless, quiet, and serious—a digital monument that could still exist 100 years from now.

## 🏛 The Rules of the Archive
1. **One Sentence Only:** The story progresses one sentence at a time.
2. **Daily Lock:** Every day at exactly **11 PM IST**, the story locks. The top-voted sentence from the public queue is accepted into the official canon.
3. **The 45-Day Cooldown:** If a contributor's sentence is accepted into the official story, they are placed on a 45-day cooldown. This ensures that a diverse array of voices shapes the narrative, rather than a select few power users.
4. **Length Limit:** Sentences are strictly capped at 500 characters.

## 📜 Features
- **The Chronicle:** A comprehensive, chapter-by-chapter log of the entire story's history.
- **Alternate Futures:** A museum of sentences that were proposed but ultimately rejected.
- **Public Voting Hall:** An interactive voting system where the community determines which sentence will be canonized next.
- **Admin Moderation:** A strict queue system where all submissions are manually reviewed before entering the public voting pool to maintain the integrity of the archive.
- **Archive Aesthetics:** A meticulously crafted, CSS-first design system utilizing `Tailwind CSS v4` featuring subtle paper textures, serif typography, and letterpress-style stamps.

## 💻 Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 (CSS-first, custom design system)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma v7 (using the `@prisma/adapter-pg` driver)
- **Authentication:** Google OIDC via `@react-oauth/google` and Supabase Auth
- **Deployment:** Vercel

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jayyy560/ONESTORY.git
   cd ONESTORY
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   # Google OAuth (Frontend)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Database (Prisma)
   DATABASE_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

   # Security
   CRON_SECRET=your-secret-key
   ```

4. **Sync the Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the archive.

---

<div align="center">
  <p><em>The story belongs to everyone.</em></p>
</div>
