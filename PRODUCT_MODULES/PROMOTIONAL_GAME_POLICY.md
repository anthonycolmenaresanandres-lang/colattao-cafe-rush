# Promotional Game Policy

This policy applies to Fina Calle, AMMA, Colattao, and future client games built from this system.

Core rule:

> Every game must entertain first, but sell quietly through repetition, reward, product visibility, and menu conversion.

## Purpose

Promotional games are interactive brand material. Their first job is to be fun enough that a guest wants to play, replay, and share. Their business job is to increase desire for real products, seasonal offers, QR/menu engagement, Instagram follows, and customer conversion without feeling like an ad.

## Product-First Design

- Put real client products in the play loop, reward loop, art direction, and post-game surfaces.
- Use product names, colors, textures, and seasonal visuals repeatedly but naturally.
- Make food and drink assets appetizing, legible, and brand-consistent.
- Keep the client brand dominant; Fina Calle/AMMA stays present as the system builder, not the hero.
- Prefer actual menu items and approved seasonal campaign products over generic collectibles.

## Seasonal Campaign Loop

Each game campaign should map to a live or planned business push:

- Seasonal drink, plate, pastry, or offer.
- Matching game assets and background mood.
- Menu page placement for the same products.
- Instagram/social prompt connected to the campaign.
- Reward or post-game CTA that points guests back to the menu or in-store behavior.

The loop is:

1. Guest sees QR or menu.
2. Guest plays.
3. Products repeat visually during play.
4. Reward reinforces the brand and product.
5. Guest is guided back to menu, visit, share, follow, or order intent.

## Approved Asset Sources

Use approved, project-local, or explicitly provided sources:

- Client-approved logos and brand marks.
- Current menu images and product cutouts.
- Seasonal campaign posters, banners, and derived assets.
- Existing game protocol docs, including `PRODUCT_MODULES/COLATTAO_GAME_BACKGROUND_PROTOCOL.md`.
- Repo asset folders under `public/assets/<client-slug>/...`.
- Documented external source folders approved in workflow notes.

Do not use random stock, unrelated AI output, or inconsistent brand art when approved client material exists.

## Soft-Selling Mechanics

Good promotional mechanics sell through context, not pressure:

- Repeated product visibility during play.
- Collecting or catching real menu items.
- Product-specific levels or themes.
- Seasonal background props that preserve gameplay readability.
- Post-game reward copy that names the product or brand.
- Gentle Instagram and menu CTAs after play.
- Menu deep-links from campaign surfaces.

The game should feel like a branded experience first and an ad second.

## Reward/Menu Conversion

Rewards should create action without overpromising:

- Use clear, honest reward language.
- Keep reward redemption simple and owner-approved.
- Connect rewards to menu browsing, in-store asking, QR scanning, or social following.
- Prefer "show this" or "ask staff" style claims unless backend validation exists.
- Do not imply payment, inventory, loyalty account, saved profile, or automatic redemption unless implemented.

## What Not To Do

- Do not make the game a hard-sell pop-up.
- Do not bury gameplay under ads, forced follows, or fake urgency.
- Do not add fake counts, fake saved items, fake user profiles, fake dashboards, or fake analytics.
- Do not invent prices, discounts, menu items, reward terms, or product availability.
- Do not change gameplay geometry when only campaign art is changing.
- Do not add auth, payments, database, Stripe/Square, storage, or tracking unless a separate approved implementation task requires it.
- Do not let Fina Calle/AMMA branding overpower the client brand in customer-facing game or menu surfaces.

## Implementation Guardrail

When changing a promotional game, separate these work types:

- Campaign policy or prompt updates: docs only.
- Asset swaps: preserve filenames and gameplay-safe geometry when possible.
- Gameplay changes: explicit task only.
- Menu conversion: use real links, real menu surfaces, and existing approved routes.

If the task is only campaign or asset work, do not modify mechanics.
