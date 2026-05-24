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

export class DemoScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 20;
  private readonly scoreTarget = 100;
  private gameEnded = false;
  private roundStarted = false;
  private scoreText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private offRestart?: () => void;
  private statusBackdrop?: Phaser.GameObjects.Rectangle;

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

  private drawSceneBackground() {
    const { width, height } = this.scale;

    if (this.textures.exists(ASSET_KEYS.bg)) {
      this.add.image(width / 2, height / 2, ASSET_KEYS.bg).setDisplaySize(width, height);
      this.add.rectangle(width / 2, height / 2, width, height, 0x2a1208, 0.16);
      this.add.rectangle(width / 2, 96, width, 160, 0xfff3d6, 0.16);
      return;
    }

    const bg = this.add.graphics();
    bg.fillGradientStyle(0xfef3c7, 0xfffbeb, 0xfdba74, 0xfb923c, 1);
    bg.fillRect(0, 0, width, height);
  }

  private resetRoundState() {
    this.score = 0;
    this.timeLeft = 20;
    this.gameEnded = false;
    this.roundStarted = false;
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);
  }

  private buildHud() {
    const { width } = this.scale;

    this.add.rectangle(97, 72, 138, 38, 0xfff3d6, 0.82).setStrokeStyle(1, 0xd99028, 0.22);
    this.add
      .rectangle(width - 97, 72, 138, 38, 0xfff3d6, 0.82)
      .setStrokeStyle(1, 0xd99028, 0.22);

    this.scoreText = this.add
      .text(97, 72, "Score 0", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#4B2412",
      })
      .setOrigin(0.5);

    this.timerText = this.add
      .text(width - 97, 72, "Time 20", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#4B2412",
      })
      .setOrigin(0.5);

    this.statusBackdrop = this.add.rectangle(width / 2, 112, width - 48, 26, 0x2a1208, 0.28);

    this.statusText = this.add
      .text(width / 2, 110, "Catch Colombian café treats. Avoid chain coffee.", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#FFF3D6",
        stroke: "#2A1208",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5);

    if (this.textures.exists(ASSET_KEYS.logo)) {
      this.add.image(width - 44, 30, ASSET_KEYS.logo).setDisplaySize(68, 28).setAlpha(0.8);
    }
  }

  private showStartScreen() {
    const { width, height } = this.scale;
    this.statusText?.setVisible(false);
    this.statusBackdrop?.setVisible(false);

    const title = this.add
      .text(width / 2, height / 2 - 58, "Colattao Café Rush", {
        fontFamily: "Arial",
        fontSize: "33px",
        color: "#FFF3D6",
        stroke: "#2A1208",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width / 2, height / 2 - 2, "Catch Colombian café treats. Avoid chain coffee.", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#FFF3D6",
        stroke: "#2A1208",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: width - 90 },
      })
      .setOrigin(0.5);

    let logo: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists(ASSET_KEYS.logo)) {
      logo = this.add.image(width / 2, height / 2 - 116, ASSET_KEYS.logo).setAlpha(0.94);
      const frame = this.textures.getFrame(ASSET_KEYS.logo, "__BASE");
      if (frame) {
        const targetWidth = 198;
        const ratio = frame.height / frame.width;
        logo.setDisplaySize(targetWidth, targetWidth * ratio);
      }
    }

    const startButton = this.add
      .rectangle(width / 2, height / 2 + 100, 168, 46, 0xf5c46b)
      .setStrokeStyle(1, 0x4b2412, 0.36)
      .setInteractive({ useHandCursor: true });

    const startLabel = this.add
      .text(width / 2, height / 2 + 100, "Start", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#4B2412",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [startButton, startLabel],
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    startButton.on("pointerdown", () => {
      title.destroy();
      subtitle.destroy();
      logo?.destroy();
      startButton.destroy();
      startLabel.destroy();
      this.statusText?.setVisible(true);
      this.statusBackdrop?.setVisible(true);
      this.startRound();
    });
  }

  private startRound() {
    this.roundStarted = true;

    this.spawnTimer = this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => this.spawnItem(),
    });

    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameEnded || !this.roundStarted) {
          return;
        }

        this.timeLeft -= 1;
        this.timerText?.setText(`Time ${this.timeLeft}`);
        if (this.timeLeft <= 0) {
          this.endGame(false);
        }
      },
    });
  }

  private spawnItem() {
    if (this.gameEnded || !this.roundStarted) {
      return;
    }

    const { width, height } = this.scale;
    const x = Phaser.Math.Between(52, width - 52);
    const fallDuration = Phaser.Math.Between(2200, 3400);
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
            fontFamily: "Arial",
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
        this.endGame(false, "Chain coffee? Not here.");
        return;
      }

      this.score += 10;
      this.scoreText?.setText(`Score ${this.score}`);
      this.showFloatingFeedback(item.x, item.y, "+10", "#14532d");

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
        fontFamily: "Arial",
        fontSize: "26px",
        color,
        stroke: "#fff7ed",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: y - 42,
      alpha: 0,
      duration: 550,
      ease: "Cubic.easeOut",
      onComplete: () => feedback.destroy(),
    });
  }

  private endGame(won: boolean, lossMessage?: string) {
    if (this.gameEnded) {
      return;
    }

    this.gameEnded = true;
    this.spawnTimer?.remove(false);
    this.countdownTimer?.remove(false);

    if (won) {
      this.statusText?.setText("You earned your Colattao pass!");
      this.time.delayedCall(800, () => {
        EventBus.emit("GAME_WON", {
          score: this.score,
          rewardPercent: 5,
          wonAt: Date.now(),
        });
      });
      return;
    }

    this.statusText?.setText(lossMessage ?? "Almost there. Try again!");
    const { width, height } = this.scale;

    const restartButton = this.add
      .rectangle(width / 2, height - 94, 220, 64, 0xb45309)
      .setStrokeStyle(3, 0x78350f)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height - 94, "Restart", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#fff7ed",
      })
      .setOrigin(0.5);

    restartButton.on("pointerdown", () => {
      this.scene.restart();
    });
  }
}
