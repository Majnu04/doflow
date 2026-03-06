from PyPDF2 import PdfReader
import re
from collections import defaultdict

pdf_path = r"e:\doflow-main\doflow-main\public\python doflow.pdf"
r = PdfReader(pdf_path)
page_count = len(r.pages)
print(f"pages: {page_count}")

def normalize_line(line: str) -> str:
    line = re.sub(r"\s+", " ", line.strip())
    return line

def is_noise(line: str) -> bool:
    if not line:
        return True
    low = line.lower()
    if low.startswith("http") or "youtube.com" in low:
        return True
    if "\\" in line and re.search(r"\b[a-z]:\\\\", low):
        return True
    if ">" in line:
        return True
    if re.search(r"\b[a-z]:\\\\", low):
        return True
    if re.fullmatch(r"\d+", line):
        return True
    if low.startswith("enter ") or low.startswith("hello "):
        return True
    if low.startswith("traceback") or low.startswith("file \""):
        return True
    if "error" in low and ":" in line and len(line) < 60:
        return True
    return False

def looks_like_heading(line: str) -> bool:
    if len(line) < 3 or len(line) > 72:
        return False
    if is_noise(line):
        return False
    # ignore bullet lines
    if line[0] in {"•", "-", "*", "·"}:
        return False
    if re.match(r"^[\(\[]?eg\d*[:\)]", line.strip().lower()):
        return False

    # headings are often ALL CAPS, or short Title Case lines ending with ':'
    words = line.split()
    if len(words) > 10:
        return False

    letters_only = re.sub(r"[^A-Za-z]", "", line)
    if len(letters_only) < 4:
        return False

    all_caps = letters_only.isupper() and sum(c.isalpha() for c in line) >= 6
    ends_colon = line.rstrip().endswith(":")
    titleish = (line[:1].isalpha() and line[:1].isupper()) and ends_colon and len(words) <= 7

    # prefer lines that look like headings with very little punctuation
    punct = re.findall(r"[,:;.!?]", line)
    if len(punct) > 3:
        return False

    return all_caps or titleish


print("\nPreview first 6 pages (for sanity):")
for i in range(0, min(6, page_count)):
    text = r.pages[i].extract_text() or ""
    text = re.sub(r"[ \t]+", " ", text)
    print("\n" + "=" * 20 + f" PAGE {i+1} " + "=" * 20)
    print(text[:1800])


print("\n\nScanning headings across PDF (this may take ~30-60s)...")
heading_pages = defaultdict(list)

for page_index in range(page_count):
    text = r.pages[page_index].extract_text() or ""
    if not text.strip():
        continue
    for raw in text.splitlines():
        line = normalize_line(raw)
        if not line or is_noise(line):
            continue
        if looks_like_heading(line):
            # normalize repeated whitespace and strip trailing ':'
            key = line.rstrip(" :")
            # skip very common non-topic lines
            if key.lower() in {"learn", "complete", "python", "study material", "simple way"}:
                continue
            heading_pages[key].append(page_index + 1)


def score(item):
    heading, pages = item
    # prioritize headings that appear on few pages but look unique, and those in early part
    uniq_pages = sorted(set(pages))
    return (len(uniq_pages), -min(uniq_pages))


items = sorted(heading_pages.items(), key=score, reverse=True)

print("\nTop candidate headings (first page shown):")
shown = 0
seen_lower = set()
for heading, pages in items:
    h = heading.strip()
    low = h.lower()
    if low in seen_lower:
        continue
    seen_lower.add(low)
    uniq_pages = sorted(set(pages))
    # filter out overly generic one-word headings except meaningful ones
    if len(h.split()) == 1 and low not in {"introduction", "operators", "strings", "lists", "tuples", "sets", "dict", "dictionary", "functions", "modules", "oops", "classes", "exceptions"}:
        continue
    # filter out lines that are clearly sentences
    if low.startswith("python is") or low.startswith("we can"):
        continue
    print(f"- {h}  (p.{uniq_pages[0]}{'..' if len(uniq_pages)>1 else ''}{uniq_pages[-1] if len(uniq_pages)>1 else ''}, occurrences={len(uniq_pages)})")
    shown += 1
    if shown >= 80:
        break


print("\nOrdered outline (by first appearance):")
ordered = []
for heading, pages in heading_pages.items():
    uniq_pages = sorted(set(pages))
    ordered.append((uniq_pages[0], heading, len(uniq_pages)))
ordered.sort(key=lambda x: x[0])

shown = 0
seen_lower = set()
for first_page, heading, occ in ordered:
    h = heading.strip()
    low = h.lower()
    if low in seen_lower:
        continue
    seen_lower.add(low)
    if is_noise(h):
        continue
    # Skip mini-subheadings that look like list items
    if re.match(r"^[ivx]+\)\s", low):
        continue
    if low.startswith("conclusion") or low.startswith("alternative"):
        continue
    if low.startswith("syntax:"):
        continue
    if low.startswith("for ") or low.startswith("in "):
        continue
    if "=" in h:
        continue
    print(f"- p.{first_page:>3}: {h} (occurrences={occ})")
    shown += 1
    if shown >= 120:
        break
