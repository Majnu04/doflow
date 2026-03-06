from PyPDF2 import PdfReader
import re

pdf_path = r"e:\doflow-main\doflow-main\public\python doflow.pdf"
r = PdfReader(pdf_path)

KEYWORDS = [
    "TUPLE", "SET", "DICTIONARY", "DICT", "LIST", "FUNCTION", "LAMBDA",
    "MODULE", "PACKAGE", "OOPS", "CLASS", "INHERITANCE", "POLYMORPHISM",
    "ENCAPSULATION", "ABSTRACTION", "EXCEPTION", "TRY", "FINALLY",
    "FILE", "PICKLE", "SERIALIZATION", "REGULAR EXPRESSION", "REGEX",
    "THREAD", "MULTITHREAD", "GENERATOR", "DECORATOR", "ITERATOR",
    "COMPREHENSION", "SLICING", "OPERATOR", "STRING", "INPUT", "OUTPUT",
    "CONTROL FLOW", "IF", "FOR", "WHILE", "BREAK", "CONTINUE",
]

# map keyword -> first page
first = {k: None for k in KEYWORDS}

for page_index, page in enumerate(r.pages, start=1):
    text = (page.extract_text() or "").upper()
    if not text.strip():
        continue
    for k in KEYWORDS:
        if first[k] is None and k in text:
            first[k] = page_index

print("Keyword first-occurrence pages:")
for k in KEYWORDS:
    if first[k] is not None:
        print(f"- {k}: p.{first[k]}")

# Also: find some likely section title lines by exact matches
CANDIDATE_TITLES = [
    "LANGUAGE FUNDAMENTALS",
    "OPERATORS",
    "FLOW CONTROL",
    "STRING",
    "DATA STRUCTURE",
    "LIST",
    "TUPLE",
    "SET",
    "DICTIONARY",
    "FUNCTIONS",
    "MODULES",
    "PACKAGES",
    "OOPS",
    "EXCEPTION HANDLING",
    "FILE HANDLING",
    "REGULAR EXPRESSIONS",
    "MULTI THREADING",
    "PYTHON LOGGING",
]

print("\nExact-title probe (first page containing phrase):")
for title in CANDIDATE_TITLES:
    found = None
    for page_index, page in enumerate(r.pages, start=1):
        text = (page.extract_text() or "").upper()
        if title in text:
            found = page_index
            break
    if found:
        print(f"- {title}: p.{found}")
