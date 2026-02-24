# duncanc.io

Personal site for Chris Duncan — tech, finance, and building things.
Built with [Astro](https://astro.build), deployed on [Vercel](https://vercel.com) via GitHub Actions.

---

## 🚀 First Time Setup (do this once)

### 1. Copy this project to your computer
Download the project folder and put it somewhere like `C:\Users\CDunc\projects\duncanc-io`

### 2. Open PowerShell in the project folder
Right-click the folder → "Open in Terminal" or navigate to it:
```powershell
cd C:\Users\CDunc\projects\duncanc-io
```

### 3. Install dependencies
```powershell
npm install
```

### 4. Set up your environment variables
```powershell
copy .env.example .env
```
Then open `.env` in VS Code and add your API keys (see AI Blog section below).

### 5. Run locally
```powershell
npm run dev
```
Open your browser to `http://localhost:4321` — your site is running!

---

## ✍️ Writing a New Blog Post

### Option A: With AI (recommended)
```powershell
npm run new-post
```
It will ask you:
- Post title
- Tags (e.g. `tech, finance, career`)
- Tone (casual / technical / educational)
- Whether to use AI to draft it

The AI writes a full draft, saves it as a `.md` file, and tells you exactly where it is.

### Option B: Manually
Create a new file in `src/content/blog/` named `YYYY-MM-DD-your-title.md`:

```markdown
---
title: "Your Post Title"
description: "A short description"
date: 2025-03-01
tags: [tech, finance]
readingTime: 4
---

Your content here. Write in plain Markdown.
```

### Previewing your post
```powershell
npm run dev
```
Go to `http://localhost:4321/blog` to see it.

---

## 🌐 Deploying (GitHub → Vercel)

Every time you push to GitHub, your site auto-deploys. Here's how to set that up:

### Step 1: Push to GitHub
1. Go to [github.com](https://github.com) → New Repository → name it `duncanc-io`
2. In PowerShell:
```powershell
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/duncanc-io.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "Add New Project" → Import your `duncanc-io` repo
3. Vercel auto-detects Astro — just click Deploy
4. Your site is live at a `.vercel.app` URL

### Step 3: Add your custom domain
1. In Vercel dashboard → your project → Settings → Domains
2. Add `duncanc.io`
3. Vercel gives you DNS records to add in Porkbun
4. In Porkbun → your domain → DNS → add the records Vercel shows you
5. Wait 10-30 minutes → your site is live at `duncanc.io`

### Step 4: Set up GitHub Actions (auto-deploy on push)
1. In Vercel: Settings → Tokens → Create token → copy it
2. In GitHub repo: Settings → Secrets → Actions → add these 3 secrets:
   - `VERCEL_TOKEN` — the token you just copied
   - `VERCEL_ORG_ID` — found in Vercel Settings → General
   - `VERCEL_PROJECT_ID` — found in your project Settings → General

Now every `git push` auto-deploys. The full flow:

```powershell
# Write a post
npm run new-post

# Edit it in VS Code, then:
git add .
git commit -m "new post: your title here"
git push
# → GitHub Actions runs → Vercel deploys → live in ~30 seconds
```

---

## 🤖 AI Blog CLI Setup

### To use Claude:
1. Get API key at [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env`: `ANTHROPIC_API_KEY=your_key_here`
3. Set: `AI_PROVIDER=claude`

### To use Gemini:
1. Get API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`
3. Set: `AI_PROVIDER=gemini`

### To switch between them:
Just change one line in `.env`:
```
AI_PROVIDER=claude   # use Claude
AI_PROVIDER=gemini   # use Gemini
```

---

## 📁 Project Structure

```
duncanc-io/
├── src/
│   ├── content/
│   │   └── blog/          ← Your blog posts go here (.md files)
│   ├── pages/
│   │   ├── index.astro    ← Home page
│   │   ├── blog/          ← Blog index + post pages
│   │   ├── projects.astro
│   │   ├── videos.astro
│   │   ├── finance.astro
│   │   └── about.astro
│   ├── layouts/
│   │   └── Base.astro     ← Header, footer, nav
│   └── styles/
│       └── global.css     ← All styles + theme variables
├── scripts/
│   └── new-post.mjs       ← AI blog post generator
├── .github/workflows/
│   └── deploy.yml         ← GitHub Actions auto-deploy
├── .env.example           ← Copy this to .env
└── astro.config.mjs
```

## 🎨 Changing the Theme Color

Open `src/styles/global.css` and change `--accent` in `:root`:

```css
:root {
  --accent: #2563eb;   /* blue (default) */
  /* --accent: #16a34a;  green */
  /* --accent: #7c3aed;  purple */
  /* --accent: #0891b2;  teal */
  /* --accent: #dc2626;  red */
}
```

One line change. The entire site updates instantly.
