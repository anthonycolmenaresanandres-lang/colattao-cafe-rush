# One-off: trim vertical white space above/below the plated item in the
# 2026-06-11 pastry product photos. Width is left untouched; only rows that
# are pure light background get cropped, with a uniform margin.
from pathlib import Path
from PIL import Image
import numpy as np

FOLDER = Path(r"C:\Users\antho\OneDrive\Desktop\Colattao Rush\public\assets\colattao\menu-items")
FILES = [
    "almond-croissant-photo.jpg",
    "cheese-danish-photo.jpg",
    "chocolate-croissant-photo.jpg",
    "pan-de-bono-photo.jpg",
    "spinach-feta-photo.jpg",
]

DARK_THRESHOLD = 130   # pixels darker than this = subject (plate rim, food, shadow)
MIN_DARK_PER_ROW = 8   # rows need at least this many dark pixels to count
MARGIN = 48            # breathing room above/below the subject, px

for name in FILES:
    path = FOLDER / name
    img = Image.open(path).convert("RGB")
    w, h = img.size
    gray = np.array(img.convert("L"))

    dark_per_row = (gray < DARK_THRESHOLD).sum(axis=1)
    rows = np.where(dark_per_row >= MIN_DARK_PER_ROW)[0]
    if len(rows) == 0:
        print(f"SKIP {name}: no subject rows detected")
        continue

    top = max(0, int(rows[0]) - MARGIN)
    bottom = min(h, int(rows[-1]) + MARGIN)
    cropped = img.crop((0, top, w, bottom))
    cropped.save(path, "JPEG", quality=90, optimize=True)
    print(f"{name}: {h}px -> {bottom - top}px (rows {top}..{bottom}, removed {h - (bottom - top)}px)")

print("done")
