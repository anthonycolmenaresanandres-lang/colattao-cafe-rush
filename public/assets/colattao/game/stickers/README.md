# Colattao Rush — Seasonal Drink Stickers

Collectible sticker assets for the 3 Matcha Lemonade flavors. The files here are
**placeholders** until final art is approved through a deployed URL.

## Required final filenames (drop-in replacements)
| Flavor | File |
|--------|------|
| Original Matcha Lemonade | `original-sticker.png` |
| Strawberry Matcha Lemonade | `strawberry-sticker.png` |
| Mango Matcha Lemonade | `mango-sticker.png` |

## Art spec
- **512×512**, transparent PNG
- Drink **centered**, **8–10% safe padding** on all sides
- **Die-cut / sticker style** (clean silhouette, subtle outline/shadow ok)
- Reads clearly when scaled down to a small falling sprite

## Where these are used (insertion points)
1. **Falling collectibles** *(not active yet)* — when art is final, point
   `game.assets.goodItems[0..2]` in `src/config/theme.ts` at these 3 files.
   No game-scene code change is needed (DemoScene loads good items by index).
2. **Reward / win UI** *(optional)* — render the earned flavor's sticker in
   `src/components/VisualFlashPass.tsx`.

## Reference, not active
`src/config/theme.ts` exposes `game.assets.seasonalStickers` listing these paths
for reference/wiring. The live `goodItems` are intentionally **unchanged** — the
current game is untouched until final art is approved.
