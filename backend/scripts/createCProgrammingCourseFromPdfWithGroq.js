import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const PDF_FILENAME = 'C language written notes by jenny.pdf';
const DEFAULT_COURSE_TITLE = 'C Programming';
const DEFAULT_COURSE_TAG = 'c-programming-notes-jenny';

const resolveGroqKey = () => process.env.GROQ_API_KEY || process.env.GORK_API_KEY;

function safeJsonParse(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (match?.[1]) return JSON.parse(match[1]);
    throw new Error('Failed to parse JSON from model response.');
  }
}

function pdfPublicUrl() {
  return `/${encodeURI(PDF_FILENAME)}`;
}

function pageAnchor(page) {
  return `${pdfPublicUrl()}#page=${page}`;
}

async function extractPdfText(pdfPath) {
  const pdfParse = (await import('pdf-parse')).default;
  const bytes = fs.readFileSync(pdfPath);
  const data = await pdfParse(bytes);
  return String(data?.text || '').trim();
}

async function ocrPdfToText(pdfPath, { maxPages } = {}) {
  const bytes = fs.readFileSync(pdfPath);
  const data = new Uint8Array(bytes);

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');
  const { createWorker } = await import('tesseract.js');

  const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pagesToProcess = Math.min(totalPages, maxPages || totalPages);

  const trainedDataDir = process.cwd();
  const trainedDataFile = path.resolve(trainedDataDir, 'eng.traineddata');
  if (!fs.existsSync(trainedDataFile)) {
    throw new Error(
      `Missing OCR language data: ${trainedDataFile}. ` +
        'Expected eng.traineddata to exist in backend/. '
    );
  }

  const worker = await createWorker('eng', undefined, {
    langPath: trainedDataDir,
    gzip: false,
  });

  let out = '';
  const minConf = process.env.OCR_MIN_CONF ? Number(process.env.OCR_MIN_CONF) : 60;

  function wordsToTranscription(words) {
    if (!Array.isArray(words) || words.length === 0) return '';

    const byLine = new Map();
    for (const w of words) {
      const text = String(w?.text || '').trim();
      if (!text) continue;

      const conf = typeof w?.confidence === 'number' ? w.confidence : Number(w?.confidence);
      const safeWord = Number.isFinite(conf) && conf >= minConf ? text : '[unclear]';

      const key = [w.block_num, w.par_num, w.line_num].map((x) => (x ?? 0)).join(':');
      if (!byLine.has(key)) byLine.set(key, []);
      byLine.get(key).push(safeWord);
    }

    const lines = Array.from(byLine.keys())
      .map((k) => ({
        key: k,
        sort: k.split(':').map((n) => Number(n) || 0),
      }))
      .sort((a, b) => (a.sort[0] - b.sort[0]) || (a.sort[1] - b.sort[1]) || (a.sort[2] - b.sort[2]));

    const outLines = [];
    for (const { key } of lines) {
      const parts = (byLine.get(key) || []).filter(Boolean);
      const merged = [];
      for (const p of parts) {
        if (p === '[unclear]' && merged[merged.length - 1] === '[unclear]') continue;
        merged.push(p);
      }
      outLines.push(merged.join(' '));
    }
    return outLines.join('\n').trim();
  }

  for (let pageNum = 1; pageNum <= pagesToProcess; pageNum += 1) {
    console.log(`🧾 OCR page ${pageNum}/${pagesToProcess}...`);
    const page = await pdf.getPage(pageNum);
    const scale = process.env.OCR_SCALE ? Number(process.env.OCR_SCALE) : 2.0;
    const viewport = page.getViewport({ scale });

    const canvasWidth = Math.ceil(viewport.width);
    const canvasHeight = Math.ceil(viewport.height);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;
    const pngBuffer = canvas.toBuffer('image/png');

    const result = await worker.recognize(pngBuffer);
    const dataOut = result?.data || {};
    const transcription = wordsToTranscription(dataOut.words) || String(dataOut.text || '').trim();
    const text = transcription;
    out += `\n\n--- PAGE ${pageNum} ---\n${text}\n`;
  }

  await worker.terminate();
  return out.trim();
}

async function extractPdfTextOrOcr(pdfPath) {
  const extracted = await extractPdfText(pdfPath);
  if (extracted.length >= 1500) return extracted;

  console.log('⚠️ PDF text extraction is tiny; falling back to OCR (this may take a while)...');
  const maxPages = process.env.OCR_MAX_PAGES ? Number(process.env.OCR_MAX_PAGES) : 25;
  return ocrPdfToText(pdfPath, { maxPages });
}

async function groqChatJson({ apiKey, model, system, user, temperature, maxTokens }) {
  let res;
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: typeof temperature === 'number' ? temperature : 0.2,
          ...(typeof maxTokens === 'number' ? { max_tokens: maxTokens } : {}),
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      break;
    } catch (e) {
      lastErr = e;
      const wait = 2000 * attempt;
      await sleep(wait);
    }
  }

  if (!res) {
    throw new Error(`Groq fetch failed after retries: ${String(lastErr?.message || lastErr || 'unknown')}`);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 400)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  return safeJsonParse(content);
}

function splitOcrTextIntoPages(ocrText) {
  const text = String(ocrText || '').replace(/\r\n/g, '\n');
  const re = /--- PAGE (\d+) ---\n/g;
  const matches = Array.from(text.matchAll(re));
  if (matches.length === 0) return [{ page: null, text: text.trim() }];

  const pages = [];
  for (let i = 0; i < matches.length; i += 1) {
    const page = Number(matches[i][1]);
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const chunk = text.slice(start, end).trim();
    pages.push({ page: Number.isFinite(page) ? page : null, text: chunk });
  }
  return pages;
}

function normalizeOcrForLlm(raw, { maxChars } = {}) {
  const limit = Number(maxChars) || 2500;
  const text = String(raw || '').replace(/\r\n/g, '\n');
  const lines = text.split('\n');

  const cleaned = [];
  const seen = new Set();

  for (let line of lines) {
    line = String(line || '').trim();
    if (!line) continue;

    // Strip very weird characters that explode tokenization
    line = line.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');
    line = line.replace(/\s+/g, ' ').trim();
    if (!line) continue;

    // Drop lines that are mostly punctuation/noise
    const letters = (line.match(/[A-Za-z]/g) || []).length;
    const digits = (line.match(/[0-9]/g) || []).length;
    const useful = letters + digits;
    if (useful === 0) continue;
    if (line.length > 180 && useful / line.length < 0.12) continue;

    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(line);
  }

  let out = cleaned.join('\n');

  // Collapse repeated [unclear]
  out = out.replace(/(\[unclear\]\s*){3,}/gi, '[unclear] ');

  if (out.length > limit) out = out.slice(0, limit);
  return out.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mergeSections(existingSections, incomingSections) {
  const existing = Array.isArray(existingSections) ? existingSections : [];
  const incoming = Array.isArray(incomingSections) ? incomingSections : [];

  const byTitle = new Map();
  for (const s of existing) {
    if (!s?.title) continue;
    byTitle.set(String(s.title).trim().toLowerCase(), s);
  }

  for (const s of incoming) {
    const title = String(s?.title || '').trim();
    if (!title) continue;
    const key = title.toLowerCase();
    const existingSection = byTitle.get(key);
    if (!existingSection) {
      existing.push(s);
      byTitle.set(key, s);
      continue;
    }

    const existingLessons = Array.isArray(existingSection.lessons) ? existingSection.lessons : [];
    const incomingLessons = Array.isArray(s.lessons) ? s.lessons : [];
    const lessonTitleSet = new Set(existingLessons.map((l) => String(l?.title || '').trim().toLowerCase()).filter(Boolean));
    for (const l of incomingLessons) {
      const lt = String(l?.title || '').trim();
      if (!lt) continue;
      const lk = lt.toLowerCase();
      if (lessonTitleSet.has(lk)) continue;
      existingLessons.push(l);
      lessonTitleSet.add(lk);
    }
    existingSection.lessons = existingLessons;
  }

  // Normalize orders
  existing.forEach((s, i) => {
    s.order = i + 1;
    if (Array.isArray(s.lessons)) {
      s.lessons.forEach((l, j) => {
        // videoUrl is required by schema; use whitespace placeholder for text-first lessons
        if (!l.videoUrl || !String(l.videoUrl).trim()) l.videoUrl = ' ';
        l.order = j + 1;
        if (typeof l.duration !== 'number' || !Number.isFinite(l.duration)) l.duration = 12;
      });
    }
  });

  return existing;
}

function getOcrCachePath() {
  return path.resolve(process.cwd(), 'scripts', '.cache', 'c_programming_ocr.txt');
}

function readOcrCacheIfPresent() {
  const useCache = process.env.USE_OCR_CACHE ? String(process.env.USE_OCR_CACHE) !== '0' : true;
  if (!useCache) return null;
  const cachePath = getOcrCachePath();
  if (!fs.existsSync(cachePath)) return null;
  try {
    const cached = fs.readFileSync(cachePath, 'utf8');
    const text = String(cached || '').trim();
    return text || null;
  } catch {
    return null;
  }
}

function writeOcrCache(text) {
  const cachePath = getOcrCachePath();
  const dir = path.dirname(cachePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(cachePath, String(text || ''), 'utf8');
}

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI in backend/.env');
    }

    const apiKey = resolveGroqKey();
    if (!apiKey) {
      throw new Error('Missing GROQ_API_KEY (or GORK_API_KEY) in backend/.env');
    }

    const pdfPath = path.resolve(process.cwd(), '..', 'public', PDF_FILENAME);
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF not found: ${pdfPath}`);
    }

    console.log('📄 Extracting text from PDF...');
    const cachedOcr = readOcrCacheIfPresent();
    const pdfText = cachedOcr || (await extractPdfTextOrOcr(pdfPath));
    if (!cachedOcr) {
      try {
        writeOcrCache(pdfText);
        console.log(`💾 Saved OCR cache: ${path.relative(process.cwd(), getOcrCachePath())}`);
      } catch {
        // ignore cache write failures
      }
    } else {
      console.log('💾 Using cached OCR text (USE_OCR_CACHE=1).');
    }

    if (pdfText.length < 1500) {
      throw new Error(
        'Failed to extract enough text from the PDF even after OCR. ' +
          'If this PDF is heavily handwritten/low-contrast, OCR quality may be too low to auto-generate lessons.'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure admin exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        adminUser = await User.findOne({ email: adminEmail });
      }
    }
    if (!adminUser) {
      throw new Error('No admin user found. Run scripts/createAdmin.js once.');
    }

    const system = `You are my course-content writer.
  I will give you raw OCR text from my handwritten notes (page-wise). Some words may appear as [unclear].

  Your job is to create a section-wise course in my same tone.

  Tone + style rules:
  - simple Indian-English like my notes: u, lang, mach, i.e., ex, etc.
  - headings + bullet points + short lines (very readable)
  - beginner friendly but deeper: add missing why/how points
  - NO external links (no GFG/W3Schools/etc)
  - add 1–2 tiny C examples when helpful, include expected output
  - add simple ASCII diagrams/flowcharts as "pictures" when needed
  - keep meaning consistent with the notes (don’t invent new topics)

  Output must be STRICT JSON only (no markdown).`;

    const fullObjectTemplate = `{
  "courseTitle": "C Programming",
  "courseDescription": "...",
  "shortDescription": "...",
  "level": "Beginner",
  "requirements": ["..."],
  "whatYouWillLearn": ["..."],
  "tags": ["c", "c-programming"],
  "sections": [
    {
      "title": "Arrays",
      "lessons": [
        { "title": "...", "content": "...", "pageHint": 12 }
      ]
    }
  ]
}`;

    const sectionsOnlyTemplate = `{
  "sections": [
    {
      "title": "Pointers",
      "lessons": [
        { "title": "...", "content": "...", "pageHint": 25 }
      ]
    }
  ]
}`;

    const allPages = splitOcrTextIntoPages(pdfText);
    let groqInputCharLimit = process.env.GROQ_INPUT_CHAR_LIMIT ? Number(process.env.GROQ_INPUT_CHAR_LIMIT) : 16000;
    let maxPagesPerChunk = process.env.GROQ_PAGES_PER_CHUNK ? Number(process.env.GROQ_PAGES_PER_CHUNK) : 4;

    console.log(`📚 OCR pages detected: ${allPages.length}. Sending to Groq in chunks...`);

    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    // Create or update course (prefer finding by PDF resource URL)
    let course = await Course.findOne({
      'sections.lessons.resources': {
        $elemMatch: {
          url: pdfPublicUrl(),
          type: 'pdf',
        },
      },
    });
    if (!course) {
      course = await Course.findOne({ title: new RegExp(`^${DEFAULT_COURSE_TITLE}$`, 'i') });
    }

    // Ensure a course exists early so we can merge progressively
    if (!course) {
      course = await Course.create({
        title: DEFAULT_COURSE_TITLE,
        description: '',
        shortDescription: '',
        instructor: adminUser._id,
        category: 'Other',
        level: 'Beginner',
        price: 0,
        discountPrice: 0,
        thumbnail: '/images/course-placeholder.svg',
        promoVideo: '',
        sections: [],
        requirements: [],
        whatYouWillLearn: [],
        tags: [DEFAULT_COURSE_TAG, 'c', 'c-programming'],
        language: 'English',
        isPublished: true,
        isFeatured: false,
      });
      console.log('\n✅ C Programming course created (skeleton).');
    }

    let mergedSections = Array.isArray(course.sections) ? course.sections : [];
    let wroteMetadata = Boolean(course.description || course.shortDescription);

    for (let idx = 0; idx < allPages.length; ) {
      const startIdx = idx;

      let attempt = 0;
      let plan;
      let chunkText = '';
      let endIdx = idx;

      // Adaptive retry: shrink chunk if Groq rejects it as too large.
      // Important: do NOT redo OCR; only adjust chunk sizing.
      let tpmHits = 0;
      const maxAttempts = process.env.GROQ_MAX_ATTEMPTS ? Number(process.env.GROQ_MAX_ATTEMPTS) : 30;

      while (!plan) {
        attempt += 1;
        if (attempt > maxAttempts) {
          throw new Error(
            `Groq chunking failed after retries. Set GROQ_INPUT_CHAR_LIMIT lower and retry. ` +
              `(Current GROQ_INPUT_CHAR_LIMIT=${groqInputCharLimit}, GROQ_PAGES_PER_CHUNK=${maxPagesPerChunk})`
          );
        }

        // Build chunk with current limits
        chunkText = '';
        let usedPages = 0;
        endIdx = startIdx;
        while (endIdx < allPages.length && usedPages < maxPagesPerChunk) {
          const p = allPages[endIdx];
          const pageLine = p.page ? `--- PAGE ${p.page} ---\n` : '';
          const next = `${pageLine}${normalizeOcrForLlm(p.text)}\n\n`;
          if (chunkText.length > 0 && chunkText.length + next.length > groqInputCharLimit) break;
          chunkText += next;
          endIdx += 1;
          usedPages += 1;
        }

        if (!chunkText.trim()) {
          // In case a single page is too large, force one page.
          const p = allPages[startIdx];
          chunkText = `${p.page ? `--- PAGE ${p.page} ---\n` : ''}${normalizeOcrForLlm(p.text)}`;
          endIdx = startIdx + 1;
        }

        const existingTitles = mergedSections.map((s) => String(s?.title || '').trim()).filter(Boolean);
        const remainingSlots = Math.max(0, 12 - existingTitles.length);

        const template = wroteMetadata ? sectionsOnlyTemplate : fullObjectTemplate;
        const existingTitlesShort = existingTitles.slice(0, 12);

        const chunkUser = `Create course content ONLY from the pages text.

      Return ONE JSON OBJECT only (top-level must be { }). Never return a JSON array. No markdown.

      Course title must be exactly: ${DEFAULT_COURSE_TITLE}
      Total sections across course: 6 to 12
      No external links.

      Output size limits (important):
      - Max 2 sections in this response.
      - Max 2 lessons per section in this response.
      - If a section already exists, add max 2 new lessons to it.

      Existing section titles (avoid duplicates; add lessons under same title if needed):
      ${existingTitlesShort.length ? existingTitlesShort.join(', ') : '(none yet)'}

      JSON template (follow this shape exactly):
      ${template}

      PAGES TEXT:
      ${chunkText}
      `;

        console.log(`🧠 Groq chunk: pages ${startIdx + 1}-${endIdx} (attempt ${attempt}, limit ${groqInputCharLimit} chars, maxPages ${maxPagesPerChunk})...`);

        try {
          const maxTokens = process.env.GROQ_MAX_TOKENS ? Number(process.env.GROQ_MAX_TOKENS) : 1200;
          plan = await groqChatJson({ apiKey, model, system, user: chunkUser, temperature: 0.1, maxTokens });
        } catch (e) {
          const msg = String(e?.message || e);
          const lower = msg.toLowerCase();
          const isTpmRateLimit =
            lower.includes('tokens per minute') ||
            lower.includes('tpm') ||
            lower.includes('rate_limit_exceeded') ||
            lower.includes('service tier');

          if (isTpmRateLimit) {
            tpmHits += 1;
            const baseWaitMs = process.env.GROQ_TPM_WAIT_MS ? Number(process.env.GROQ_TPM_WAIT_MS) : 70000;
            const waitMs = baseWaitMs + Math.min(90000, tpmHits * 15000);
            console.log(`⏳ Groq TPM limit hit. Waiting ${Math.ceil(waitMs / 1000)}s then retrying...`);
            await sleep(waitMs);
            continue;
          }

          const tooLargePayload = lower.includes('request too large') || (msg.includes('413') && lower.includes('request'));
          if (tooLargePayload) {
            // Shrink and retry
            groqInputCharLimit = Math.max(6000, Math.floor(groqInputCharLimit * 0.7));
            maxPagesPerChunk = Math.max(1, Math.floor(maxPagesPerChunk / 2));
            continue;
          }

          throw e;
        }
      }

      // Commit the chunk consumption
      idx = endIdx;

      if (!wroteMetadata) {
        course.title = DEFAULT_COURSE_TITLE;
        course.description = plan.courseDescription || course.description;
        course.shortDescription = plan.shortDescription || course.shortDescription;
        course.level = plan.level || course.level;
        course.requirements = Array.isArray(plan.requirements) ? plan.requirements : course.requirements;
        course.whatYouWillLearn = Array.isArray(plan.whatYouWillLearn) ? plan.whatYouWillLearn : course.whatYouWillLearn;
        const tags = Array.isArray(plan.tags) ? plan.tags : [];
        course.tags = Array.from(new Set([DEFAULT_COURSE_TAG, 'c', 'c-programming', ...tags]));
        wroteMetadata = true;
      }

      const incomingSections = (plan.sections || []).map((section) => ({
        title: section.title,
        lessons: (section.lessons || []).map((lesson) => {
          const page = typeof lesson.pageHint === 'number' && Number.isFinite(lesson.pageHint) ? Math.max(1, Math.floor(lesson.pageHint)) : null;
          return {
            title: lesson.title,
            description: lesson.content,
            videoUrl: ' ',
            duration: 12,
            isPreview: false,
            resources: [
              { title: 'Original Notes (PDF)', url: pdfPublicUrl(), type: 'pdf' },
              ...(page ? [{ title: `Original Notes (Page ${page})`, url: pageAnchor(page), type: 'pdf' }] : []),
            ],
          };
        }),
      }));

      mergedSections = mergeSections(mergedSections, incomingSections);

      // Persist progress after each successful chunk so we can resume safely.
      course.sections = mergedSections;
      course.isPublished = true;
      course.thumbnail = course.thumbnail || '/images/course-placeholder.svg';
      await course.save();
      console.log(`💾 Saved progress through pages ${startIdx + 1}-${endIdx}`);

      const throttleMs = process.env.GROQ_THROTTLE_MS ? Number(process.env.GROQ_THROTTLE_MS) : 15000;
      if (throttleMs > 0) {
        await sleep(throttleMs);
      }
    }

    // Ensure preview lessons are only first 2 lessons of first section
    if (Array.isArray(mergedSections) && mergedSections.length > 0) {
      mergedSections.forEach((s, si) => {
        if (!Array.isArray(s.lessons)) return;
        s.lessons.forEach((l, li) => {
          l.isPreview = si === 0 && li < 2;
        });
      });
    }

    console.log('\n✅ C Programming course updated successfully!');
    console.log(`   Course ID: ${course._id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   URL: http://localhost:5174/#/course/${course._id}`);
    return;
  } catch (error) {
    console.error('❌ Failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
}

main();
