import Phaser from "phaser";
import { EventBus } from "@/game/events/EventBus";
import appTheme from "@/config/theme";
import { FALL_UI, FALL_ACTION, type FallPhase } from "@/game/events/fallUi";

type FallingKind = "good" | "bad";

const GOOD_ITEMS = appTheme.game.assets.goodItems.map((path, index) => ({
  key: "colattao-" + (appTheme.game.assets.season ?? "default") + "-drink-" + index,
  path,
  label: appTheme.game.assets.goodItemLabels?.[index] ?? "Coffee",
}));

const ASSET_KEYS = {
  bg: "colattao-bg-" + (appTheme.game.assets.season ?? "default"),
  logo: "colattao-logo",

  bad: "item-seafarers-bad",
} as const;

// â”€â”€ Premium type stacks (Phaser uses web fonts loaded by next/font) â”€â”€
const FONT_SERIF = getComputedStyle(document.body).getPropertyValue("--font-playfair").trim() || '"Playfair Display", Georgia, "Times New Roman", serif';
const FONT_SANS = getComputedStyle(document.body).getPropertyValue("--font-inter").trim() || 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

// â”€â”€ Brand palette (mirrors globals.css) â”€â”€
const COLOR_ESPRESSO = 0x1b0e08;
const COLOR_PARCHMENT = 0xf5e9d0;
const COLOR_GOLD = 0xd4a24c;
const COLOR_GOLD_SOFT = 0xe9c988;
const COLOR_CERAMIC = 0x2e5a7c;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Rotating bad-tap loss messages
// 100 short funny lines in the Colattao voice.
// On the player's 100th cumulative bad-tap loss (tracked in
// localStorage under `colattao_bad_loss_count`) we override
// the random pick with a special line. Timeout messages
// remain unaffected.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Level configuration â”€â”€
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
  // â”€â”€ Per-level state â”€â”€
  private currentLevelIndex = 0;             // 0..2
  private score = 0;                          // resets at start of each level
  private totalScore = 0;                     // cumulative across levels
  private timeLeft = LEVELS[0].durationSec;
  private gameEnded = false;
  private roundStarted = false;
  private spawnDelayMs = LEVELS[0].initialSpawnDelayMs;

  // â”€â”€ HUD refs â”€â”€
  private scoreText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private targetText?: Phaser.GameObjects.Text;
  private levelNameText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private hudGroup?: Phaser.GameObjects.Container;

  // â”€â”€ Timers / listeners â”€â”€
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private offRestart?: () => void;
  private backgroundGroup?: Phaser.GameObjects.Container;
  private overlayGroup?: Phaser.GameObjects.Container;
  private overlayRebuild?: () => void;
  private overlayAction?: () => void;
  private phase: FallPhase = "start";
  private reducedMotion = false;
  private readonly fallingItems = new Set<Phaser.GameObjects.Container>();

  private notifyUi() {
    this.game.events.emit(FALL_UI, {
      phase: this.phase, score: this.score, time: this.timeLeft, target: this.level.targetScore,
    });
  }

  private clearOverlay() {
    this.overlayGroup?.each((object: Phaser.GameObjects.GameObject) => this.tweens.killTweensOf(object));
    this.overlayGroup?.destroy(true);
    this.overlayGroup = undefined;
    this.overlayRebuild = undefined;
    this.overlayAction = undefined;
  }

  private resizeLayout() {
    this.drawSceneBackground();
    this.hudGroup?.destroy(true);
    this.buildHud();
    this.refreshHudForLevel();
    this.hudGroup?.setVisible(this.roundStarted);
    this.fallingItems.forEach((item) => item.getData("reflow")?.());
    const rebuild = this.overlayRebuild;
    if (rebuild) { this.clearOverlay(); rebuild(); }
  }

  constructor() {
    super("DemoScene");
  }

  preload() {
    const assets = appTheme.game.assets;
    this.load.image(ASSET_KEYS.bg, assets.background);
    this.load.image(ASSET_KEYS.logo, appTheme.brand.logoPath);
    GOOD_ITEMS.forEach((item) => this.load.image(item.key, item.path));
    this.load.image(ASSET_KEYS.bad, assets.badItems[0]);
  }

  create() {
    this.fallingItems.clear();
    this.overlayGroup = undefined;
    this.overlayRebuild = undefined;
    this.overlayAction = undefined;
    this.phase = "start";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      this.reducedMotion = motion.matches;
      if (this.reducedMotion) this.fallingItems.forEach((item) => {
        item.each((child: Phaser.GameObjects.GameObject) => this.tweens.killTweensOf(child));
      });
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    this.drawSceneBackground();
    this.offRestart?.();
    this.offRestart = EventBus.on("RESTART_GAME", () => this.scene.restart());
    const action = () => this.overlayAction?.();
    this.game.events.on(FALL_ACTION, action);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.resizeLayout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.offRestart?.();
      this.offRestart = undefined;
      motion.removeEventListener("change", updateMotion);
      this.game.events.off(FALL_ACTION, action);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.resizeLayout, this);
      this.fallingItems.forEach((item) => item.destroy());
      this.fallingItems.clear();
      this.overlayAction = undefined;
      this.overlayRebuild = undefined;
    });
    this.resetFullGameState();
    this.buildHud();
    this.showStartScreen();
    this.notifyUi();
  }

  private get level(): LevelConfig {
    return LEVELS[this.currentLevelIndex];
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Background
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private drawSceneBackground() {
    const { width, height } = this.scale;
    this.backgroundGroup?.destroy(true);
    const layer = this.add.container(0, 0).setDepth(-100);
    this.backgroundGroup = layer;
    layer.add(this.add.rectangle(width / 2, height / 2, width, height, 0x16130f));
    if (this.textures.exists(ASSET_KEYS.bg)) {
      const image = this.add.image(width / 2, height / 2, ASSET_KEYS.bg);
      image.setScale(Math.max(width / image.width, height / image.height));
      layer.add(image);
    }
    layer.add(this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO, 0.08));
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

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // HUD â€” slim parchment chips + level name
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private buildHud() {
    const { width } = this.scale;
    this.hudGroup = this.add.container(0, 0).setDepth(10);
    this.hudGroup.add(this.add.rectangle(width / 2, 64, width, 132, 0x16130f, 0.94));

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
      .text(width / 2, 112, "Fall favorites. Colattao only.", {
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
    this.scoreText?.setText(String(this.score));
    this.timerText?.setText(String(this.timeLeft));
    this.levelNameText?.setText(this.level.name);
    this.targetText?.setText(`Target ${this.level.targetScore}`);
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Start screen â€” golden ratio composition
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private showStartScreen() {
    const { width, height } = this.scale;
    this.hudGroup?.setVisible(false);
    const layer = this.add.container(0, 0).setDepth(20);
    this.overlayGroup = layer;
    this.overlayRebuild = () => this.showStartScreen();
    const compact = height < 470;
    const text = (y: number, value: string, size: number, color = "#F5E9D0", serif = false) => {
      const object = this.add.text(width / 2, height * y, value, {
        fontFamily: serif ? FONT_SERIF : FONT_SANS, fontSize: size + "px", color,
        align: "center", wordWrap: { width: width - 58 },
      }).setOrigin(0.5);
      layer.add(object);
      return object;
    };
    if (this.textures.exists(ASSET_KEYS.logo)) {
      const logo = this.add.image(width / 2, height * 0.125, ASSET_KEYS.logo);
      logo.setScale((compact ? 135 : 158) / logo.width);
      layer.add(logo);
    } else text(0.125, "Colattao", 32, "#F5E9D0", true);
    text(0.245, "THE AUTUMN COLLECTION", compact ? 9 : 10, "#D7A175").setLetterSpacing(2.4);
    text(0.335, appTheme.game.title, compact ? 40 : 48, "#FFF2D9", true);
    text(0.425, "Four seasonal favorites. One cozy rush.", compact ? 10 : 12, "#D8C4A9");
    const spacing = Math.min(80, (width - 40) / Math.max(1, GOOD_ITEMS.length));
    GOOD_ITEMS.forEach((drink, index) => {
      const x = width / 2 + (index - (GOOD_ITEMS.length - 1) / 2) * spacing;
      const size = compact ? 58 : 72;
      const object = this.createCollectibleArt(drink.key, drink.label, size, false);
      object.setPosition(x, height * 0.555);
      layer.add(object);
      layer.add(this.add.text(x, height * 0.67, drink.label.replace(" ", "\n"), {
        fontFamily: FONT_SANS, fontSize: "10px", color: "#E7CEAC", align: "center", lineSpacing: 2,
      }).setOrigin(0.5));
    });
    text(0.755, appTheme.game.subtitle, compact ? 10 : 12, "#F5E9D0");
    const button = this.add.rectangle(width / 2, height * 0.87, Math.min(214, width - 90), 48, COLOR_GOLD_SOFT)
      .setStrokeStyle(1, 0x9b6c43).setInteractive({ useHandCursor: true });
    layer.add(button);
    text(0.87, "Start the rush", 19, "#29180D", true);

    this.overlayAction = () => {
      this.clearOverlay();
      this.hudGroup?.setVisible(true);
      this.refreshHudForLevel();
      this.startRound();
    };
    button.on("pointerdown", () => this.overlayAction?.());
  }

  private createCollectibleArt(key: string, label: string, size: number, bad: boolean) {
    if (this.textures.exists(key)) {
      const image = this.add.image(0, 0, key);
      // Keep aspect ratio; later animation is relative to this base scale.
      image.setScale(size / Math.max(image.width, image.height));
      return image;
    }
    const fallback = this.add.container(0, 0);
    const cup = this.add.graphics();
    cup.fillStyle(bad ? 0x923d37 : COLOR_PARCHMENT);
    cup.fillRoundedRect(-size * 0.32, -size * 0.32, size * 0.56, size * 0.62, 8);
    cup.lineStyle(5, bad ? 0x923d37 : COLOR_PARCHMENT);
    cup.strokeCircle(size * 0.29, -size * 0.04, size * 0.15);
    cup.fillStyle(bad ? 0x451710 : 0x996642);
    cup.fillEllipse(-size * 0.04, -size * 0.26, size * 0.48, 10);
    const name = this.add.text(-size * 0.04, 4, bad ? "X" : label.split(" ")[0], {
      fontFamily: FONT_SANS, fontSize: bad ? "21px" : "10px", color: bad ? "#FFFFFF" : "#3A2317",
    }).setOrigin(0.5);
    fallback.add([cup, name]);
    return fallback;
  }

  private startRound() {
    this.roundStarted = true;
    this.phase = "playing";
    this.notifyUi();
    this.configureSpawnTimer();

    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameEnded || !this.roundStarted) {
          return;
        }

        this.timeLeft -= 1;
        this.notifyUi();
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
    if (this.gameEnded || !this.roundStarted) return;
    const cfg = this.level;
    const elapsed = cfg.durationSec - this.timeLeft;
    const fallBonus = Math.min(cfg.fallSpeedupCapMs, Math.floor(elapsed / 5) * cfg.fallSpeedupStepMs);
    const fallDuration = Phaser.Math.Between(Math.max(550, cfg.fallMinMs - fallBonus), Math.max(850, cfg.fallMaxMs - fallBonus));
    const kind: FallingKind = Math.random() < cfg.badRate ? "bad" : "good";
    const drink = Phaser.Utils.Array.GetRandom(GOOD_ITEMS) ?? { key: "missing-drink", label: "Coffee" };
    const key = kind === "bad" ? ASSET_KEYS.bad : drink.key;
    const itemSize = kind === "bad" ? 108 : 112;
    // Include room for the eight-degree wobble, even at the screen edges.
    const edgePadding = itemSize * 0.58 + 8;
    const item = this.add.container(0, -50).setDepth(2).setSize(itemSize, itemSize);
    item.setData({ kind, textureKey: key });
    const art = this.createCollectibleArt(key, drink.label, itemSize, kind === "bad");
    item.add(art);
    // Phaser adds displayOrigin when testing a sized container's local hit area.
    item.setInteractive(new Phaser.Geom.Rectangle(0, 0, itemSize, itemSize), Phaser.Geom.Rectangle.Contains);
    this.fallingItems.add(item);
    const progress = { value: 0 };
    const horizontal = Math.random();
    const position = () => {
      item.x = edgePadding + horizontal * Math.max(0, this.scale.width - edgePadding * 2);
      item.y = -edgePadding + progress.value * (this.scale.height + edgePadding * 2);
      if (item.input) item.input.enabled = item.y > 132 + itemSize / 2 && !this.gameEnded;
    };
    position();
    item.setData("reflow", position);
    if (!this.reducedMotion) {
      this.tweens.add({ targets: art, angle: Phaser.Math.Between(-8, 8),
        scaleX: art.scaleX * 0.97, scaleY: art.scaleY * 0.97,
        duration: 550, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    item.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.tweens.killTweensOf(progress);
      this.tweens.killTweensOf(art);
      this.fallingItems.delete(item);
    });
    item.once("pointerdown", () => {
      if (this.gameEnded) return;
      const { x, y } = item;
      item.destroy();
      if (kind === "bad") {
        this.showFloatingFeedback(x, y, "Not Colattao.", "#F6BAA2");
        this.endLevel(false, getBadLossMessage());
        return;
      }
      this.score += 10;
      this.scoreText?.setText(String(this.score));
      this.notifyUi();
      this.showFloatingFeedback(x, y, "+10", "#F5DCA7");
      if (this.score >= this.level.targetScore) this.endLevel(true);
    });
    this.tweens.add({ targets: progress, value: 1, duration: fallDuration, ease: "Linear",
      onUpdate: position, onComplete: () => item.destroy() });
  }

  private showFloatingFeedback(x: number, y: number, text: string, color: string) {
    const feedback = this.add
      .text(x, y, text, {
        fontFamily: FONT_SERIF,
        fontSize: "22px",
        color,
        stroke: "#29180D",
        strokeThickness: 2,
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

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Level end â€” branches: complete, fail-by-bad-tap, fail-by-timeout
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private endLevel(won: boolean, lossMessage?: string) {
    if (this.gameEnded) {
      return;
    }

    this.gameEnded = true;
    this.fallingItems.forEach((item) => item.destroy());
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);

    if (won) {
      this.totalScore += this.score;
      const isFinal = this.currentLevelIndex >= LEVELS.length - 1;
      if (isFinal) {
        this.phase = "won";
        this.notifyUi();
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
    this.phase = "level-complete";
    this.notifyUi();
    const previousObjects = new Set(this.children.list);
    const { width, height } = this.scale;
    const nextLevel = LEVELS[this.currentLevelIndex + 1];

    this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO, 0.6);

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

    this.overlayGroup = this.add.container(0, 0, this.children.list.filter((o) => !previousObjects.has(o))).setDepth(20);
    this.overlayRebuild = () => this.showLevelCompleteOverlay();
    this.overlayAction = () => { this.clearOverlay(); this.advanceToNextLevel(); };
    btnBg.on("pointerdown", () => this.overlayAction?.());
  }

  private advanceToNextLevel() {
    this.currentLevelIndex += 1;
    this.resetLevelState();
    this.refreshHudForLevel();
    this.statusText?.setText("Fall favorites. Colattao only.");
    this.statusText?.setVisible(true);
    this.startRound();
  }

  /**
   * Loss overlay â€” intentionally minimal:
   * one message block, plenty of breathing room, one button.
   * No level-progression helper text (that lives on the level-complete overlay).
   */
  private showLossOverlay(message: string) {
    this.phase = "lost";
    this.notifyUi();
    const previousObjects = new Set(this.children.list);
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, COLOR_ESPRESSO, 0.65);

    const msgY = height / 2 - 60;
    this.add
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

    this.overlayGroup = this.add.container(0, 0, this.children.list.filter((o) => !previousObjects.has(o))).setDepth(20);
    this.overlayRebuild = () => this.showLossOverlay(message);
    this.overlayAction = () => { this.clearOverlay(); this.scene.restart(); };
    btnBg.on("pointerdown", () => this.overlayAction?.());
  }
}
