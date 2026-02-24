---
title: "How I use AI tools to 10x my productivity at Google"
description: "A practical breakdown of the AI tools I use daily as a software engineer — from code generation to research to writing."
date: 2025-02-23
tags: [tech, productivity, AI]
readingTime: 5
---

Every engineer I know has a different relationship with AI tools. Some ignore them entirely. Some use them for everything. I've landed somewhere in the middle — I use them intentionally, for specific things, and the productivity gains are real.

Here's what's actually in my daily stack.

## Code Generation: GitHub Copilot + Claude

Copilot handles the repetitive stuff inline — boilerplate, tests, type definitions. It's embedded in VS Code and after a few months it feels like autocomplete that actually understands context.

For bigger problems — designing a system, debugging a gnarly issue, or writing something I've never written before — I use Claude. The difference is that Claude is better for *thinking out loud*. I'll paste in a function and say "what's wrong with this?" and the back-and-forth is genuinely useful.

```python
# Example: instead of Googling the pandas merge syntax for the 100th time
# I just ask and get the exact code I need with an explanation
df_merged = pd.merge(df1, df2, on='user_id', how='left')
```

## Research: Perplexity for quick lookups

When I need to understand something fast — a new library, an architecture pattern, a finance concept — Perplexity is faster than Google for technical topics. It cites sources which matters when I'm making decisions.

I still read the actual documentation. AI summaries of docs are useful for orientation but I don't trust them for edge cases.

## Writing: AI as a first draft machine

I write all my blog posts myself but I use AI to get unstuck. If I have an idea but can't find the opening line, I'll describe what I want to say and ask for 5 different ways to start. I rarely use any of them directly but they get me moving.

The rule I follow: AI generates, I edit. Never the other way around. My voice stays mine.

## What I don't use AI for

- Code reviews. I want human eyes on what ships.
- System design decisions. The judgment calls matter too much.
- Anything involving sensitive data.

## The honest take

AI tools make me faster at things I already know how to do. They don't replace knowing how to do them. The engineers getting the most value are the ones who use AI to eliminate friction, not the ones trying to use it as a substitute for understanding.

If you're a new engineer, learn the fundamentals first. If you're experienced, these tools are genuinely worth investing time in learning properly.

What's in your stack? Hit me at chris@duncanc.io.
