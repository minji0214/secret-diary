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

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Framework | Next.js 16 (App Router)                 |
| Language  | TypeScript                              |
| Styling   | Tailwind CSS v4                         |
| AI        | Google Gemini (`gemini-2.0-flash-lite`) |
| Runtime   | Node.js / pnpm                          |

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
