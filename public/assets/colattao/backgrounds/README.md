# Colattao Game Backgrounds

Background replacements for Colattao Rush must follow the game background protocol:

- Canvas must be `941x1672`.
- Center gameplay lane must stay visually clear: `x225-725 y100-1450`.
- Props stay on the perimeter.
- Replacements should preserve the same geometry even when the theme changes.
- File swaps should not require gameplay code changes unless filenames or asset paths change.

Source of truth:

- `PRODUCT_MODULES/COLATTAO_GAME_BACKGROUND_PROTOCOL.md`
- `src/config/colattaoGameBackgroundProtocol.ts`
- `PROMPTS/COLATTAO_BG_SWAP_PROMPT.md`
