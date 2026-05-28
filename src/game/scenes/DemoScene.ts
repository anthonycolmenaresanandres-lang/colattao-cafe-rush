import Phaser from "phaser";
import { EventBus } from "@/game/events/EventBus";
import appTheme from "@/config/theme";

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
const COLOR_GOLD = 0xd4a24c;
const COLOR_GOLD_SOFT = 0xe9c988;
const COLOR_CERAMIC = 0x2e5a7c;

// ─────────────────────────────────────────────────────────
// Rotating bad-tap loss messages
// 100 short funny lines in the Colattao voice.
// On the player's 100th cumulative bad-tap loss (tracked in
// localStorage under `colattao_bad_loss_count`) we override
// the random pick with a special line. Timeout messages
// remain unaffected.
// ─────────────────────────────────────────────────────────
const BAD_LOSS_STORAGE_KEY = "colattao_bad_loss_count";

const LOSS_MESSAGES = appTheme.game.copy.lossMessages;

// Milestone (100th-loss) line now sourced from the master theme config.
const HUNDREDTH_LOSS_MESSAGE = appTheme.game.copy.milestoneLossMessage;

function incrementAndReadBadLossCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(BAD_LOSS_STORAGE_KEY);
    const prev = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
    const next = prev + 1;
    window.localStorage.setItem(BAD_LOSS_STORAGE_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

function pickRandomLossMessage(): string {
  const messages = LOSS_MESSAGES.length > 0 ? LOSS_MESSAGES : ["That cup had no soul."];
  const i = Math.floor(Math.random() * messages.length);
  return messages[i] ?? "That cup had no soul.";
}

function getBadLossMessage(): string {
  const count = incrementAndReadBadLossCount();
  if (count === 100) {
    return HUNDREDTH_LOSS_MESSAGE;
  }
  return pickRandomLossMessage();
}

// ── Level configuration ──
interface LevelConfig {
  index: number;          // 1-based
  name: string;
  durationSec: number;
  targetScore: number;
  initialSpawnDelayMs: number;
  spawnDelayFloorMs: number;
  spawnDelayStepMs: number;        // how much spawn delay drops every 5 s
  badRate: number;                 // probability spawn is a bad item
  fallMinMs: number;
  fallMaxMs: number;
  fallSpeedupCapMs: number;        // max ms shaved off as round progresses
  fallSpeedupStepMs: number;       // ms shaved off per 5 s elapsed
  timeoutMessage: string;
}

const LEVELS: LevelConfig[] = [
  {
    index: 1,
    name: "Warm-up",
    durationSec: 20,
    targetScore: 120,
    initialSpawnDelayMs: 500,
    spawnDelayFloorMs: 340,
    spawnDelayStepMs: 40,
    badRate: 0.20,
    fallMinMs: 1700,
    fallMaxMs: 2600,
    fallSpeedupCapMs: 700,
    fallSpeedupStepMs: 160,
    timeoutMessage: "Almost there. The cafecito escaped.",
  },
  {
    index: 2,
    name: "Rush Hour",
    durationSec: 25,
    targetScore: 180,
    initialSpawnDelayMs: 340,
    spawnDelayFloorMs: 220,
    spawnDelayStepMs: 40,
    badRate: 0.34,
    fallMinMs: 1050,
    fallMaxMs: 1750,
    fallSpeedupCapMs: 850,
    fallSpeedupStepMs: 200,
    timeoutMessage: "Almost there. The cafecito escaped.",
  },
  {
    index: 3,
    name: "Colattao Lovers Only",
    durationSec: 30,
    targetScore: 300,
    initialSpawnDelayMs: 220,
    spawnDelayFloorMs: 135,
    spawnDelayStepMs: 28,
    badRate: 0.45,
    fallMinMs: 650,
    fallMaxMs: 1150,
    fallSpeedupCapMs: 850,
    fallSpeedupStepMs: 220,
    timeoutMessage: "Only true Colattao lovers survive this rush.",
  },
];

export class DemoScene extends Phaser.Scene {
  // ── Per-level state ──
  private currentLevelIndex = 0;             // 0..2
  private score = 0;                          // resets at start of each level
  private totalScore = 0;                     // cumulative across levels
  private timeLeft = LEVELS[0].durationSec;
  private gameEnded = false;
  private roundStarted = false;
  private spawnDelayMs = LEVELS[0].initialSpawnDelayMs;

  // ── HUD refs ──
  private scoreText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private targetText?: Phaser.GameObjects.Text;
  private levelNameText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private hudGroup?: Phaser.GameObjects.Container;

  // ── Timers / listeners ──
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private offRestart?: () => void;

  constructor() {
    super("DemoScene");
  }

  preload() {
    // Asset paths sourced from the master theme config (texture keys unchanged).
    const assets = appTheme.game.assets;
    this.load.image(ASSET_KEYS.bg, assets.background);
    this.load.image(ASSET_KEYS.logo, appTheme.brand.logoPath);
    this.load.image(ASSET_KEYS.coffee, assets.goodItems[0]);
    this.load.image(ASSET_KEYS.croissant, assets.goodItems[1]);
    this.load.image(ASSET_KEYS.matcha, assets.goodItems[2]);
    this.load.image(ASSET_KEYS.bad, assets.badItems[0]);
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
    this.resetFullGameState();
    this.buildHud();
    this.showStartScreen();
  }

  private get level(): LevelConfig {
    return LEVELS[this.currentLevelIndex];
  }

  // ─────────────────────────────────────────────────────────
  // Background
  // ─────────────────────────────────────────────────────────
  private drawSceneBackground() {
    const { width, height } = this.scale;

    if (this.textures.exists(ASSET_KEYS.bg)) {
      this.add.image(width / 2, height / 2, ASSET_KEYS.bg).setDisplaySize(width, height);
      this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO_2, 0.32);
      const vignette = this.add.graphics();
      vignette.fillGradientStyle(COLOR_GOLD, COLOR_GOLD, 0x000000, 0x000000, 0.12, 0.12, 0, 0);
      vignette.fillRect(0, 0, width, height * 0.45);
      return;
    }

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x150a05, 0x150a05, 0x4b2412, 0x4b2412, 1);
    bg.fillRect(0, 0, width, height);
  }

  private resetFullGameState() {
    this.currentLevelIndex = 0;
    this.totalScore = 0;
    this.resetLevelState();
  }

  private resetLevelState() {
    this.score = 0;
    this.timeLeft = this.level.durationSec;
    this.gameEnded = false;
    this.roundStarted = false;
    this.spawnDelayMs = this.level.initialSpawnDelayMs;
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);
  }

  // ─────────────────────────────────────────────────────────
  // HUD — slim parchment chips + level name
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
    this.timerText = buildChip(chipRightX, "Time", String(this.level.durationSec));

    // Level name (serif) + target
    this.levelNameText = this.add
      .text(width / 2, 76, this.level.name, {
        fontFamily: FONT_SERIF,
        fontSize: "16px",
        color: "#FFF6E2",
        align: "center",
      })
      .setOrigin(0.5);
    this.hudGroup.add(this.levelNameText);

    this.targetText = this.add
      .text(width / 2, 94, `Target ${this.level.targetScore}`, {
        fontFamily: FONT_SANS,
        fontSize: "10px",
        color: "#E9C988",
      })
      .setOrigin(0.5);
    this.targetText.setLetterSpacing(2);
    this.hudGroup.add(this.targetText);

    // Status line under HUD
    this.statusText = this.add
      .text(width / 2, 112, "Catch Colombian treats. Avoid chain coffee.", {
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
    const ceramic = this.add.rectangle(width / 2, 124, 120, 1, COLOR_CERAMIC, 0.55);
    this.hudGroup.add(ceramic);
  }

  private refreshHudForLevel() {
    this.scoreText?.setText("0");
    this.timerText?.setText(String(this.level.durationSec));
    this.levelNameText?.setText(this.level.name);
    this.targetText?.setText(`Target ${this.level.targetScore}`);
  }

  // ─────────────────────────────────────────────────────────
  // Start screen — golden ratio composition
  // ─────────────────────────────────────────────────────────
  private showStartScreen() {
    const { width, height } = this.scale;
    this.statusText?.setVisible(false);
    this.hudGroup?.setVisible(false);

    const brandZone = height * 0.382;
    const playZone = height - brandZone;

    const veil = this.add.graphics();
    veil.fillGradientStyle(COLOR_ESPRESSO, COLOR_ESPRESSO, COLOR_ESPRESSO_2, COLOR_ESPRESSO_2, 0.55, 0.55, 0, 0);
    veil.fillRect(0, 0, width, brandZone + 20);

    const eyebrow = this.add
      .text(width / 2, brandZone * 0.18, "COFFEE HOUSE · VIRGINIA BEACH", {
        fontFamily: FONT_SANS,
        fontSize: "10px",
        color: "#E9C988",
      })
      .setOrigin(0.5)
      .setAlpha(0.85);
    eyebrow.setLetterSpacing(3);

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
      this.add
        .text(width / 2, brandZone * 0.48, "Colattao", {
          fontFamily: FONT_SERIF,
          fontSize: "44px",
          color: "#F5E9D0",
        })
        .setOrigin(0.5);
    }

    const ruleY = brandZone * 0.78;
    const rule = this.add.graphics();
    rule.lineStyle(1, COLOR_GOLD, 0.7);
    rule.lineBetween(width / 2 - 60, ruleY, width / 2 + 60, ruleY);

    const rushTitle = this.add
      .text(width / 2, brandZone * 0.92, appTheme.game.title, {
        fontFamily: FONT_SERIF,
        fontSize: "30px",
        color: "#FFF6E2",
        align: "center",
      })
      .setOrigin(0.5);
    rushTitle.setLetterSpacing(2);

    const subtitle = this.add
      .text(width / 2, brandZone + playZone * 0.16, `Three levels. ${appTheme.game.subtitle}`, {
        fontFamily: FONT_SANS,
        fontSize: "12px",
        color: "#F5E9D0",
        align: "center",
        wordWrap: { width: width - 80 },
      })
      .setOrigin(0.5)
      .setAlpha(0.78);
    subtitle.setLetterSpacing(0.6);

    const ctaY = brandZone + playZone * 0.46;
    const ctaW = 180;
    const ctaH = 50;

    const ctaGlow = this.add
      .rectangle(width / 2, ctaY + 6, ctaW + 18, ctaH + 14, COLOR_GOLD, 0.18)
      .setAlpha(0.55);

    const ctaBg = this.add
      .rectangle(width / 2, ctaY, ctaW, ctaH, COLOR_GOLD_SOFT)
      .setStrokeStyle(1, 0x4b2412, 0.55)
      .setInteractive({ useHandCursor: true });

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
      this.refreshHudForLevel();
      this.startRound();
    });
  }

  // ─────────────────────────────────────────────────────────
  // Round loop
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
          this.spawnDelayMs = Math.max(
            this.level.spawnDelayFloorMs,
            this.spawnDelayMs - this.level.spawnDelayStepMs,
          );
          this.configureSpawnTimer();
        }
        if (this.timeLeft <= 0) {
          this.endLevel(false);
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

    const cfg = this.level;
    const { width, height } = this.scale;
    const x = Phaser.Math.Between(52, width - 52);
    const elapsed = cfg.durationSec - this.timeLeft;
    const fallBonus = Math.min(
      cfg.fallSpeedupCapMs,
      Math.floor(elapsed / 5) * cfg.fallSpeedupStepMs,
    );
    // Hard floors low enough for Level 3 to actually feel its speed ramp.
    const minDuration = Math.max(550, cfg.fallMinMs - fallBonus);
    const maxDuration = Math.max(850, cfg.fallMaxMs - fallBonus);
    const fallDuration = Phaser.Math.Between(minDuration, maxDuration);
    const isBad = Math.random() < cfg.badRate;
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
        this.endLevel(false, getBadLossMessage());
        return;
      }

      this.score += 10;
      this.scoreText?.setText(`${this.score}`);
      this.showFloatingFeedback(item.x, item.y, "+10", "#1f3a1f");

      if (this.score >= this.level.targetScore) {
        this.endLevel(true);
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
  // Level end — branches: complete, fail-by-bad-tap, fail-by-timeout
  // ─────────────────────────────────────────────────────────
  private endLevel(won: boolean, lossMessage?: string) {
    if (this.gameEnded) {
      return;
    }

    this.gameEnded = true;
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);

    if (won) {
      this.totalScore += this.score;
      const isFinal = this.currentLevelIndex >= LEVELS.length - 1;
      if (isFinal) {
        this.statusText?.setText(appTheme.game.copy.winMessage);
        this.time.delayedCall(700, () => {
          EventBus.emit("GAME_WON", {
            score: this.totalScore,
            rewardPercent: 5,
            wonAt: Date.now(),
          });
        });
        return;
      }
      this.showLevelCompleteOverlay();
      return;
    }

    const finalLossMessage =
      lossMessage ??
      this.level.timeoutMessage ??
      "Almost there. The cafecito escaped.";
    this.showLossOverlay(finalLossMessage);
  }

  private showLevelCompleteOverlay() {
    const { width, height } = this.scale;
    const nextLevel = LEVELS[this.currentLevelIndex + 1];

    const dim = this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO, 0.6);

    const eyebrow = this.add
      .text(width / 2, height / 2 - 80, "LEVEL COMPLETE", {
        fontFamily: FONT_SANS,
        fontSize: "11px",
        color: "#E9C988",
      })
      .setOrigin(0.5);
    eyebrow.setLetterSpacing(3);

    const msg = this.add
      .text(width / 2, height / 2 - 48, `Next: ${nextLevel.name}`, {
        fontFamily: FONT_SERIF,
        fontSize: "24px",
        color: "#FFF6E2",
        align: "center",
        wordWrap: { width: width - 60 },
      })
      .setOrigin(0.5);
    msg.setLetterSpacing(1.5);

    const sub = this.add
      .text(
        width / 2,
        height / 2 - 8,
        `${nextLevel.durationSec}s · target ${nextLevel.targetScore}`,
        {
          fontFamily: FONT_SANS,
          fontSize: "11px",
          color: "#F5E9D0",
        },
      )
      .setOrigin(0.5)
      .setAlpha(0.75);
    sub.setLetterSpacing(2);

    const btnW = 180;
    const btnH = 46;
    const btnY = height / 2 + 50;

    const btnBg = this.add
      .rectangle(width / 2, btnY, btnW, btnH, COLOR_GOLD_SOFT)
      .setStrokeStyle(1, 0x4b2412, 0.55)
      .setInteractive({ useHandCursor: true });

    const btnLabel = this.add
      .text(width / 2, btnY, "Next Level", {
        fontFamily: FONT_SERIF,
        fontSize: "20px",
        color: "#2A1208",
      })
      .setOrigin(0.5);
    btnLabel.setLetterSpacing(1.5);

    btnBg.on("pointerdown", () => {
      dim.destroy();
      eyebrow.destroy();
      msg.destroy();
      sub.destroy();
      btnBg.destroy();
      btnLabel.destroy();
      this.advanceToNextLevel();
    });
  }

  private advanceToNextLevel() {
    this.currentLevelIndex += 1;
    this.resetLevelState();
    this.refreshHudForLevel();
    this.statusText?.setText("Catch Colombian treats. Avoid chain coffee.");
    this.statusText?.setVisible(true);
    this.startRound();
  }

  /**
   * Loss overlay — intentionally minimal:
   * one message block, plenty of breathing room, one button.
   * No level-progression helper text (that lives on the level-complete overlay).
   */
  private showLossOverlay(message: string) {
    const { width, height } = this.scale;

    const dim = this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO, 0.65);

    const msgY = height / 2 - 60;
    const msg = this.add
      .text(width / 2, msgY, message, {
        fontFamily: FONT_SERIF,
        fontSize: "20px",
        color: "#FFF6E2",
        align: "center",
        wordWrap: { width: width - 80 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0.5);

    const btnW = 170;
    const btnH = 46;
    const btnY = height / 2 + 70;

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
      btnBg.destroy();
      btnLabel.destroy();
      this.scene.restart();
    });
  }
}
