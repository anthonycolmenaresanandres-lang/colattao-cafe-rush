from __future__ import annotations

from pathlib import Path
from typing import Tuple

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
UI_DIR = ROOT / "public" / "assets" / "colattao" / "ui"


def trim_with_padding(img: Image.Image, pad_px: int = 12) -> Image.Image:
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return rgba

    left, top, right, bottom = bbox
    left = max(0, left - pad_px)
    top = max(0, top - pad_px)
    right = min(rgba.width, right + pad_px)
    bottom = min(rgba.height, bottom + pad_px)
    return rgba.crop((left, top, right, bottom))


def save_webp_under_limit(
    img: Image.Image, out_path: Path, preferred_limit: int = 250_000, hard_limit: int = 500_000
) -> Tuple[int, int, int]:
    quality_steps = [92, 88, 84, 80, 76, 72, 68, 64, 60, 56]
    best = None
    for q in quality_steps:
        img.save(out_path, format="WEBP", quality=q, method=6, lossless=False)
        size = out_path.stat().st_size
        best = (q, size)
        if size <= preferred_limit:
            return q, size, preferred_limit
    if best and best[1] <= hard_limit:
        return best[0], best[1], hard_limit

    # If still too large, reduce dimensions slightly and retry.
    shrink = img
    while best and best[1] > hard_limit and shrink.width > 1200:
        shrink = shrink.resize((int(shrink.width * 0.92), int(shrink.height * 0.92)), Image.Resampling.LANCZOS)
        for q in quality_steps:
            shrink.save(out_path, format="WEBP", quality=q, method=6, lossless=False)
            size = out_path.stat().st_size
            best = (q, size)
            if size <= hard_limit:
                return q, size, hard_limit
    return best[0], best[1], hard_limit


def optimize(src_name: str, out_name: str, pad_px: int = 12) -> None:
    src = UI_DIR / src_name
    out = UI_DIR / out_name
    img = Image.open(src)
    trimmed = trim_with_padding(img, pad_px=pad_px)
    q, size, target = save_webp_under_limit(trimmed, out)
    print(f"{src.name} -> {out.name} | {trimmed.width}x{trimmed.height} | q={q} | {size} bytes | target<={target}")


if __name__ == "__main__":
    optimize("play-colattao-cafe-rush-banner.png", "play-colattao-cafe-rush-banner.webp", pad_px=12)
    optimize(
        "colattao-fina-calle-footer-banner.png",
        "colattao-fina-calle-footer-banner.webp",
        pad_px=12,
    )
