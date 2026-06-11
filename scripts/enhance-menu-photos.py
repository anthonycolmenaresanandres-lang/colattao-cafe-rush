# One-off: consistent enhancement pass for the 2026-06-11 pastry product photos.
# Same parameters for every image so the set reads as shot/edited together.
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

FOLDER = Path(r"C:\Users\antho\OneDrive\Desktop\Colattao Rush\public\assets\colattao\menu-items")
FILES = [
    "almond-croissant-photo.jpg",
    "cheese-danish-photo.jpg",
    "chocolate-croissant-photo.jpg",
    "pan-de-bono-photo.jpg",
    "spinach-feta-photo.jpg",
]

# Gentle warm-up: lift red, trim blue slightly. Kept subtle so the
# blue-and-white ceramic plates stay true to color.
WARM_R, WARM_G, WARM_B = 1.035, 1.0, 0.965

for name in FILES:
    path = FOLDER / name
    img = Image.open(path).convert("RGB")
    w, h = img.size

    # 1. Fix flatness: clip 0.5% off both ends of the histogram
    img = ImageOps.autocontrast(img, cutoff=0.5)

    # 2. Warm color balance
    r, g, b = img.split()
    r = r.point(lambda v: min(255, int(v * WARM_R)))
    b = b.point(lambda v: min(255, int(v * WARM_B)))
    img = Image.merge("RGB", (r, g, b))

    # 3. Exposure / contrast / saturation lift
    img = ImageEnhance.Brightness(img).enhance(1.05)
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Color(img).enhance(1.12)

    # 4. Sharpen
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=3))

    assert img.size == (w, h)
    img.save(path, "JPEG", quality=90, optimize=True)
    print(f"enhanced {name} ({w}x{h}, {path.stat().st_size // 1024} KB)")

print("done")
