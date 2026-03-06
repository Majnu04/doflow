import argparse
import re
from pathlib import Path

from PyPDF2 import PdfReader


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract a page range from the Python DoFlow PDF into a text file.")
    parser.add_argument("--pdf", required=True, help="Path to PDF")
    parser.add_argument("--start", type=int, required=True, help="Start page (1-based, inclusive)")
    parser.add_argument("--end", type=int, required=True, help="End page (1-based, inclusive)")
    parser.add_argument("--out", required=True, help="Output text file path")
    args = parser.parse_args()

    if args.start < 1 or args.end < args.start:
        raise SystemExit("Invalid range: start must be >= 1 and end must be >= start")

    pdf_path = str(args.pdf)
    reader = PdfReader(pdf_path)
    page_count = len(reader.pages)

    if args.end > page_count:
        raise SystemExit(f"Invalid range: PDF has {page_count} pages, but end={args.end}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    parts: list[str] = []
    for page_num in range(args.start, args.end + 1):
        text = reader.pages[page_num - 1].extract_text() or ""
        text = re.sub(r"[ \t]+", " ", text)
        parts.append(f"\n\n================== PDF PAGE {page_num} ==================\n\n")
        parts.append(text)

    out_path.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
