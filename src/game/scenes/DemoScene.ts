import Phaser from "phaser";
import { EventBus } from "@/game/events/EventBus";

type FallingKind = "good" | "bad";

const ASSET_KEYS = {
  bg: "colattao-bg",
  logo: "colattao-logo",
  coffee: "item-coffee-cup",
  croissant: "item-croissant",
  matcha: "item-matcha-iced",
  bad: "item-seafarers-bad",
} as const;

// ── Premium type stacks (Phaser uses web fonts loaded by next/font) ──
const FONT_SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';
const FONT_SANS = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

// ── Brand palette (mirrors globals.css) ──
const COLOR_ESPRESSO = 0x1b0e08;
const COLOR_ESPRESSO_2 = 0x2a1208;
const COLOR_PARCHMENT = 0xf5e9d0;
const COLOR_CREAM = 0xfff6e2;
const COLOR_GOLD = 0xd4a24c;
const COLOR_GOLD_SOFT = 0xe9c988;
const COLOR_CERAMIC = 0x2e5a7c;
const COLOR_TERRACOTTA = 0xb45309;

export class DemoScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 20;
  private readonly scoreTarget = 120;
  private gameEnded = false;
  private roundStarted = false;
  private spawnDelayMs = 620;
  private scoreText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private hudGroup?: Phaser.GameObjects.Container;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private offRestart?: () => void;

  constructor() {
    super("DemoScene");
  }

  preload() {
    this.load.image(ASSET_KEYS.bg, "assets/colattao/backgrounds/colattao-bg.png");
    this.load.image(ASSET_KEYS.logo, "assets/colattao/logo/colattao-logo.png");
    this.load.image(ASSET_KEYS.coffee, "assets/colattao/items/coffee-cup.png");
    this.load.image(ASSET_KEYS.croissant, "assets/colattao/items/croissant.png");
    this.load.image(ASSET_KEYS.matcha, "assets/colattao/items/matcha-iced.png");
    this.load.image(ASSET_KEYS.bad, "assets/colattao/items/seafarers-bad.png");
  }

  create() {
    this.drawSceneBackground();
    this.offRestart?.();
    this.offRestart = EventBus.on("RESTART_GAME", () => {
      this.scene.restart();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.offRestart?.();
      this.offRestart = undefined;
    });
    this.resetRoundState();
    this.buildHud();
    this.showStartScreen();
  }

  // ─────────────────────────────────────────────────────────
  // Background
  // ─────────────────────────────────────────────────────────
  private drawSceneBackground() {
    const { width, height } = this.scale;

    if (this.textures.exists(ASSET_KEYS.bg)) {
      this.add.image(width / 2, height / 2, ASSET_KEYS.bg).setDisplaySize(width, height);
      // Warm espresso wash for legibility & mood
      this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO_2, 0.32);
      // Subtle gold vignette at top
      const vignette = this.add.graphics();
      vignette.fillGradientStyle(COLOR_GOLD, COLOR_GOLD, 0x000000, 0x000000, 0.12, 0.12, 0, 0);
      vignette.fillRect(0, 0, width, height * 0.45);
      return;
    }

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x150a05, 0x150a05, 0x4b2412, 0x4b2412, 1);
    bg.fillRect(0, 0, width, height);
  }

  private resetRoundState() {
    this.score = 0;
    this.timeLeft = 20;
    this.gameEnded = false;
    this.roundStarted = false;
    this.spawnDelayMs = 620;
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);
  }

  // ─────────────────────────────────────────────────────────
  // HUD — slim parchment chips with gold underline
  // ─────────────────────────────────────────────────────────
  private buildHud() {
    const { width } = this.scale;
    this.hudGroup = this.add.container(0, 0);

    const chipWidth = 110;
    const chipHeight = 30;
    const chipY = 36;
    const chipLeftX = 78;
    const chipRightX = width - 78;

    const buildChip = (cx: number, label: string, value: string) => {
      const bg = this.add
        .rectangle(cx, chipY, chipWidth, chipHeight, COLOR_PARCHMENT, 0.92)
        .setStrokeStyle(1, COLOR_GOLD, 0.55);
      // Gold hairline underline
      const underline = this.add.rectangle(cx, chipY + chipHeight / 2 - 2, chipWidth - 14, 1, COLOR_GOLD, 0.75);

      const labelText = this.add
        .text(cx - chipWidth / 2 + 12, chipY, label.toUpperCase(), {
          fontFamily: FONT_SANS,
          fontSize: "9px",
          color: "#9C6B1F",
        })
        .setOrigin(0, 0.5);
      labelText.setLetterSpacing(2);

      const valueText = this.add
        .text(cx + chipWidth / 2 - 12, chipY, value, {
          fontFamily: FONT_SERIF,
          fontSize: "18px",
          color: "#2A1208",
        })
        .setOrigin(1, 0.5);

      this.hudGroup?.add([bg, underline, labelText, valueText]);
      return valueText;
    };

    this.scoreText = buildChip(chipLeftX, "Score", "0");
    this.timerText = buildChip(chipRightX, "Time", "20");

    // Single elegant status line — no muddy band
    this.statusText = this.add
      .text(width / 2, 78, "Catch Colombian treats. Avoid chain coffee.", {
        fontFamily: FONT_SANS,
        fontSize: "11px",
        color: "#F5E9D0",
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0.85);
    this.statusText.setLetterSpacing(1.2);
    this.hudGroup.add(this.statusText);

    // Ceramic-blue hairline under status
    const ceramic = this.add.rectangle(width / 2, 90, 120, 1, COLOR_CERAMIC, 0.55);
    this.hudGroup.add(ceramic);

    if (this.textures.exists(ASSET_KEYS.logo)) {
      const logoMark = this.add.image(width / 2, 36, ASSET_KEYS.logo).setAlpha(0.0);
      // hidden during play — brand stays in React shell above the canvas
      this.hudGroup.add(logoMark);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Start screen — golden ratio composition
  // ─────────────────────────────────────────────────────────
  private showStartScreen() {
    const { width, height } = this.scale;
    this.statusText?.setVisible(false);
    this.hudGroup?.setVisible(false);

    // Top brand zone ≈ 38.2 %, bottom interaction ≈ 61.8 %
    const brandZone = height * 0.382;
    const playZone = height - brandZone;

    // Soft espresso veil to anchor the brand zone
    const veil = this.add.graphics();
    veil.fillGradientStyle(COLOR_ESPRESSO, COLOR_ESPRESSO, COLOR_ESPRESSO_2, COLOR_ESPRESSO_2, 0.55, 0.55, 0, 0);
    veil.fillRect(0, 0, width, brandZone + 20);

    // Eyebrow
    const eyebrow = this.add
      .text(width / 2, brandZone * 0.18, "COFFEE HOUSE · VIRGINIA BEACH", {
        fontFamily: FONT_SANS,
        fontSize: "10px",
        color: "#E9C988",
      })
      .setOrigin(0.5)
      .setAlpha(0.85);
    eyebrow.setLetterSpacing(3);

    // Logo image — hero element
    let logo: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists(ASSET_KEYS.logo)) {
      logo = this.add.image(width / 2, brandZone * 0.48, ASSET_KEYS.logo);
      const frame = this.textures.getFrame(ASSET_KEYS.logo, "__BASE");
      if (frame) {
        const targetWidth = 220;
        const ratio = frame.height / frame.width;
        logo.setDisplaySize(targetWidth, targetWidth * ratio);
      }
    } else {
      // Fallback wordmark
      logo = undefined;
      this.add
        .text(width / 2, brandZone * 0.48, "Colattao", {
          fontFamily: FONT_SERIF,
          fontSize: "44px",
          color: "#F5E9D0",
        })
        .setOrigin(0.5);
    }

    // Gold rule
    const ruleY = brandZone * 0.78;
    const rule = this.add.graphics();
    rule.lineStyle(1, COLOR_GOLD, 0.7);
    rule.lineBetween(width / 2 - 60, ruleY, width / 2 + 60, ruleY);

    // Serif title "Café Rush"
    const rushTitle = this.add
      .text(width / 2, brandZone * 0.92, "Café Rush", {
        fontFamily: FONT_SERIF,
        fontSize: "30px",
        color: "#FFF6E2",
        align: "center",
      })
      .setOrigin(0.5);
    rushTitle.setLetterSpacing(2);

    // Subtitle — refined, single line
    const subtitle = this.add
      .text(width / 2, brandZone + playZone * 0.16, "Catch the treats. Avoid the chain.", {
        fontFamily: FONT_SANS,
        fontSize: "12px",
        color: "#F5E9D0",
        align: "center",
        wordWrap: { width: width - 80 },
      })
      .setOrigin(0.5)
      .setAlpha(0.78);
    subtitle.setLetterSpacing(0.6);

    // ── Premium gold-pill CTA ──
    const ctaY = brandZone + playZone * 0.46;
    const ctaW = 180;
    const ctaH = 50;

    // Soft glow
    const ctaGlow = this.add
      .rectangle(width / 2, ctaY + 6, ctaW + 18, ctaH + 14, COLOR_GOLD, 0.18)
      .setAlpha(0.55);

    const ctaBg = this.add
      .rectangle(width / 2, ctaY, ctaW, ctaH, COLOR_GOLD_SOFT)
      .setStrokeStyle(1, 0x4b2412, 0.55)
      .setInteractive({ useHandCursor: true });

    // Top inner highlight
    const ctaHighlight = this.add.rectangle(
      width / 2,
      ctaY - ctaH / 2 + 6,
      ctaW - 18,
      2,
      0xffffff,
      0.55,
    );

    const ctaLabel = this.add
      .text(width / 2, ctaY, "Begin", {
        fontFamily: FONT_SERIF,
        fontSize: "22px",
        color: "#2A1208",
      })
      .setOrigin(0.5);
    ctaLabel.setLetterSpacing(2);

    // Tiny tagline under CTA
    const ctaHint = this.add
      .text(width / 2, ctaY + ctaH / 2 + 18, "Tap to start your round", {
        fontFamily: FONT_SANS,
        fontSize: "10px",
        color: "#E9C988",
      })
      .setOrigin(0.5)
      .setAlpha(0.65);
    ctaHint.setLetterSpacing(1.5);

    this.tweens.add({
      targets: [ctaBg, ctaLabel, ctaHighlight],
      scaleX: 1.025,
      scaleY: 1.025,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    ctaBg.on("pointerdown", () => {
      veil.destroy();
      eyebrow.destroy();
      logo?.destroy();
      rule.destroy();
      rushTitle.destroy();
      subtitle.destroy();
      ctaGlow.destroy();
      ctaBg.destroy();
      ctaHighlight.destroy();
      ctaLabel.destroy();
      ctaHint.destroy();
      this.hudGroup?.setVisible(true);
      this.statusText?.setVisible(true);
      this.startRound();
    });
  }

  // ─────────────────────────────────────────────────────────
  // Round loop (gameplay unchanged)
  // ─────────────────────────────────────────────────────────
  private startRound() {
    this.roundStarted = true;
    this.configureSpawnTimer();

    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameEnded || !this.roundStarted) {
          return;
        }

        this.timeLeft -= 1;
        this.timerText?.setText(`${this.timeLeft}`);
        if (this.timeLeft > 0 && this.timeLeft % 5 === 0) {
          this.spawnDelayMs = Math.max(470, this.spawnDelayMs - 35);
          this.configureSpawnTimer();
        }
        if (this.timeLeft <= 0) {
          this.endGame(false);
        }
      },
    });
  }

  private configureSpawnTimer() {
    this.spawnTimer?.remove(false);
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelayMs,
      loop: true,
      callback: () => this.spawnItem(),
    });
  }

  private spawnItem() {
    if (this.gameEnded || !this.roundStarted) {
      return;
    }

    const { width, height } = this.scale;
    const x = Phaser.Math.Between(52, width - 52);
    const elapsed = 20 - this.timeLeft;
    const fallBonus = Math.min(520, Math.floor(elapsed / 5) * 120);
    const minDuration = Math.max(1500, 2200 - fallBonus);
    const maxDuration = Math.max(2300, 3400 - fallBonus);
    const fallDuration = Phaser.Math.Between(minDuration, maxDuration);
    const isBad = Math.random() < 0.22;
    const kind: FallingKind = isBad ? "bad" : "good";

    const goodKeys: string[] = [ASSET_KEYS.coffee, ASSET_KEYS.croissant, ASSET_KEYS.matcha];
    const pickedGoodKey = Phaser.Utils.Array.GetRandom(goodKeys);
    const textureKey = kind === "bad" ? ASSET_KEYS.bad : pickedGoodKey;

    const useImage = this.textures.exists(textureKey);
    const fallbackEmoji =
      kind === "bad"
        ? "💧"
        : textureKey === ASSET_KEYS.coffee
          ? "☕"
          : textureKey === ASSET_KEYS.croissant
            ? "🥐"
            : "🍵";

    const itemSize = kind === "bad" ? 74 : 66;
    const item = useImage
      ? this.add.image(x, -50, textureKey).setDisplaySize(itemSize, itemSize).setInteractive({ useHandCursor: true })
      : this.add
          .text(x, -36, fallbackEmoji, {
            fontFamily: FONT_SANS,
            fontSize: "52px",
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

    item.setScale(useImage ? 1 : item.scaleX);

    this.tweens.add({
      targets: item,
      angle: Phaser.Math.Between(-10, 10),
      scaleX: useImage ? 0.96 : 1.02,
      scaleY: useImage ? 0.96 : 1.02,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    item.on("pointerdown", () => {
      if (this.gameEnded) {
        return;
      }

      item.destroy();

      if (kind === "bad") {
        this.showFloatingFeedback(item.x, item.y, "Not Colattao.", "#7f1d1d");
        this.endGame(false, "Chain coffee got you. Try again.");
        return;
      }

      this.score += 10;
      this.scoreText?.setText(`${this.score}`);
      this.showFloatingFeedback(item.x, item.y, "+10", "#1f3a1f");

      if (this.score >= this.scoreTarget) {
        this.endGame(true);
      }
    });

    this.tweens.add({
      targets: item,
      y: height + 56,
      duration: fallDuration,
      ease: "Linear",
      onComplete: () => item.destroy(),
    });
  }

  private showFloatingFeedback(x: number, y: number, text: string, color: string) {
    const feedback = this.add
      .text(x, y, text, {
        fontFamily: FONT_SERIF,
        fontSize: "22px",
        color,
        stroke: "#FFF6E2",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: y - 42,
      alpha: 0,
      duration: 600,
      ease: "Cubic.easeOut",
      onComplete: () => feedback.destroy(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // End game — refined restart card
  // ─────────────────────────────────────────────────────────
  private endGame(won: boolean, lossMessage?: string) {
    if (this.gameEnded) {
      return;
    }

    this.gameEnded = true;
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);

    if (won) {
      this.statusText?.setText("You earned your Colattao pass.");
      this.time.delayedCall(800, () => {
        EventBus.emit("GAME_WON", {
          score: this.score,
          rewardPercent: 5,
          wonAt: Date.now(),
        });
      });
      return;
    }

    const { width, height } = this.scale;

    // Dim the play area
    const dim = this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO, 0.55);

    // Centered message
    const msg = this.add
      .text(width / 2, height / 2 - 30, lossMessage ?? "Almost there.", {
        fontFamily: FONT_SERIF,
        fontSize: "22px",
        color: "#FFF6E2",
        align: "center",
        wordWrap: { width: width - 80 },
      })
      .setOrigin(0.5);

    const sub = this.add
      .text(width / 2, height / 2 + 4, "Catch 120 to earn your pass.", {
        fontFamily: FONT_SANS,
        fontSize: "11px",
        color: "#E9C988",
      })
      .setOrigin(0.5)
      .setAlpha(0.8);
    sub.setLetterSpacing(1.5);

    // Refined gold pill restart
    const btnW = 170;
    const btnH = 44;
    const btnY = height / 2 + 60;

    const btnBg = this.add
      .rectangle(width / 2, btnY, btnW, btnH, COLOR_GOLD_SOFT)
      .setStrokeStyle(1, 0x4b2412, 0.55)
      .setInteractive({ useHandCursor: true });

    const btnLabel = this.add
      .text(width / 2, btnY, "Try Again", {
        fontFamily: FONT_SERIF,
        fontSize: "18px",
        color: "#2A1208",
      })
      .setOrigin(0.5);
    btnLabel.setLetterSpacing(1.5);

    btnBg.on("pointerdown", () => {
      dim.destroy();
      msg.destroy();
      sub.destroy();
      btnBg.destroy();
      btnLabel.destroy();
      this.scene.restart();
    });
  }
}

