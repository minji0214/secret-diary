# README Introduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the boilerplate Next.js README with a developer-focused introduction for secret-diary.

**Architecture:** Single file edit — overwrite `README.md` with project description, features, tech stack table, env setup, and getting started steps. No new files.

**Tech Stack:** Markdown only.

---

### Task 1: Rewrite README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README.md content**

Replace the entire file with:

```markdown
# secret-diary

An AI-powered emotional journaling app built with Next.js.  
Write down what you can't say to anyone — your feelings dissolve into the night, and the stars write back.

## Features

- Emotion tagging to set the tone before writing
- Free-form journaling with streaming AI response (Google Gemini)
- Tarot card reading feature
- History view of past entries
- Starfield UI with glassmorphism design

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Framework | Next.js 16 (App Router)             |
| Language  | TypeScript                          |
| Styling   | Tailwind CSS v4                     |
| AI        | Google Gemini (`gemini-2.0-flash-lite`) |
| Runtime   | Node.js / pnpm                      |

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

## Environment Setup

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in:

```
GEMINI_API_KEY=your_api_key_here
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Google AI Studio](https://aistudio.google.com)

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set `GEMINI_API_KEY` as an environment variable in your Vercel project settings.
```

- [ ] **Step 2: Commit**

```bash
git add README.md docs/superpowers/specs/2026-05-31-readme-introduction-design.md docs/superpowers/plans/2026-05-31-readme-introduction.md
git commit -m "docs: add developer-focused README introduction"
```

- [ ] **Step 3: Create PR to main**

```bash
gh pr create --base main --title "docs: add developer-focused README introduction" --body "Replaces the create-next-app boilerplate README with a project description, features list, tech stack table, env setup instructions, and getting started steps."
```
