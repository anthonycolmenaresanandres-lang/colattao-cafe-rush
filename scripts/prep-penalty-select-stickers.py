# One-off: prepare the front-facing character-select stickers for Penalty Rush.
# - char-10-churro-forward.png ships with a tan rounded-card backdrop; flood-fill
#   it away from the edges so all three characters are clean die-cuts.
# - Trim each to its content bounding box and export as compact webp.
from collections import deque
from pathlib import Path
from PIL import Image
import numpy as np

FOLDER = Path(r"C:\Users\antho\OneDrive\Desktop\Colattao Rush\public\assets\colattao\penalty")
OUT = {
    "char-10-churro-forward.png": "select-churro-v1.webp",
    "char-11-cappuccino-forward.png": "select-cappuccino-v1.webp",
    "char-12-matcha-forward.png": "select-matcha-v1.webp",
}
TARGET_H = 640

def remove_card_backdrop(img: Image.Image) -> Image.Image:
    """Flood-fill from the edges across near-uniform backdrop pixels -> alpha 0.
    The white die-cut outline differs enough from the tan card to stop the fill."""
    arr = np.array(img)
    rgb = arr[..., :3].astype(int)
    alpha = arr[..., 3]
    h, w = alpha.shape

    # Sample the backdrop color from opaque pixels in the top corners.
    samples = [rgb[y, x] for y, x in [(2, 2), (2, w - 3), (40, 2), (40, w - 3)] if alpha[y, x] > 0]
    if not samples:
        return img  # already fully transparent at edges
    bg = np.mean(samples, axis=0)

    tol = 42
    is_bg = (np.abs(rgb - bg).sum(axis=2) < tol * 3) & (alpha > 0)

    visited = np.zeros((h, w), dtype=bool)
    queue = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg[y, x] and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg[y, x] and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

    alpha = alpha.copy()
    alpha[visited] = 0
    arr[..., 3] = alpha
    return Image.fromarray(arr)

for src, dst in OUT.items():
    img = Image.open(FOLDER / src).convert("RGBA")
    if "churro" in src:
        img = remove_card_backdrop(img)
    bbox = img.getchannel("A").getbbox()
    img = img.crop(bbox)
    if img.height > TARGET_H:
        img = img.resize((round(img.width * TARGET_H / img.height), TARGET_H), Image.LANCZOS)
    img.save(FOLDER / dst, "WEBP", quality=92)
    print(f"{dst}: {img.size}, {(FOLDER / dst).stat().st_size // 1024} KB")

print("done")
