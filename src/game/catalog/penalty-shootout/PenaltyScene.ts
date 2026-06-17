import Phaser from "phaser";
import { PENALTY_ASSETS } from "./PenaltyBootScene";

/**
 * Colattao Penalty Rush.
 *
 * Uses the branded art set preloaded by PenaltyBootScene (crowd backdrop,
 * coffee-bean keeper, branded ball, kickers, logo). Any texture that failed to
 * load degrades to the original primitive-drawn shape, so the game never
 * renders broken.
 *
 * Home screen is a retro arcade "SELECT YOUR KICKER" cabinet. The match is a
 * comeback: you start DOWN 0-4 and must score all 5 penalties to win 5-4.
 *
 * No reward flow by design: this title is play-for-fun only (owner decision,
 * 2026-06-11). Do not wire GAME_WON / VisualFlashPass here.
 */

const ESPRESSO = 0x1b0e08;
const ESPRESSO_DEEP = 0x120a04;
const GOLD = 0xdaae4f;
const GOLD_SOFT = 0xe7c77d;
const GOLD_DEEP = 0x9c6b1f;
const CREAM = 0xf8edd7;
const PARCHMENT = 0xf5e9d0;
const NET = 0xffffff;
const GRASS = 0x244a2a;
const GRASS_DEEP = 0x17351f;
const CERAMIC_BLUE = 0x2e5a7c;
const MATCHA_GREEN = 0x3f7a4a;
const PIP_GREEN = 0x8ccf88;
const NEON_RED = 0xc85a3c;

// Text colors (hex strings for Phaser text fills).
const C_CREAM = "#F8EDD7";
const C_GOLD = "#DAAE4F";
const C_GOLD_SOFT = "#E7C77D";
const C_ESPRESSO = "#1B0E08";
const C_PARCHMENT = "#F5E9D0";
const C_NEON_RED = "#C85A3C";
const C_PIP_GREEN = "#8CCF88";

const TOTAL_SHOTS = 5;
const RIVAL_GOALS = 4; // you start the shootout down 0-4; sink all 5 to win 5-4
const ZONES = 5;

// Source art dimensions (background-crowd-signs-v1.webp) and where the
// crowd/pitch boundary sits inside it. Used to plant the goal on the grass.
const BG_W = 941;
const BG_H = 1672;
const BG_PITCH_LINE = 0.485;

// Keeper sprite height as a fraction of the goal height (smaller => more open
// net above the keeper's head). Referenced in both layout() — to keep the feet
// planted on the ground line — and layoutSprites() — to size the sprite.
const KEEPER_GOAL_FILL = 0.7;

// Pixel arcade font (loaded app-wide in src/app/layout.tsx) with a monospace
// fallback so the screen still reads retro if the webfont is slow/unavailable.
const PIXEL_FAMILY = '"Press Start 2P", "Courier New", monospace';

// Selectable kickers. `selectKey` is the front-facing die-cut sticker shown on
// the home screen; `kickerKey` is the matching back-view sprite at the spot;
// `bgKey` is the character's own crowd backdrop (falls back to the default bg
// if its texture is missing). `accent` tints that fighter's roster slot.
const CHARACTERS = [
  {
    name: "CHURRO LATTE #10",
    tag: "#10",
    desc: "Caramel-cinnamon striker. Bends it sticky-sweet.",
    accent: GOLD,
    selectKey: PENALTY_ASSETS.selectChurro.key,
    kickerKey: PENALTY_ASSETS.kicker.key,
    bgKey: PENALTY_ASSETS.bg.key,
  },
  {
    name: "CAPPUCCINO #7",
    tag: "#7",
    desc: "Delft-blue playmaker. Ice in the veins.",
    accent: CERAMIC_BLUE,
    selectKey: PENALTY_ASSETS.selectCappuccino.key,
    kickerKey: PENALTY_ASSETS.kickerCappuccino.key,
    bgKey: PENALTY_ASSETS.bgCappuccino.key,
  },
  {
    name: "MATCHA #9",
    tag: "#9",
    desc: "Iced-green speedster. Zesty footwork, cool nerve.",
    accent: MATCHA_GREEN,
    selectKey: PENALTY_ASSETS.selectMatcha.key,
    kickerKey: PENALTY_ASSETS.kickerMatcha.key,
    bgKey: PENALTY_ASSETS.bgMatcha.key,
  },
] as const;

type GameState = "start" | "playing" | "complete";
type ShotOutcome = "goal" | "saved";
type ShotMark = "hit" | "miss" | null;

export class PenaltyScene extends Phaser.Scene {
  private pitchGfx!: Phaser.GameObjects.Graphics;
  private goalGfx!: Phaser.GameObjects.Graphics;
  private zoneGfx!: Phaser.GameObjects.Graphics;
  private uiGfx!: Phaser.GameObjects.Graphics;
  private overlayGfx!: Phaser.GameObjects.Graphics;
  private frameGfx!: Phaser.GameObjects.Graphics; // retro home cabinet
  private selectorBlinkGfx!: Phaser.GameObjects.Graphics; // blinking focus arrow
  private pipGfx!: Phaser.GameObjects.Graphics; // in-match 5-shot tracker
  private scanlineGfx!: Phaser.GameObjects.Graphics; // CRT scanlines (ambient)
  private vignetteGfx!: Phaser.GameObjects.Graphics; // corner vignette (ambient)

  private bg: Phaser.GameObjects.Image | null = null;
  private logo: Phaser.GameObjects.Image | null = null;
  private kicker: Phaser.GameObjects.Image | null = null;
  private selectCards: Phaser.GameObjects.Image[] = [];
  private selectLabels: Phaser.GameObjects.Text[] = [];
  private selectPromptText!: Phaser.GameObjects.Text;
  private cupText!: Phaser.GameObjects.Text;
  private nameplateText!: Phaser.GameObjects.Text;
  private startHintText!: Phaser.GameObjects.Text;
  private rivalText!: Phaser.GameObjects.Text;
  private youText!: Phaser.GameObjects.Text;
  private startZone?: Phaser.GameObjects.Zone;
  private hasCharacterSelect = false;
  private isStartingRound = false;
  private focusedIndex = 1;
  private currentBgKey: string = PENALTY_ASSETS.bg.key;
  private keeper!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private ball!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private keeperIsSprite = false;
  private ballIsSprite = false;
  private ballBaseScale = 1;
  private pixelTexts: Phaser.GameObjects.Text[] = [];

  private shotText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;
  private subResultText!: Phaser.GameObjects.Text;
  private startTitleText!: Phaser.GameObjects.Text;
  private startBodyText!: Phaser.GameObjects.Text;
  private startCtaText!: Phaser.GameObjects.Text;
  private restartText!: Phaser.GameObjects.Text;

  private goalLeft = 0;
  private goalRight = 0;
  private goalTop = 0;
  private goalHeight = 0;
  private goalLineY = 0;
  private zoneWidth = 0;
  private zoneCenters: number[] = [];
  private ballStartX = 0;
  private ballStartY = 0;

  private shotsTaken = 0;
  private goals = 0;
  private shotResults: ShotMark[] = [null, null, null, null, null];
  private lostRun = false;
  private isShooting = false;
  private state: GameState = "start";
  private keeperSway?: Phaser.Tweens.Tween;
  private selectorBlinkTween?: Phaser.Tweens.Tween;
  private startHintTween?: Phaser.Tweens.Tween;

  constructor() {
    super("PenaltyScene");
  }

  create() {
    if (this.textures.exists(PENALTY_ASSETS.bg.key)) {
      this.bg = this.add.image(0, 0, PENALTY_ASSETS.bg.key).setOrigin(0, 0).setDepth(0);
    }

    this.pitchGfx = this.add.graphics().setDepth(1);
    this.goalGfx = this.add.graphics().setDepth(2);
    this.zoneGfx = this.add.graphics().setDepth(3);
    this.uiGfx = this.add.graphics().setDepth(18);
    this.pipGfx = this.add.graphics().setDepth(20);
    this.overlayGfx = this.add.graphics().setDepth(45);
    this.frameGfx = this.add.graphics().setDepth(46);
    this.selectorBlinkGfx = this.add.graphics().setDepth(53);
    this.scanlineGfx = this.add.graphics().setDepth(59).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.vignetteGfx = this.add.graphics().setDepth(60);

    if (this.textures.exists(PENALTY_ASSETS.kicker.key)) {
      this.kicker = this.add
        .image(0, 0, PENALTY_ASSETS.kicker.key)
        .setOrigin(0.5, 1)
        .setDepth(11);
    }

    this.keeperIsSprite = this.textures.exists(PENALTY_ASSETS.keeper.key);
    if (this.keeperIsSprite) {
      this.keeper = this.add
        .image(0, 0, PENALTY_ASSETS.keeper.key)
        .setOrigin(0.5, 0.86)
        .setDepth(9);
    } else {
      this.keeper = this.add.graphics();
      this.drawKeeperShape();
    }

    this.ballIsSprite = this.textures.exists(PENALTY_ASSETS.ball.key);
    if (this.ballIsSprite) {
      this.ball = this.add.image(0, 0, PENALTY_ASSETS.ball.key).setDepth(12);
    } else {
      this.ball = this.add.graphics();
      this.drawBallShape();
    }

    if (this.textures.exists(PENALTY_ASSETS.logo.key)) {
      this.logo = this.add
        .image(0, 0, PENALTY_ASSETS.logo.key)
        .setAlpha(0)
        .setDepth(50);
    }

    // Character select: needs every front-facing sticker plus the matching
    // back-view kicker sprite. Missing any -> classic "tap to start" screen.
    this.hasCharacterSelect =
      !!this.kicker &&
      CHARACTERS.every(
        (c) => this.textures.exists(c.selectKey) && this.textures.exists(c.kickerKey),
      );

    // ---- In-match HUD (RIVAL 4 / YOU n / SHOT k/5) ----
    this.rivalText = this.makeText(`RIVAL ${RIVAL_GOALS}`, 11, C_NEON_RED, "normal", "pixel")
      .setOrigin(0, 0.5)
      .setAlpha(0)
      .setDepth(20);
    this.youText = this.makeText("YOU 0", 11, C_CREAM, "normal", "pixel")
      .setOrigin(1, 0.5)
      .setAlpha(0)
      .setDepth(20);
    this.shotText = this.makeText("", 8, C_GOLD, "normal", "pixel").setAlpha(0).setDepth(20);

    this.instructionText = this.makeText("", 13, C_CREAM, "bold").setDepth(20);
    this.resultText = this.makeText("", 22, C_CREAM, "normal", "pixel")
      .setAlpha(0)
      .setDepth(48);
    this.subResultText = this.makeText("", 13, C_CREAM, "normal").setAlpha(0).setDepth(48);

    // ---- Home cabinet texts ----
    this.startTitleText = this.makeText(
      this.hasCharacterSelect ? "SELECT YOUR KICKER" : "PENALTY RUSH",
      this.hasCharacterSelect ? 13 : 22,
      C_CREAM,
      "normal",
      "pixel",
    )
      .setAlpha(0)
      .setDepth(50);
    this.startTitleText.setStroke(C_ESPRESSO, 4);

    this.cupText = this.makeText(
      this.hasCharacterSelect ? "COLATTAO SUMMER CUP" : "SUMMER CUP 2026",
      this.hasCharacterSelect ? 7 : 9,
      C_GOLD,
      "normal",
      "pixel",
    )
      .setAlpha(0)
      .setDepth(50);

    // Comeback banner (two pixel lines on a red bar).
    this.selectPromptText = this.makeText("DOWN 0-4\nSINK ALL 5 TO WIN", 9, C_CREAM, "normal", "pixel")
      .setAlpha(0)
      .setDepth(50);

    this.nameplateText = this.makeText("", 12, C_CREAM, "normal", "pixel").setAlpha(0).setDepth(50);

    if (this.hasCharacterSelect) {
      CHARACTERS.forEach((character, idx) => {
        const card = this.add
          .image(0, 0, character.selectKey)
          .setOrigin(0.5, 1)
          .setAlpha(0)
          .setDepth(50)
          .setInteractive({ useHandCursor: true });
        card.on("pointerdown", () => this.onCharacterPicked(idx));
        this.selectCards.push(card);
        this.selectLabels.push(
          this.makeText(character.tag, 9, C_GOLD, "normal", "pixel").setAlpha(0).setDepth(51),
        );
      });

      // Invisible START hit zone over the pill (repositioned in layout).
      this.startZone = this.add
        .zone(0, 0, 10, 10)
        .setOrigin(0.5)
        .setDepth(52)
        .setInteractive({ useHandCursor: true });
      this.startZone.on("pointerdown", () => {
        if (this.state === "start" && this.hasCharacterSelect) this.confirmFocused();
      });
    }

    // Focused-kicker description (cabinet) / rules (classic fallback).
    this.startBodyText = this.makeText(
      this.hasCharacterSelect
        ? ""
        : "Tap a zone in the goal to shoot.\nOutguess the keeper's dive.\nDown 0-4 — sink all 5 to win.",
      this.hasCharacterSelect ? 11 : 14,
      C_GOLD_SOFT,
      "normal",
    )
      .setAlpha(0)
      .setDepth(50);

    this.startCtaText = this.makeText(
      this.hasCharacterSelect ? "START" : "TAP TO START",
      13,
      C_ESPRESSO,
      "normal",
      "pixel",
    )
      .setAlpha(0)
      .setDepth(51);
    this.startHintText = this.makeText("TAP A KICKER TO PICK", 7, C_CREAM, "normal", "pixel")
      .setAlpha(0)
      .setDepth(51);
    this.restartText = this.makeText("PLAY AGAIN", 12, C_ESPRESSO, "normal", "pixel")
      .setAlpha(0)
      .setDepth(51);

    this.layout();
    this.showStartScreen();

    this.input.on("pointerdown", this.onPointerDown, this);
    this.scale.on("resize", this.layout, this);

    // Press Start 2P loads async; re-rasterize the pixel text once it's ready.
    const fonts =
      typeof document !== "undefined"
        ? (document as Document & { fonts?: FontFaceSet }).fonts
        : undefined;
    if (fonts?.ready) {
      fonts.ready
        .then(() => {
          if (!this.sys || !this.sys.isActive()) return;
          for (const t of this.pixelTexts) t.updateText();
          this.layout();
        })
        .catch(() => {});
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.onPointerDown, this);
      this.scale.off("resize", this.layout, this);
      this.stopKeeperSway();
      this.stopHomeBlink();
    });
  }

  private makeText(
    text: string,
    size: number,
    color: string,
    weight: "normal" | "bold" = "normal",
    family: "sans" | "serif" | "pixel" = "sans",
  ) {
    const isPixel = family === "pixel";
    const t = this.add
      .text(0, 0, text, {
        fontFamily:
          isPixel
            ? PIXEL_FAMILY
            : family === "serif"
              ? '"Playfair Display", Georgia, serif'
              : "Inter, system-ui, sans-serif",
        fontSize: `${size}px`,
        color,
        fontStyle: isPixel ? "normal" : weight,
        align: "center",
        lineSpacing: isPixel ? 7 : 6,
      })
      .setOrigin(0.5);
    if (isPixel) {
      t.setResolution(2);
      this.pixelTexts.push(t);
    }
    return t;
  }

  private drawKeeperShape() {
    if (this.keeperIsSprite) return;
    const gfx = this.keeper as Phaser.GameObjects.Graphics;
    const w = 54;
    const h = 70;
    gfx.clear();
    gfx.fillStyle(GOLD, 1);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    gfx.lineStyle(4, ESPRESSO, 1);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    gfx.fillStyle(CREAM, 1);
    gfx.fillCircle(-w / 2 - 3, 0, 9);
    gfx.fillCircle(w / 2 + 3, 0, 9);
    gfx.fillStyle(ESPRESSO, 1);
    gfx.fillCircle(-9, -14, 3);
    gfx.fillCircle(9, -14, 3);
    gfx.setDepth(9);
  }

  private drawBallShape() {
    if (this.ballIsSprite) return;
    const gfx = this.ball as Phaser.GameObjects.Graphics;
    const r = 17;
    gfx.clear();
    gfx.fillStyle(CREAM, 1);
    gfx.fillCircle(0, 0, r);
    gfx.lineStyle(4, GOLD, 1);
    gfx.strokeCircle(0, 0, r);
    gfx.fillStyle(ESPRESSO, 1);
    gfx.fillCircle(0, 0, r * 0.42);
    gfx.lineStyle(2, ESPRESSO, 0.6);
    gfx.lineBetween(-8, -5, 8, 5);
    gfx.setDepth(12);
  }

  private layout() {
    const w = this.scale.width;
    const h = this.scale.height;
    if (w < 10 || h < 10) return;

    const compact = w < 380 || h < 640;
    const goalWidth = Math.min(w * 0.9, 430);
    this.goalLeft = (w - goalWidth) / 2;
    this.goalRight = this.goalLeft + goalWidth;
    this.goalHeight = Math.min(h * (compact ? 0.25 : 0.23), 160);
    // The backdrop's grass line is the ground. Plant the goal's base on it so
    // the posts rise from the turf instead of hovering above it.
    const groundY = h * BG_PITCH_LINE;
    this.goalTop = groundY - this.goalHeight;
    // The keeper sprite is anchored at 0.86 of its height (≈ the feet) and
    // stands KEEPER_GOAL_FILL of the goal height tall. Put the feet on the
    // ground line so the keeper plants on the grass instead of floating above it.
    this.goalLineY = groundY - this.goalHeight * KEEPER_GOAL_FILL * 0.14;

    this.zoneWidth = goalWidth / ZONES;
    this.zoneCenters = Array.from(
      { length: ZONES },
      (_, i) => this.goalLeft + this.zoneWidth * (i + 0.5),
    );

    this.ballStartX = w * 0.7;
    this.ballStartY = h * (compact ? 0.82 : 0.8);

    this.layoutBackground(w, h);
    this.drawPitch(w, h);
    this.drawGoal();
    this.drawZones();
    this.drawScorePanel(w);
    this.layoutSprites(w, h);

    if (!this.isShooting) {
      if (this.state === "playing") {
        this.startKeeperSway();
      } else {
        this.stopKeeperSway();
        this.keeper.setPosition(w / 2, this.goalLineY);
      }
      this.ball.setPosition(this.ballStartX, this.ballStartY);
    }

    // Ambient CRT retro pass (covers every state).
    this.drawScanlines(w, h);
    this.drawVignette(w, h);

    // In-match HUD text positions.
    const panelLeft = Math.max(14, w / 2 - 150);
    const panelRight = Math.min(w - 14, w / 2 + 150);
    this.rivalText.setPosition(Math.round(panelLeft + 14), 26);
    this.youText.setPosition(Math.round(panelRight - 14), 26);
    this.shotText.setPosition(Math.round(w / 2), 47);

    this.instructionText.setPosition(w / 2, this.ballStartY + (compact ? 42 : 50));
    this.resultText.setPosition(w / 2, h * 0.5);
    this.subResultText.setPosition(w / 2, h * 0.5 + 46);

    if (this.state === "start") {
      this.drawStartOverlay();
      if (this.hasCharacterSelect) {
        this.drawHomeCabinet(w, h);
      } else {
        this.logo?.setPosition(w / 2, h * 0.215);
        this.cupText.setPosition(w / 2, h * 0.315);
        this.startTitleText.setPosition(w / 2, h * 0.38);
        this.startBodyText.setPosition(w / 2, h * 0.49);
        this.startCtaText.setPosition(w / 2, h * 0.65);
      }
    } else {
      this.redrawPips(this.pipGfx, w / 2, 61, this.shotResults, Math.min(26, w * 0.07));
    }

    this.restartText.setPosition(w / 2, h * 0.64);
    if (this.state === "complete") this.drawRestartButton();
  }

  /** Cover-fit the crowd backdrop and plant the goal mouth on its grass line. */
  private layoutBackground(w: number, h: number) {
    if (!this.bg) return;
    const scale = Math.max(w / BG_W, h / BG_H);
    const dispW = BG_W * scale;
    const dispH = BG_H * scale;
    const desiredPitchY = this.goalTop + this.goalHeight; // grass meets the base of the posts
    const rawY = desiredPitchY - BG_PITCH_LINE * dispH;
    const y = Phaser.Math.Clamp(rawY, h - dispH, 0);
    this.bg.setDisplaySize(dispW, dispH);
    this.bg.setPosition((w - dispW) / 2, y);
  }

  private layoutSprites(w: number, h: number) {
    if (this.keeperIsSprite) {
      const keeperImg = this.keeper as Phaser.GameObjects.Image;
      const keeperH = this.goalHeight * KEEPER_GOAL_FILL;
      keeperImg.setDisplaySize(keeperH * (876 / 880), keeperH);
    }
    if (this.ballIsSprite) {
      const ballImg = this.ball as Phaser.GameObjects.Image;
      const ballW = Math.max(80, Math.min(108, w * 0.23));
      this.ballBaseScale = ballW / ballImg.width;
      if (!this.isShooting) ballImg.setScale(this.ballBaseScale);
    }
    if (this.kicker) {
      // Fill the green foreground: the striker rises from the bottom of the
      // screen up to the grass line, anchored toward the left (independent of
      // the ball's spot) so the ball and the goal mouth stay readable.
      const groundLineY = h * BG_PITCH_LINE;
      const kickerH = h - groundLineY;
      this.kicker.setDisplaySize(kickerH * (789 / 880), kickerH);
      this.kicker.setPosition(w * 0.32, h);
    }
    if (this.logo) {
      const logoW = Math.min(w * 0.42, 185);
      this.logo.setDisplaySize(logoW, logoW * (884 / 1600));
    }
  }

  private drawPitch(w: number, h: number) {
    this.pitchGfx.clear();
    if (this.bg) return; // photo backdrop covers the pitch
    this.pitchGfx.fillStyle(ESPRESSO_DEEP, 1);
    this.pitchGfx.fillRect(0, 0, w, h);
    this.pitchGfx.fillStyle(GRASS_DEEP, 1);
    this.pitchGfx.fillRect(0, this.goalTop - 18, w, h);
    this.pitchGfx.fillStyle(GRASS, 1);
    this.pitchGfx.fillRect(0, this.goalTop + this.goalHeight, w, h);
    this.pitchGfx.lineStyle(2, CREAM, 0.22);
    this.pitchGfx.strokeCircle(w / 2, this.ballStartY, 34);
    this.pitchGfx.lineStyle(2, CREAM, 0.14);
    this.pitchGfx.lineBetween(0, this.ballStartY + 54, w, this.ballStartY + 54);
  }

  private drawGoal() {
    this.goalGfx.clear();
    this.goalGfx.lineStyle(7, NET, 0.96);
    this.goalGfx.strokeRect(this.goalLeft, this.goalTop, this.goalRight - this.goalLeft, this.goalHeight);
    this.goalGfx.lineStyle(1, NET, 0.28);
    for (let i = 1; i < ZONES * 2; i += 1) {
      const x = this.goalLeft + ((this.goalRight - this.goalLeft) / (ZONES * 2)) * i;
      this.goalGfx.lineBetween(x, this.goalTop, x, this.goalTop + this.goalHeight);
    }
    for (let i = 1; i < 5; i += 1) {
      const y = this.goalTop + (this.goalHeight / 5) * i;
      this.goalGfx.lineBetween(this.goalLeft, y, this.goalRight, y);
    }
  }

  private drawZones() {
    this.zoneGfx.clear();
    for (let i = 0; i < ZONES; i += 1) {
      const x = this.goalLeft + this.zoneWidth * i;
      // Every zone is an equal, tappable target — no risky edges anymore.
      this.zoneGfx.fillStyle(GOLD, 0.16);
      this.zoneGfx.fillRect(x + 3, this.goalTop + 4, this.zoneWidth - 6, this.goalHeight - 8);
      this.zoneGfx.lineStyle(1, GOLD, 0.45);
      this.zoneGfx.strokeRect(x + 3, this.goalTop + 4, this.zoneWidth - 6, this.goalHeight - 8);
    }
  }

  /** Retro in-match scoreboard plate (RIVAL 4 / YOU n / SHOT k/5 + pips). */
  private drawScorePanel(w: number) {
    this.uiGfx.clear();
    const pw = Math.min(300, w - 28);
    const px = Math.max(14, w / 2 - pw / 2);
    this.uiGfx.fillStyle(ESPRESSO, 0.82);
    this.uiGfx.fillRoundedRect(px, 8, pw, 74, 12);
    this.uiGfx.lineStyle(2, GOLD, 0.7);
    this.uiGfx.strokeRoundedRect(px, 8, pw, 74, 12);
    this.uiGfx.lineStyle(1, GOLD_SOFT, 0.5);
    this.uiGfx.strokeRoundedRect(px + 3, 11, pw - 6, 68, 10);
  }

  /** Shared 5-shot pip tracker (hollow = upcoming, green = goal, red X = save). */
  private redrawPips(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    y: number,
    results: ShotMark[],
    spacing: number,
    r = 6,
  ) {
    g.clear();
    const span = (results.length - 1) * spacing;
    const x0 = cx - span / 2;
    results.forEach((res, i) => {
      const x = x0 + i * spacing;
      if (res === "hit") {
        g.fillStyle(PIP_GREEN, 1);
        g.fillCircle(x, y, r);
        g.lineStyle(2, GOLD, 0.9);
        g.strokeCircle(x, y, r);
      } else if (res === "miss") {
        g.fillStyle(NEON_RED, 1);
        g.fillCircle(x, y, r);
        g.lineStyle(2, ESPRESSO, 0.95);
        g.lineBetween(x - r * 0.5, y - r * 0.5, x + r * 0.5, y + r * 0.5);
        g.lineBetween(x - r * 0.5, y + r * 0.5, x + r * 0.5, y - r * 0.5);
      } else {
        g.lineStyle(2, GOLD_SOFT, 0.6);
        g.strokeCircle(x, y, r);
      }
    });
  }

  // ─────────────────────────── retro home cabinet ───────────────────────────

  private drawNeonFrame(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    core: number,
    fillColor = ESPRESSO,
    fillAlpha = 0.5,
  ) {
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(x, y, w, h, r);
    g.lineStyle(4, core, 0.18);
    g.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, r + 2);
    g.lineStyle(2, core, 1);
    g.strokeRoundedRect(x, y, w, h, r);
    g.lineStyle(1, GOLD_SOFT, 0.7);
    g.strokeRoundedRect(x + 3, y + 3, w - 6, h - 6, Math.max(1, r - 2));
  }

  private drawCornerBrackets(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    len: number,
    color: number,
    alpha = 1,
  ) {
    g.lineStyle(2, color, alpha);
    const o = 3;
    g.lineBetween(x + o, y + o, x + o + len, y + o);
    g.lineBetween(x + o, y + o, x + o, y + o + len);
    g.lineBetween(x + w - o, y + o, x + w - o - len, y + o);
    g.lineBetween(x + w - o, y + o, x + w - o, y + o + len);
    g.lineBetween(x + o, y + h - o, x + o + len, y + h - o);
    g.lineBetween(x + o, y + h - o, x + o, y + h - o - len);
    g.lineBetween(x + w - o, y + h - o, x + w - o - len, y + h - o);
    g.lineBetween(x + w - o, y + h - o, x + w - o, y + h - o - len);
  }

  private drawScanlines(w: number, h: number) {
    this.scanlineGfx.clear();
    this.scanlineGfx.lineStyle(1, ESPRESSO_DEEP, 0.14);
    for (let y = 0; y < h; y += 3) {
      this.scanlineGfx.lineBetween(0, y, w, y);
    }
  }

  private drawVignette(w: number, h: number) {
    this.vignetteGfx.clear();
    for (let i = 0; i < 10; i += 1) {
      const a = 0.05 * (1 - i / 10);
      this.vignetteGfx.lineStyle(6, ESPRESSO_DEEP, a);
      this.vignetteGfx.strokeRect(i * 6, i * 6, w - i * 12, h - i * 12);
    }
  }

  private drawHomeCabinet(w: number, h: number) {
    const g = this.frameGfx;
    g.clear();
    const compact = w < 380 || h < 640;

    // Title bar + chrome heading.
    this.drawNeonFrame(g, w * 0.06, h * 0.066, w * 0.88, h * 0.084, 8, GOLD, ESPRESSO, 0.55);
    this.drawCornerBrackets(g, w * 0.06, h * 0.066, w * 0.88, h * 0.084, 12, GOLD, 1);
    this.startTitleText.setPosition(Math.round(w / 2), Math.round(h * 0.094));
    this.cupText.setPosition(Math.round(w / 2), Math.round(h * 0.128));

    // Comeback banner.
    const bY = h * 0.155;
    const bH = h * 0.052;
    g.fillStyle(NEON_RED, 0.92);
    g.fillRect(0, bY, w, bH);
    g.lineStyle(2, GOLD, 0.9);
    g.lineBetween(0, bY, w, bY);
    g.lineBetween(0, bY + bH, w, bY + bH);
    this.selectPromptText.setPosition(Math.round(w / 2), Math.round(bY + bH / 2));

    // Roster slots.
    const slotW = Math.min(w * 0.3, 124);
    const spacing = Math.min(w * 0.31, compact ? 108 : 116);
    const panelTop = h * 0.215;
    const panelBottom = h * 0.545;
    const panelH = panelBottom - panelTop;

    CHARACTERS.forEach((ch, i) => {
      const xC = w / 2 + (i - 1) * spacing;
      const left = xC - slotW / 2;
      const focused = i === this.focusedIndex;

      // 1-bit drop shadow.
      g.fillStyle(ESPRESSO_DEEP, 0.5);
      g.fillRoundedRect(left + 4, panelTop + 4, slotW, panelH, 6);
      // Tinted panel.
      g.fillStyle(ch.accent, 0.2);
      g.fillRoundedRect(left, panelTop, slotW, panelH, 6);
      g.lineStyle(2, GOLD_DEEP, 0.7);
      g.strokeRoundedRect(left, panelTop, slotW, panelH, 6);
      this.drawCornerBrackets(g, left, panelTop, slotW, panelH, 10, GOLD, 0.9);
      // Jersey nameplate.
      g.fillStyle(ESPRESSO, 0.85);
      g.fillRoundedRect(left, panelBottom + 4, slotW, 20, 4);
      g.lineStyle(1, GOLD, 0.6);
      g.strokeRoundedRect(left, panelBottom + 4, slotW, 20, 4);

      // Portrait (undistorted, fit to slot).
      const card = this.selectCards[i];
      const src = this.textures.get(ch.selectKey).getSourceImage() as { width: number; height: number };
      const aspect = src.width / src.height;
      const s = focused ? 1.04 : 1;
      const cardH = Math.min(panelH * 0.86, (slotW * 0.9) / aspect);
      card.setDisplaySize(cardH * aspect * s, cardH * s);
      card.setPosition(xC, panelBottom - 6);
      card.setAlpha(focused ? 1 : 0.55);

      this.selectLabels[i].setPosition(Math.round(xC), Math.round(panelBottom + 14));
    });

    // Selector cursor on the focused slot.
    const fxC = w / 2 + (this.focusedIndex - 1) * spacing;
    const fleft = fxC - slotW / 2;
    g.lineStyle(6, GOLD, 0.18);
    g.strokeRoundedRect(fleft - 3, panelTop - 3, slotW + 6, panelH + 6, 8);
    g.lineStyle(3, GOLD_SOFT, 1);
    g.strokeRoundedRect(fleft, panelTop, slotW, panelH, 6);

    const b = this.selectorBlinkGfx;
    b.clear();
    b.fillStyle(GOLD, 1);
    b.fillTriangle(fxC - 9, panelTop - 16, fxC + 9, panelTop - 16, fxC, panelTop - 4);

    // Big nameplate for the focused fighter (name + description).
    this.drawNeonFrame(g, w * 0.1, h * 0.628, w * 0.8, h * 0.066, 6, GOLD, ESPRESSO, 0.9);
    const fch = CHARACTERS[this.focusedIndex];
    this.nameplateText.setText(fch.name).setPosition(Math.round(w / 2), Math.round(h * 0.648));
    this.startBodyText
      .setText(fch.desc)
      .setWordWrapWidth(w * 0.8 - 16)
      .setPosition(w / 2, h * 0.678);

    // START pill.
    const pillW = 132;
    const pillH = 34;
    const pillX = w / 2 - pillW / 2;
    const pillY = h * 0.726;
    g.fillStyle(GOLD, 1);
    g.fillRoundedRect(pillX, pillY, pillW, pillH, pillH / 2);
    g.lineStyle(2, ESPRESSO, 1);
    g.strokeRoundedRect(pillX, pillY, pillW, pillH, pillH / 2);
    this.startCtaText.setPosition(Math.round(w / 2), Math.round(pillY + pillH / 2));
    this.startHintText.setPosition(Math.round(w / 2), Math.round(h * 0.778));
    this.startZone?.setPosition(w / 2, pillY + pillH / 2).setSize(pillW, pillH);

    // Footer.
    g.lineStyle(1, GOLD_DEEP, 0.5);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.state === "start") {
      // With character select, focus/confirm is handled by the cards + START.
      if (!this.hasCharacterSelect) this.startGame();
      return;
    }
    if (this.state === "complete") {
      this.restart();
      return;
    }
    if (this.isShooting) return;
    this.shoot(pointer.x);
  }

  /** Tapping a kicker focuses it; tapping the focused one (or START) confirms. */
  private onCharacterPicked(idx: number) {
    if (this.state !== "start" || this.isStartingRound) return;
    if (idx !== this.focusedIndex) {
      this.setFocus(idx);
      return;
    }
    this.confirmFocused();
  }

  private setFocus(idx: number) {
    if (idx === this.focusedIndex) return;
    this.focusedIndex = idx;
    this.layout(); // re-snap selector, nameplate, description, card scales
  }

  private confirmFocused() {
    if (this.state !== "start" || this.isStartingRound) return;
    this.isStartingRound = true;
    const idx = this.focusedIndex;
    const character = CHARACTERS[idx];
    (this.kicker as Phaser.GameObjects.Image).setTexture(character.kickerKey);
    // Each character brings their own home crowd.
    this.currentBgKey = this.textures.exists(character.bgKey)
      ? character.bgKey
      : PENALTY_ASSETS.bg.key;

    // Quick pop on the picked card, then kick off.
    this.tweens.add({
      targets: this.selectCards[idx],
      scaleX: this.selectCards[idx].scaleX * 1.12,
      scaleY: this.selectCards[idx].scaleY * 1.12,
      duration: 130,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.isStartingRound = false;
        this.startGame();
      },
    });
  }

  private setHomeVisible(visible: boolean) {
    if (!visible) this.stopHomeBlink();
    const a = visible ? 1 : 0;
    for (const t of [
      this.startTitleText,
      this.cupText,
      this.selectPromptText,
      this.nameplateText,
      this.startBodyText,
      this.startCtaText,
      this.startHintText,
    ]) {
      t.setAlpha(a);
    }
    for (const c of this.selectCards) c.setAlpha(a);
    for (const l of this.selectLabels) l.setAlpha(a);
    if (!visible) {
      this.frameGfx.clear();
      this.selectorBlinkGfx.clear();
    }
  }

  private startHomeBlink() {
    this.stopHomeBlink();
    this.selectorBlinkTween = this.tweens.add({
      targets: this.selectorBlinkGfx,
      alpha: { from: 1, to: 0.35 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.startHintTween = this.tweens.add({
      targets: this.startHintText,
      alpha: { from: 1, to: 0.3 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private stopHomeBlink() {
    this.selectorBlinkTween?.stop();
    this.selectorBlinkTween = undefined;
    this.startHintTween?.stop();
    this.startHintTween = undefined;
    this.selectorBlinkGfx.setAlpha(1);
    this.startHintText.setAlpha(this.state === "start" && this.hasCharacterSelect ? 1 : 0);
  }

  private setHudVisible(visible: boolean) {
    const a = visible ? 1 : 0;
    this.rivalText.setAlpha(a);
    this.youText.setAlpha(a);
    this.shotText.setAlpha(a);
    if (!visible) this.pipGfx.clear();
  }

  private startGame() {
    this.state = "playing";
    this.shotsTaken = 0;
    this.goals = 0;
    this.shotResults = [null, null, null, null, null];
    this.lostRun = false;
    if (this.bg && this.textures.exists(this.currentBgKey)) {
      this.bg.setTexture(this.currentBgKey);
    }
    this.overlayGfx.clear();
    this.setHomeVisible(false);
    this.logo?.setAlpha(0);
    this.setHudVisible(true);
    this.resultText.setAlpha(0);
    this.subResultText.setAlpha(0);
    this.restartText.setAlpha(0);
    this.zoneGfx.setAlpha(1);
    this.keeper.setAlpha(1);
    this.ball.setAlpha(1);
    this.updateScore();
    this.resetForNextShot();
  }

  private shoot(rawTargetX: number) {
    // Discrete, consistent mechanic: the tap picks one of the goal zones (taps
    // outside the frame snap to the nearest end zone, so there are no misses),
    // the keeper dives to a random zone, and you score unless you picked the
    // keeper's zone.
    const playerZone = Phaser.Math.Clamp(
      Math.floor((rawTargetX - this.goalLeft) / this.zoneWidth),
      0,
      ZONES - 1,
    );
    const keeperZone = Phaser.Math.Between(0, ZONES - 1);
    const outcome: ShotOutcome = playerZone === keeperZone ? "saved" : "goal";

    const targetX = this.zoneCenters[playerZone];
    const keeperTargetX = this.zoneCenters[keeperZone];
    // Vary the shot height so shots don't all hug the goal line. Goals can fly
    // into the upper/mid net; saves stay within the keeper's vertical reach so
    // the keeper visibly stops them.
    const heightFrac =
      outcome === "goal"
        ? Phaser.Math.FloatBetween(0.18, 0.5)
        : Phaser.Math.FloatBetween(0.36, 0.58);
    const targetY = this.goalTop + this.goalHeight * heightFrac;

    this.isShooting = true;
    this.instructionText.setText("Shot in motion...");
    this.resultText.setAlpha(0);
    this.subResultText.setAlpha(0);

    // Kicker recoils with a quick shake on the strike (pivots at the feet).
    if (this.kicker) {
      this.kicker.setAngle(0);
      this.tweens.add({
        targets: this.kicker,
        angle: { from: -1.5, to: 1.5 },
        duration: 45,
        yoyo: true,
        repeat: 1,
        ease: "Sine.easeInOut",
        onComplete: () => this.kicker?.setAngle(0),
      });
    }

    // Keeper stops its idle sway and dives to the chosen zone.
    this.stopKeeperSway();
    this.tweens.add({
      targets: this.keeper,
      x: keeperTargetX,
      duration: 380,
      ease: "Quad.easeOut",
    });

    this.tweens.add({
      targets: this.ball,
      x: targetX,
      y: targetY,
      scale: 0.72 * this.ballBaseScale,
      duration: 420,
      ease: "Quad.easeIn",
      onComplete: () => this.resolveShot(outcome),
    });
  }

  private resolveShot(outcome: ShotOutcome) {
    this.shotResults[this.shotsTaken] = outcome === "goal" ? "hit" : "miss";
    this.shotsTaken += 1;
    if (outcome === "goal") this.goals += 1;
    else this.lostRun = true;
    this.updateScore();

    const scored = outcome === "goal";
    const text = scored ? "GOAL!" : "SAVED!";
    const color = scored ? C_PIP_GREEN : C_NEON_RED;
    const subtext = scored
      ? "Clean strike. The keeper guessed wrong."
      : "Keeper guessed your zone.";

    this.flashResult(text, color, subtext);

    this.time.delayedCall(1180, () => {
      if (this.shotsTaken >= TOTAL_SHOTS) {
        this.endGame();
      } else {
        this.resetForNextShot();
      }
    });
  }

  private flashResult(text: string, color: string, subtext: string) {
    this.resultText.setText(text).setColor(color).setAlpha(1).setScale(0.72);
    this.subResultText.setText(subtext).setAlpha(1);
    this.tweens.add({
      targets: this.resultText,
      scale: 1,
      duration: 220,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: [this.resultText, this.subResultText],
      alpha: 0,
      delay: 850,
      duration: 280,
    });
  }

  /** Goalkeeper idle bob: sways side to side along the line between shots. */
  private startKeeperSway() {
    this.stopKeeperSway();
    const centerX = this.scale.width / 2;
    const amp = this.zoneWidth * 0.7;
    this.keeper.setPosition(centerX - amp, this.goalLineY);
    this.keeperSway = this.tweens.add({
      targets: this.keeper,
      x: centerX + amp,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private stopKeeperSway() {
    this.keeperSway?.stop();
    this.keeperSway = undefined;
  }

  private resetForNextShot() {
    this.isShooting = false;
    this.ball.setScale(this.ballIsSprite ? this.ballBaseScale : 1);
    this.ball.setPosition(this.ballStartX, this.ballStartY);
    this.startKeeperSway();
    this.instructionText.setText("Tap a corner. Beat the keeper. Perfect 5 or nada.");
  }

  private endGame() {
    const won = this.goals === TOTAL_SHOTS;
    this.state = "complete";
    this.isShooting = false;
    this.ball.setScale(this.ballIsSprite ? this.ballBaseScale : 1);
    this.instructionText.setText("");
    // Keep the stadium crowd backdrop on the win screen (no café-art revert).
    this.overlayGfx.clear();
    this.drawRestartButton();
    this.resultText
      .setText(won ? "REMONTADA!" : "TRY AGAIN")
      .setColor(won ? C_PIP_GREEN : C_NEON_RED)
      .setAlpha(1)
      .setScale(1);
    this.subResultText
      .setText(
        won
          ? "5-4. Cinco de cinco. Cafe comeback complete."
          : "One miss ends it. Reset and run it back.",
      )
      .setColor(C_CREAM)
      .setAlpha(1);
    this.restartText.setAlpha(1);
    this.updateScore();
  }

  private restart() {
    this.overlayGfx.clear();
    this.restartText.setAlpha(0);
    // Home screen is the character select — return there between rounds.
    if (this.hasCharacterSelect) {
      this.resultText.setAlpha(0);
      this.subResultText.setAlpha(0);
      this.currentBgKey = PENALTY_ASSETS.bg.key;
      if (this.bg && this.textures.exists(this.currentBgKey)) {
        this.bg.setTexture(this.currentBgKey);
      }
      this.showStartScreen();
    } else {
      this.startGame();
    }
  }

  private showStartScreen() {
    this.state = "start";
    this.shotsTaken = 0;
    this.goals = 0;
    this.shotResults = [null, null, null, null, null];
    this.lostRun = false;
    this.setHudVisible(false);
    this.updateScore();
    this.instructionText.setText("");
    this.resultText.setAlpha(0);
    this.subResultText.setAlpha(0);
    this.restartText.setAlpha(0);
    this.zoneGfx.setAlpha(0.85);
    this.keeper.setAlpha(0.9);
    this.ball.setAlpha(0.9);
    // Returning from a finished round: clear the last shot's frozen pose.
    this.stopKeeperSway();
    this.keeper.setPosition(this.scale.width / 2, this.goalLineY);
    this.ball.setScale(this.ballIsSprite ? this.ballBaseScale : 1);
    this.ball.setPosition(this.ballStartX, this.ballStartY);

    if (this.hasCharacterSelect) {
      this.setHomeVisible(true);
      this.logo?.setAlpha(0);
      this.layout(); // draw the cabinet for the current focus
      this.startHomeBlink();
    } else {
      // Classic fallback: simple title + rules + tap-to-start.
      this.startTitleText.setAlpha(1);
      this.cupText.setAlpha(1);
      this.startBodyText.setAlpha(1);
      this.startCtaText.setAlpha(1);
      this.logo?.setAlpha(1);
      this.layout();
    }
  }

  private drawStartOverlay() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.overlayGfx.clear();
    this.overlayGfx.fillStyle(ESPRESSO_DEEP, this.hasCharacterSelect ? 0.82 : 0.72);
    this.overlayGfx.fillRect(0, 0, w, h);

    // Tournament bunting: alternating pennants strung across the top.
    const stringY = h * 0.04;
    this.overlayGfx.lineStyle(2, CREAM, 0.4);
    this.overlayGfx.lineBetween(0, stringY, w, stringY);
    const pennantW = 26;
    const pennantColors = [GOLD, CREAM, 0xc96f4a];
    for (let x = pennantW / 2; x < w; x += pennantW + 8) {
      this.overlayGfx.fillStyle(pennantColors[Math.floor(x / (pennantW + 8)) % 3], 0.6);
      this.overlayGfx.fillTriangle(
        x - pennantW / 2, stringY,
        x + pennantW / 2, stringY,
        x, stringY + 18,
      );
    }

    if (!this.hasCharacterSelect) {
      // Classic flow keeps its "Tap to start" pill.
      this.overlayGfx.fillStyle(CREAM, 0.96);
      this.overlayGfx.fillRoundedRect(w / 2 - 86, h * 0.65 - 19, 172, 38, 18);
      this.overlayGfx.lineStyle(2, GOLD_SOFT, 0.9);
      this.overlayGfx.strokeRoundedRect(w / 2 - 86, h * 0.65 - 19, 172, 38, 18);
    }
  }

  private drawRestartButton() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.overlayGfx.clear();
    this.overlayGfx.fillStyle(ESPRESSO_DEEP, 0.55);
    this.overlayGfx.fillRect(0, 0, w, h);
    this.overlayGfx.fillStyle(CREAM, 0.96);
    this.overlayGfx.fillRoundedRect(w / 2 - 92, h * 0.64 - 20, 184, 40, 18);
    this.overlayGfx.lineStyle(2, GOLD_SOFT, 0.9);
    this.overlayGfx.strokeRoundedRect(w / 2 - 92, h * 0.64 - 20, 184, 40, 18);
  }

  private updateScore() {
    const playing = this.state === "playing";
    const k = Math.min(this.shotsTaken + (playing ? 1 : 0), TOTAL_SHOTS);
    this.rivalText.setText(`RIVAL ${RIVAL_GOALS}`);
    this.youText.setText(`YOU ${this.goals}`);
    this.shotText.setText(
      this.state === "complete"
        ? `FINAL ${this.goals}-${RIVAL_GOALS}`
        : `SHOT ${k}/${TOTAL_SHOTS}`,
    );
    if (this.state !== "start") {
      const w = this.scale.width;
      this.redrawPips(this.pipGfx, w / 2, 61, this.shotResults, Math.min(26, w * 0.07));
    }
  }
}
