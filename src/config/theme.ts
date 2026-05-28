/**
 * Master theme config — single source of truth for the white-label
 * Café Rush template.
 *
 * Phase 1 (this file): define the shape and export the current Colattao
 * values. No pages or Phaser scenes consume this yet — that refactor
 * comes in a later pass.
 *
 * Privacy:
 *   No personal customer data is collected by this app. Vercel Web
 *   Analytics may provide anonymized traffic insights without cookies.
 */

// ─── Interfaces ────────────────────────────────────────────────────────

export interface BrandConfig {
  /** Internal slug (lowercase, no spaces). e.g. "colattao". */
  name: string;
  /** User-facing display name. e.g. "Colattao Coffee House". */
  displayName: string;
  /** Primary brand color (hex). Used for major brand accents. */
  primaryColor: string;
  /** Secondary brand color (hex). Used for supporting accents. */
  secondaryColor: string;
  /** Page background base color (hex). */
  backgroundColor: string;
  /** Default body / foreground text color (hex). */
  textColor: string;
  /** Highlight color used for callouts, foam, soft glows (hex). */
  accentColor: string;
  /** CSS font-family string for headings (serif preferred). */
  fontHeading: string;
  /** CSS font-family string for body / UI (sans preferred). */
  fontBody: string;
  /** Public path to the brand logo image (PNG/SVG). */
  logoPath: string;
}

export interface GameAssetsConfig {
  /** Path to the player avatar or basket art (if used). */
  player: string;
  /** Good catchable items shown during gameplay. */
  goodItems: string[];
  /** Bad / instant-loss items shown during gameplay. */
  badItems: string[];
  /** Background scene image used inside the Phaser canvas. */
  background: string;
}

export interface GameCopyConfig {
  /** Headline shown on the post-win Pass Earned card. */
  winMessage: string;
  /** Special line shown when a counted milestone (e.g. 100th loss) is hit. */
  milestoneLossMessage: string;
  /** Pool of rotating bad-tap loss messages. */
  lossMessages: string[];
}

export interface GameConfig {
  /** Hero title rendered on the game screen. */
  title: string;
  /** Subtitle / tagline rendered under the title. */
  subtitle: string;
  assets: GameAssetsConfig;
  copy: GameCopyConfig;
}

export interface UiConfig {
  playButtonText: string;
  playAgainButtonText: string;
  menuButtonText: string;
  presentationButtonText: string;
  feedbackButtonText: string;
  /** Short disclaimer used near feedback / data-handling surfaces. */
  privacyDisclaimerText: string;
}

export interface ThemeConfig {
  brand: BrandConfig;
  game: GameConfig;
  ui: UiConfig;
}

// ─── Default Colattao theme ────────────────────────────────────────────

export const appTheme: ThemeConfig = {
  brand: {
    name: "colattao",
    displayName: "Colattao Coffee House",
    primaryColor: "#1B0E08",      // espresso
    secondaryColor: "#B45309",    // terracotta
    backgroundColor: "#1B0E08",   // espresso page shell
    textColor: "#F5E9D0",         // parchment
    accentColor: "#D4A24C",       // soft gold
    fontHeading: '"Playfair Display", Georgia, "Times New Roman", serif',
    fontBody: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    logoPath: "/assets/colattao/logo/colattao-logo.png",
  },

  game: {
    title: "Café Rush",
    subtitle: "Catch the treats. Avoid the chain.",
    assets: {
      // TODO: verify asset path — no dedicated "player" sprite today; the
      // current build uses tap-on-falling-items mechanics without an avatar.
      player: "/assets/colattao/logo/colattao-logo.png",
      goodItems: [
        "/assets/colattao/items/coffee-cup.png",
        "/assets/colattao/items/croissant.png",
        "/assets/colattao/items/matcha-iced.png",
      ],
      badItems: [
        "/assets/colattao/items/seafarers-bad.png",
      ],
      background: "/assets/colattao/backgrounds/colattao-bg.png",
    },
    copy: {
      winMessage: "You brewed greatness.",
      milestoneLossMessage:
        "100 losses? At this point, the chain coffee has a rewards program for you.",
      // Source of truth for the rotating bad-tap lines lives in
      // src/game/scenes/DemoScene.ts (LOSS_MESSAGES). Mirrored here so
      // the white-label config exposes the same vocabulary.
      lossMessages: [
        "That cup had no soul.",
        "Abuela just sighed from another continent.",
        "The cafecito wept softly.",
        "Even the beans are embarrassed.",
        "That's not coffee. That's a confession.",
        "The chain wins this round. Barely.",
        "Tía would have caught that.",
        "The roaster is shaking its head.",
        "You owe the beans an apology.",
        "Pour one out for that lost shot.",
        "Even decaf wouldn't make that mistake.",
        "The crema deserved better.",
        "Your tastebuds called HR.",
        "That brew had your number.",
        "The espresso machine just unsubscribed.",
        "Abuela's spoon is rattling in the cup.",
        "The barista is praying for you.",
        "The chain coffee just smirked.",
        "Even drip coffee felt that.",
        "Your palate clocked out early.",
        "The roastery is in mourning.",
        "Pour out a cafecito for that one.",
        "Even the steamed milk gasped.",
        "The grinder paused in respect.",
        "The Colombian highlands felt that miss.",
        "Your tongue filed a complaint.",
        "The crema refuses to comment.",
        "Even the cup handle backed away.",
        "The mochila just slipped off your shoulder.",
        "The beans are unionizing against you.",
      ],
    },
  },

  ui: {
    playButtonText: "Begin",
    playAgainButtonText: "Play Again",
    menuButtonText: "Ver menú",
    presentationButtonText: "Ver presentación",
    feedbackButtonText: "Enviar comentario",
    privacyDisclaimerText:
      "No personal customer data is collected by this app. Vercel Web Analytics may provide anonymized traffic insights without cookies.",
  },
};

export default appTheme;
