# Colattao Game Background Protocol

This protocol is the source of truth for replacing the Colattao Rush game background without changing gameplay geometry.

## Canvas

- Size: `941x1672`
- Orientation: portrait
- Background asset path today: `public/assets/colattao/backgrounds/colattao-bg.png`

## Gameplay Lane

Keep the central gameplay lane visually clear:

- `xMin: 225`
- `xMax: 725`
- `yMin: 100`
- `yMax: 1450`

This lane is where falling items must remain readable. It can have dark ambience, soft texture, and mild lighting, but it must not contain busy props, strong contrast clutter, or hero objects.

## Perimeter Zone Layout

Props belong on the perimeter only:

- `TL`: small decor
- `TR`: decor cluster
- `ML`: accent or ingredient
- `BL`: main drink hero
- `MR`: secondary drink or light
- `BR`: food or pastry hero

## Mood

- Dark, readable center
- Warm cafe edges
- Espresso, parchment, cream, and soft gold feel
- Premium Colattao atmosphere

## Core Rule

Swap the theme, preserve the geometry.

Future replacements can change flavor, season, products, props, and mood details, but must preserve:

- `941x1672` portrait canvas
- clear gameplay lane `x225-725 y100-1450`
- perimeter-only props
- same zone logic

Gameplay code should not need to change when the background image changes unless the filename or asset path changes.

## Compact Prompt

Use Colattao BG protocol: 941x1672 portrait; clear gameplay lane x225-725 y100-1450; perimeter props only; TL decor, TR cluster, ML accent, BL hero drink, MR drink/light, BR food; dark readable center; warm cafe edges; preserve geometry.
