#!/usr/bin/env node
/**
 * ┌──────────────────────────────────────────────────────────┐
 *   duncanc.io — AI Blog Post Generator
 *
 *   Usage:    npm run new-post
 *   Supports: Claude (Anthropic) or Gemini (Google)
 *   Switch:   AI_PROVIDER=claude or AI_PROVIDER=gemini in .env
 * └──────────────────────────────────────────────────────────┘
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// ─── Load .env ───────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .forEach(l => {
      const [key, ...val] = l.split('=');
      if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
}

const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const AI_PROVIDER = (process.env.AI_PROVIDER || 'claude').toLowerCase();

// ─── Colors ──────────────────────────────────────────────────
const c = {
  blue:   t => `\x1b[34m${t}\x1b[0m`,
  green:  t => `\x1b[32m${t}\x1b[0m`,
  yellow: t => `\x1b[33m${t}\x1b[0m`,
  cyan:   t => `\x1b[36m${t}\x1b[0m`,
  bold:   t => `\x1b[1m${t}\x1b[0m`,
  dim:    t => `\x1b[2m${t}\x1b[0m`,
  reset:  t => `\x1b[0m${t}\x1b[0m`,
};

// ─── Helpers ─────────────────────────────────────────────────
function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function toSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// ─── AI Prompt ───────────────────────────────────────────────
function buildPrompt(title, tags, tone) {
  return `You are helping Chris Duncan — a software engineer at Google — write a blog post for his personal site duncanc.io. Chris writes about tech and finance.

Write a complete, well-structured blog post in Markdown:

Title: "${title}"
Tags: ${tags}
Tone: ${tone}

Requirements:
- First person as Chris (Google engineer, builds side projects, invests)
- Engaging opening paragraph that hooks the reader
- 3-4 sections with ## headers
- At least one code snippet or concrete example where relevant
- Personal voice — opinionated, direct, useful
- End with a reflection or call to action
- Length: 600-900 words
- Do NOT include frontmatter — just the Markdown body content

Output only the Markdown body. No preamble or explanation.`;
}

// ─── Claude ──────────────────────────────────────────────────
async function generateWithClaude(title, tags, tone) {
  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch {
    console.error(c.yellow('\n  ⚠ @anthropic-ai/sdk not installed. Run: npm install\n'));
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(c.yellow('\n  ⚠ ANTHROPIC_API_KEY not set in .env\n'));
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log(c.dim('\n  Calling Claude...'));

  const msg = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: buildPrompt(title, tags, tone) }],
  });

  return msg.content[0].text;
}

// ─── Gemini ──────────────────────────────────────────────────
async function generateWithGemini(title, tags, tone) {
  let GoogleGenerativeAI;
  try {
    ({ GoogleGenerativeAI } = await import('@google/generative-ai'));
  } catch {
    console.error(c.yellow('\n  ⚠ @google/generative-ai not installed. Run: npm install\n'));
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error(c.yellow('\n  ⚠ GEMINI_API_KEY not set in .env\n'));
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  console.log(c.dim('\n  Calling Gemini...'));

  const result = await model.generateContent(buildPrompt(title, tags, tone));
  return result.response.text();
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('\n' + c.bold(c.blue('  ✦ duncanc.io — New Post Generator')));
  console.log(c.dim(`  Provider: ${AI_PROVIDER} | Switch via AI_PROVIDER in .env\n`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const title   = (await ask(rl, c.cyan('  Post title: '))).trim();
  if (!title) { console.log('  Title required.'); rl.close(); return; }

  const tagsRaw = await ask(rl, c.cyan('  Tags (comma-separated, e.g. tech,finance,career): '));
  const toneNum = await ask(rl, c.cyan('  Tone? [1] Casual  [2] Technical  [3] Educational  (enter for casual): '));
  const useAI   = await ask(rl, c.cyan('  Generate draft with AI? [Y/n]: '));
  rl.close();

  const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const toneMap = { '1': 'casual and conversational', '2': 'technical and precise', '3': 'educational and approachable' };
  const tone = toneMap[toneNum.trim()] || toneMap['1'];
  const doAI = useAI.trim().toLowerCase() !== 'n';

  const slug     = toSlug(title);
  const date     = todayDate();
  const fileName = `${date}-${slug}.md`;
  const filePath = path.join(POSTS_DIR, fileName);

  // Check for existing file
  if (fs.existsSync(filePath)) {
    console.log(c.yellow(`\n  ⚠ File already exists: ${fileName}`));
    console.log(c.dim('  Rename it or delete it first.\n'));
    return;
  }

  // Generate content
  let body = `Write your post content here.\n\nDelete this placeholder and start writing!`;

  if (doAI) {
    try {
      body = AI_PROVIDER === 'gemini'
        ? await generateWithGemini(title, tags, tone)
        : await generateWithClaude(title, tags, tone);
    } catch (err) {
      console.error(c.yellow(`\n  ⚠ AI generation failed: ${err.message}`));
      console.log(c.dim('  Creating file with placeholder instead...\n'));
    }
  }

  // Build frontmatter
  const readingTime = estimateReadingTime(body);
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `description: ""`,
    `date: ${date}`,
    `tags: [${tags.map(t => `${t}`).join(', ')}]`,
    `readingTime: ${readingTime}`,
    '---',
    '',
  ].join('\n');

  // Write file
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(filePath, frontmatter + body, 'utf8');

  // Success output
  console.log('\n  ' + c.green('✓ Post created!'));
  console.log(c.dim(`  File:  src/content/blog/${fileName}`));
  console.log(c.dim(`  URL:   https://duncanc.io/blog/${slug}`));
  console.log('\n  ' + c.bold('Next steps:'));
  console.log(c.dim('  1. Edit the file in your IDE'));
  console.log(c.dim('  2. Run: npm run dev  (preview locally)'));
  console.log(c.dim('  3. Run: git add . && git commit -m "new post: ' + title + '" && git push'));
  console.log(c.dim('  4. Vercel auto-deploys in ~30 seconds\n'));
}

main().catch(err => {
  console.error('\n  Error:', err.message);
  process.exit(1);
});
