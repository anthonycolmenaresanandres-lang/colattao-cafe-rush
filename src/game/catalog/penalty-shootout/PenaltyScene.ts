import Phaser from "phaser";

/**
 * Colattao Penalty Shootout — beta catalog title.
 *
 * Asset-free: the pitch, goal, keeper and "ball" (a Colattao cup motif) are all
 * drawn with Phaser graphics primitives, so there are no image dependencies and
 * no 404 risk. Mechanic: tap a corner of the goal to shoot; the keeper guesses a
 * random zone and dives; beat the guess to score. Best of 5, then tap to replay.
 *
 * STATUS: built but NOT visually QA'd. Layout math is resize-aware but the feel
 * (timing, keeper difficulty, brand polish) should be tuned with the game on a
 * real screen before this is promoted from "beta" to "live" in the catalog.
 *
 * Brand palette: espresso #1B0E08, gold #DAAE4F, cream #F8EDD7.
 */

const ESPRESSO = 0x1b0e08;
const ESPRESSO_DEEP = 0x120a04;
const GOLD = 0xdaae4f;
const CREAM = 0xf8edd7;
const NET = 0xffffff;
const GRASS = 0x254a2a;

const TOTAL_SHOTS = 5;
const ZONES = 5;

export class PenaltyScene extends Phaser.Scene {
  private goalGfx!: Phaser.GameObjects.Graphics;
  private pitchGfx!: Phaser.GameObjects.Graphics;
  private keeper!: Phaser.GameObjects.Graphics;
  private ball!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;

  // layout (recomputed on resize)
  private goalLeft = 0;
  private goalRight = 0;
  private goalLineY = 0;
  private keeperReach = 0;
  private zoneCenters: number[] = [];
  private ballStartX = 0;
  private ballStartY = 0;

  // state
  private shotsTaken = 0;
  private goals = 0;
  private isShooting = false;
  private gameOver = false;

  constructor() {
    super("PenaltyScene");
  }

  create() {
    this.pitchGfx = this.add.graphics();
    this.goalGfx = this.add.graphics();
    this.keeper = this.add.graphics();
    this.ball = this.add.graphics();

    this.scoreText = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "16px",
        color: "#F8EDD7",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(10);

    this.hintText = this.add
      .text(0, 0, "Tap a corner to shoot", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "13px",
        color: "#DAAE4F",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    this.resultText = this.add
      .text(0, 0, "", {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: "34px",
        color: "#F8EDD7",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setAlpha(0);

    this.drawKeeperShape();
    this.drawBallShape();

    this.layout();
    this.resetForNextShot();
    this.updateScore();

    this.input.on("pointerdown", this.onPointerDown, this);
    this.scale.on("resize", this.layout, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.onPointerDown, this);
      this.scale.off("resize", this.layout, this);
    });
  }

  // ── drawing ────────────────────────────────────────────────────────────
  private drawKeeperShape() {
    // Keeper drawn centered on local origin so it can be tweened by x/y.
    const w = 46;
    const h = 64;
    this.keeper.clear();
    this.keeper.fillStyle(GOLD, 1);
    this.keeper.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.keeper.lineStyle(3, ESPRESSO, 1);
    this.keeper.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    // simple gloves
    this.keeper.fillStyle(CREAM, 1);
    this.keeper.fillCircle(-w / 2, 0, 7);
    this.keeper.fillCircle(w / 2, 0, 7);
    this.keeper.setDepth(6);
  }

  private drawBallShape() {
    // "Ball" = Colattao cup motif: cream disc + gold ring + espresso center.
    const r = 16;
    this.ball.clear();
    this.ball.fillStyle(CREAM, 1);
    this.ball.fillCircle(0, 0, r);
    this.ball.lineStyle(4, GOLD, 1);
    this.ball.strokeCircle(0, 0, r);
    this.ball.fillStyle(ESPRESSO, 1);
    this.ball.fillCircle(0, 0, r * 0.45);
    this.ball.setDepth(8);
  }

  // ── layout (resize-aware) ────────────────────────────────────────────────
  private layout() {
    const w = this.scale.width;
    const h = this.scale.height;
    if (w < 10 || h < 10) return;

    const goalWidth = Math.min(w * 0.82, 420);
    this.goalLeft = (w - goalWidth) / 2;
    this.goalRight = this.goalLeft + goalWidth;
    const goalTop = h * 0.16;
    const goalHeight = Math.min(h * 0.2, 150);
    this.goalLineY = goalTop + goalHeight * 0.62;

    const zoneWidth = goalWidth / ZONES;
    this.keeperReach = zoneWidth * 0.55;
    this.zoneCenters = Array.from(
      { length: ZONES },
      (_, i) => this.goalLeft + zoneWidth * (i + 0.5),
    );

    this.ballStartX = w / 2;
    this.ballStartY = h * 0.82;

    // pitch background
    this.pitchGfx.clear();
    this.pitchGfx.fillStyle(ESPRESSO_DEEP, 1);
    this.pitchGfx.fillRect(0, 0, w, h);
    this.pitchGfx.fillStyle(GRASS, 1);
    this.pitchGfx.fillRect(0, goalTop, w, h - goalTop);
    // subtle center spot
    this.pitchGfx.lineStyle(2, CREAM, 0.18);
    this.pitchGfx.strokeCircle(w / 2, this.ballStartY, 30);

    // goal frame + net
    this.goalGfx.clear();
    this.goalGfx.lineStyle(6, NET, 0.95);
    this.goalGfx.strokeRect(this.goalLeft, goalTop, goalWidth, goalHeight);
    this.goalGfx.lineStyle(1, NET, 0.28);
    for (let i = 1; i < ZONES * 2; i++) {
      const x = this.goalLeft + (goalWidth / (ZONES * 2)) * i;
      this.goalGfx.lineBetween(x, goalTop, x, goalTop + goalHeight);
    }
    for (let i = 1; i < 5; i++) {
      const y = goalTop + (goalHeight / 5) * i;
      this.goalGfx.lineBetween(this.goalLeft, y, this.goalRight, y);
    }

    // reposition dynamic objects
    if (!this.isShooting) {
      this.keeper.setPosition(w / 2, this.goalLineY);
      this.ball.setPosition(this.ballStartX, this.ballStartY);
    }
    this.scoreText.setPosition(w / 2, 12);
    this.hintText.setPosition(w / 2, this.ballStartY + 46);
    this.resultText.setPosition(w / 2, h * 0.5);
  }

  // ── input ────────────────────────────────────────────────────────────────
  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gameOver) {
      this.restart();
      return;
    }
    if (this.isShooting) return;
    this.shoot(pointer.x);
  }

  private shoot(rawTargetX: number) {
    const pad = 18;
    const targetX = Phaser.Math.Clamp(
      rawTargetX,
      this.goalLeft + pad,
      this.goalRight - pad,
    );
    const keeperTargetX =
      this.zoneCenters[Phaser.Math.Between(0, ZONES - 1)];

    this.isShooting = true;
    this.hintText.setAlpha(0);

    this.tweens.add({
      targets: this.keeper,
      x: keeperTargetX,
      duration: 360,
      ease: "Quad.easeOut",
    });

    this.tweens.add({
      targets: this.ball,
      x: targetX,
      y: this.goalLineY,
      duration: 380,
      ease: "Quad.easeIn",
      onComplete: () => this.resolveShot(targetX, keeperTargetX),
    });
  }

  private resolveShot(targetX: number, keeperTargetX: number) {
    this.shotsTaken += 1;
    const saved = Math.abs(targetX - keeperTargetX) <= this.keeperReach;
    if (!saved) this.goals += 1;
    this.updateScore();

    this.flashResult(saved ? "SAVED!" : "GOAL!", saved ? "#e0a06a" : "#7bbf7b");

    this.time.delayedCall(900, () => {
      if (this.shotsTaken >= TOTAL_SHOTS) {
        this.endGame();
      } else {
        this.resetForNextShot();
      }
    });
  }

  private flashResult(text: string, color: string) {
    this.resultText.setText(text).setColor(color).setAlpha(1).setScale(0.7);
    this.tweens.add({
      targets: this.resultText,
      scale: 1,
      duration: 220,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: this.resultText,
      alpha: 0,
      delay: 600,
      duration: 300,
    });
  }

  private resetForNextShot() {
    this.isShooting = false;
    this.ball.setPosition(this.ballStartX, this.ballStartY);
    this.keeper.setPosition(this.scale.width / 2, this.goalLineY);
    if (!this.gameOver) this.hintText.setAlpha(1);
  }

  private endGame() {
    this.gameOver = true;
    this.hintText.setAlpha(0);
    this.resultText
      .setText(`${this.goals}/${TOTAL_SHOTS} scored\nTap to play again`)
      .setColor("#F8EDD7")
      .setAlpha(1)
      .setScale(1);
  }

  private restart() {
    this.shotsTaken = 0;
    this.goals = 0;
    this.gameOver = false;
    this.resultText.setAlpha(0);
    this.updateScore();
    this.resetForNextShot();
  }

  private updateScore() {
    this.scoreText.setText(
      `Goals ${this.goals}   ·   Shot ${Math.min(
        this.shotsTaken + (this.gameOver ? 0 : 1),
        TOTAL_SHOTS,
      )}/${TOTAL_SHOTS}`,
    );
  }
}
