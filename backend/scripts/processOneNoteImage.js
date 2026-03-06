import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createWorker } from 'tesseract.js';

dotenv.config();

const OUT_DIR = path.resolve(process.cwd(), 'notes_out');
const MASTER_ENHANCED_FILE = path.resolve(OUT_DIR, 'MASTER_ENHANCED_NOTES.txt');

function resolveGroqKey() {
  return process.env.GROQ_API_KEY || process.env.GORK_API_KEY;
}

function usageAndExit(code = 1) {
  console.log(
    [
      'Usage:',
      '  node scripts/processOneNoteImage.js <imagePath> [--title "My Topic"]',
      '',
      'Env (optional):',
      '  GROQ_API_KEY / GORK_API_KEY   (for enhancement)',
      '  OCR_MIN_CONF=60              (words below become [unclear])',
      '',
      'Output:',
      `  ${OUT_DIR}\\YYYYMMDD_HHMMSS_<slug>.txt`,
    ].join('\n')
  );
  process.exit(code);
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function ocrImageToText(imagePath) {
  const trainedDataDir = process.cwd();
  const trainedDataFile = path.resolve(trainedDataDir, 'eng.traineddata');
  if (!fs.existsSync(trainedDataFile)) {
    throw new Error(`Missing OCR language data: ${trainedDataFile}`);
  }

  const minConf = process.env.OCR_MIN_CONF ? Number(process.env.OCR_MIN_CONF) : 60;

  const worker = await createWorker('eng', undefined, {
    langPath: trainedDataDir,
    gzip: false,
  });

  try {
    const res = await worker.recognize(imagePath);
    const data = res?.data || {};

    const words = Array.isArray(data.words) ? data.words : [];
    if (!words.length) {
      return String(data.text || '').trim();
    }

    const byLine = new Map();
    for (const w of words) {
      const t = String(w?.text || '').trim();
      if (!t) continue;
      const conf = typeof w?.confidence === 'number' ? w.confidence : Number(w?.confidence);
      const safe = Number.isFinite(conf) && conf >= minConf ? t : '[unclear]';
      const key = [w.block_num, w.par_num, w.line_num].map((x) => (x ?? 0)).join(':');
      if (!byLine.has(key)) byLine.set(key, []);
      byLine.get(key).push(safe);
    }

    const sortedKeys = Array.from(byLine.keys())
      .map((k) => ({ k, parts: k.split(':').map((n) => Number(n) || 0) }))
      .sort((a, b) => (a.parts[0] - b.parts[0]) || (a.parts[1] - b.parts[1]) || (a.parts[2] - b.parts[2]))
      .map((x) => x.k);

    const lines = [];
    for (const k of sortedKeys) {
      const parts = byLine.get(k) || [];
      const merged = [];
      for (const p of parts) {
        if (p === '[unclear]' && merged[merged.length - 1] === '[unclear]') continue;
        merged.push(p);
      }
      lines.push(merged.join(' '));
    }

    return lines.join('\n').trim();
  } finally {
    try {
      await worker.terminate();
    } catch {
      // ignore
    }
  }
}

async function groqEnhance({ transcription, title }) {
  const apiKey = resolveGroqKey();
  if (!apiKey) {
    return {
      enhanced: null,
      reason: 'Missing GROQ_API_KEY; saved only transcription.',
    };
  }

  const system = `You are my course-content writer.
I will give you OCR text from 1 photo of my handwritten notes (may contain [unclear]).

Task: Write ONLY the enhanced notes in my same tone (do NOT output A/B format).

Tone + style:
- simple Indian-English like my notes: u, lang, mach, i.e., ex, etc.
- headings + bullet points + short lines
- beginner friendly but deeper: add missing why/how points
- do NOT add external links
- add 1–2 tiny examples only when helpful (include expected output)
- add ASCII diagrams/flowcharts as "pictures" when needed

Rules:
- keep same topic and flow; don’t change meaning
- if something is unclear, don’t guess wildly; keep it as [unclear] or skip that micro-detail

Length: ~250–450 words unless user asks make it long.`;

  const user = `Title/context (if any): ${title || 'N/A'}

OCR TEXT (may include [unclear]):
${transcription}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    return {
      enhanced: null,
      reason: `Groq API error ${res.status}: ${txt.slice(0, 300)}`,
    };
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  return {
    enhanced: String(content || '').trim(),
    reason: null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) usageAndExit(1);

  const imagePath = args[0];
  if (!imagePath || imagePath.startsWith('-')) usageAndExit(1);

  const titleIndex = args.findIndex((a) => a === '--title');
  const title = titleIndex >= 0 ? args[titleIndex + 1] : '';

  const resolvedImagePath = path.resolve(process.cwd(), imagePath);
  if (!fs.existsSync(resolvedImagePath)) {
    throw new Error(`Image not found: ${resolvedImagePath}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('🖼️ OCR reading image...');
  const transcription = await ocrImageToText(resolvedImagePath);
  if (!transcription || transcription.length < 10) {
    throw new Error('OCR produced too little text. Image might be too blurry/low contrast.');
  }

  console.log('🧠 Enhancing in your tone...');
  const { enhanced, reason } = await groqEnhance({ transcription, title });

  const stamp = nowStamp();
  const base = slugify(title) || slugify(path.basename(resolvedImagePath, path.extname(resolvedImagePath))) || 'note';

  const transcriptionPath = path.join(OUT_DIR, `${stamp}_${base}.transcription.txt`);
  const enhancedPath = path.join(OUT_DIR, `${stamp}_${base}.enhanced.txt`);

  fs.writeFileSync(transcriptionPath, transcription.trim() + '\n', 'utf8');

  const enhancedOut = enhanced
    ? enhanced
    : `ENHANCEMENT_SKIPPED\nReason: ${reason || 'Unknown'}\n\n${transcription}`;

  fs.writeFileSync(enhancedPath, enhancedOut.trim() + '\n', 'utf8');

  const header = `\n\n===== NOTE ${stamp} | ${title || base} =====\n`;
  fs.appendFileSync(MASTER_ENHANCED_FILE, header + enhancedOut.trim() + '\n', 'utf8');

  console.log(`✅ Saved transcription: ${transcriptionPath}`);
  console.log(`✅ Saved enhanced:      ${enhancedPath}`);
  console.log(`➕ Appended to master:  ${MASTER_ENHANCED_FILE}`);
}

main().catch((e) => {
  console.error('❌ Failed:', e?.message || e);
  process.exitCode = 1;
});
