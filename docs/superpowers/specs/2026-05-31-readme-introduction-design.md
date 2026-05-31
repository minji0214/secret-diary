---
name: readme-introduction
description: Developer-focused README introduction for secret-diary — English, covers description, features, tech stack, env setup, getting started
metadata:
  type: project
---

# README Introduction Design — secret-diary

## Scope

Add a developer-oriented introduction to the top of `README.md`, in English, targeting developers and contributors who need to understand the project and get it running locally.

## Structure

### 1. Header + Tagline
Project title `secret-diary` with a two-sentence description capturing both the emotional tone of the app and its technical nature.

### 2. Features
Bullet list of key product features:
- Emotion tagging before writing
- Free-form journaling with Gemini AI response
- Tarot card reading feature
- History view of past entries
- Starfield UI with glassmorphism design

### 3. Tech Stack
Markdown table with four rows: Framework (Next.js 16, App Router), Language (TypeScript), Styling (Tailwind CSS v4), AI (Google Gemini via `gemini-2.0-flash-lite`), Runtime (Node.js / pnpm).

### 4. Prerequisites & Environment Setup
Single `GEMINI_API_KEY` required. Show `.env.local` snippet with link to Google AI Studio.

### 5. Getting Started
Three steps: `pnpm install`, `cp .env.local.example .env.local` + fill key, `pnpm dev`.

## What stays unchanged

Existing "Getting Started", "Learn More", and "Deploy on Vercel" sections are replaced/merged — the new Getting Started is more complete and includes the env step that was missing.

## Out of scope

- Project architecture diagram
- Contributing guidelines
- Screenshot placeholders
- Korean-language version
