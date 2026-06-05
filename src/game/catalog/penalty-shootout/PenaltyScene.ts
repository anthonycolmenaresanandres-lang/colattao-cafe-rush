import Phaser from "phaser";

/**
 * Colattao Penalty Shootout - R&D alpha.
 *
 * Asset-free mini-game for the isolated R&D harness. It draws the pitch, goal,
 * keeper, ball, aim zones, and overlays with Phaser primitives only.
 */

const ESPRESSO = 0x1b0e08;
const ESPRESSO_DEEP = 0x120a04;
const GOLD = 0xdaae4f;
const GOLD_SOFT = 0xe7c77d;
const CREAM = 0xf8edd7;
const NET = 0xffffff;
const GRASS = 0x244a2a;
const GRASS_DEEP = 0x17351f;
const SUCCESS = 0x8ccf88;
const WARNING = 0xf0b46a;
const DANGER = 0xe37260;

const TOTAL_SHOTS = 5;
const WIN_THRESHOLD = 3;
const ZONES = 5;

type GameState = "start" | "playing" | "complete";
type ShotOutcome = "goal" | "saved" | "miss";

export class PenaltyScene extends Phaser.Scene {
  private pitchGfx!: Phaser.GameObjects.Graphics;
  private goalGfx!: Phaser.GameObjects.Graphics;
  private zoneGfx!: Phaser.GameObjects.Graphics;
  private uiGfx!: Phaser.GameObjects.Graphics;
  private overlayGfx!: Phaser.GameObjects.Graphics;
  private keeper!: Phaser.GameObjects.Graphics;
  private ball!: Phaser.GameObjects.Graphics;

  private scoreText!: Phaser.GameObjects.Text;
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
  private safeLeft = 0;
  private safeRight = 0;
  private keeperReach = 0;
  private zoneWidth = 0;
  private zoneCenters: number[] = [];
  private ballStartX = 0;
  private ballStartY = 0;

  private shotsTaken = 0;
  private goals = 0;
  private isShooting = false;
  private state: GameState = "start";

  constructor() {
    super("PenaltyScene");
  }

  create() {
    this.pitchGfx = this.add.graphics();
    this.goalGfx = this.add.graphics();
    this.zoneGfx = this.add.graphics();
    this.uiGfx = this.add.graphics();
    this.overlayGfx = this.add.graphics();
    this.keeper = this.add.graphics();
    this.ball = this.add.graphics();

    this.scoreText = this.makeText("", 20, "#F8EDD7", "bold").setDepth(20);
    this.shotText = this.makeText("", 12, "#DAAE4F", "bold").setDepth(20);
    this.instructionText = this.makeText("", 14, "#F8EDD7", "bold").setDepth(20);
    this.resultText = this.makeText("", 40, "#F8EDD7", "bold", "serif")
      .setAlpha(0)
      .setDepth(40);
    this.subResultText = this.makeText("", 15, "#F8EDD7", "normal")
      .setAlpha(0)
      .setDepth(40);
    this.startTitleText = this.makeText("Penalty Shootout", 34, "#F8EDD7", "bold", "serif")
      .setAlpha(0)
      .setDepth(50);
    this.startBodyText = this.makeText(
      "Tap a gold zone in the goal.\nBeat the keeper. Avoid the red edges.\nScore 3 of 5 to win.",
      15,
      "#F8EDD7",
      "normal",
    )
      .setAlpha(0)
      .setDepth(50);
    this.startCtaText = this.makeText("Tap to start", 15, "#1B0E08", "bold")
      .setAlpha(0)
      .setDepth(51);
    this.restartText = this.makeText("Tap to play again", 15, "#1B0E08", "bold")
      .setAlpha(0)
      .setDepth(51);

    this.drawKeeperShape();
    this.drawBallShape();
    this.layout();
    this.showStartScreen();

    this.input.on("pointerdown", this.onPointerDown, this);
    this.scale.on("resize", this.layout, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.onPointerDown, this);
      this.scale.off("resize", this.layout, this);
    });
  }

  private makeText(
    text: string,
    size: number,
    color: string,
    weight: "normal" | "bold" = "normal",
    family: "sans" | "serif" = "sans",
  ) {
    return this.add
      .text(0, 0, text, {
        fontFamily:
          family === "serif"
            ? '"Playfair Display", Georgia, serif'
            : "Inter, system-ui, sans-serif",
        fontSize: `${size}px`,
        color,
        fontStyle: weight,
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);
  }

  private drawKeeperShape() {
    const w = 54;
    const h = 70;
    this.keeper.clear();
    this.keeper.fillStyle(GOLD, 1);
    this.keeper.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    this.keeper.lineStyle(4, ESPRESSO, 1);
    this.keeper.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    this.keeper.fillStyle(CREAM, 1);
    this.keeper.fillCircle(-w / 2 - 3, 0, 9);
    this.keeper.fillCircle(w / 2 + 3, 0, 9);
    this.keeper.fillStyle(ESPRESSO, 1);
    this.keeper.fillCircle(-9, -14, 3);
    this.keeper.fillCircle(9, -14, 3);
    this.keeper.setDepth(9);
  }

  private drawBallShape() {
    const r = 17;
    this.ball.clear();
    this.ball.fillStyle(CREAM, 1);
    this.ball.fillCircle(0, 0, r);
    this.ball.lineStyle(4, GOLD, 1);
    this.ball.strokeCircle(0, 0, r);
    this.ball.fillStyle(ESPRESSO, 1);
    this.ball.fillCircle(0, 0, r * 0.42);
    this.ball.lineStyle(2, ESPRESSO, 0.6);
    this.ball.lineBetween(-8, -5, 8, 5);
    this.ball.setDepth(12);
  }

  private layout() {
    const w = this.scale.width;
    const h = this.scale.height;
    if (w < 10 || h < 10) return;

    const compact = w < 380 || h < 640;
    const goalWidth = Math.min(w * 0.9, 430);
    this.goalLeft = (w - goalWidth) / 2;
    this.goalRight = this.goalLeft + goalWidth;
    this.goalTop = h * (compact ? 0.18 : 0.17);
    this.goalHeight = Math.min(h * (compact ? 0.25 : 0.23), 160);
    this.goalLineY = this.goalTop + this.goalHeight * 0.64;

    this.zoneWidth = goalWidth / ZONES;
    const edgeDanger = Math.max(18, this.zoneWidth * 0.28);
    this.safeLeft = this.goalLeft + edgeDanger;
    this.safeRight = this.goalRight - edgeDanger;
    this.keeperReach = this.zoneWidth * 0.48;
    this.zoneCenters = Array.from(
      { length: ZONES },
      (_, i) => this.goalLeft + this.zoneWidth * (i + 0.5),
    );

    this.ballStartX = w / 2;
    this.ballStartY = h * (compact ? 0.82 : 0.8);

    this.drawPitch(w, h);
    this.drawGoal();
    this.drawZones();
    this.drawScorePanel(w);

    if (!this.isShooting) {
      this.keeper.setPosition(w / 2, this.goalLineY);
      this.ball.setPosition(this.ballStartX, this.ballStartY);
    }

    this.scoreText.setPosition(w / 2, 22);
    this.shotText.setPosition(w / 2, 48);
    this.instructionText.setPosition(w / 2, this.ballStartY + (compact ? 42 : 50));
    this.resultText.setPosition(w / 2, h * 0.5);
    this.subResultText.setPosition(w / 2, h * 0.5 + 46);
    this.startTitleText.setPosition(w / 2, h * 0.38);
    this.startBodyText.setPosition(w / 2, h * 0.49);
    this.startCtaText.setPosition(w / 2, h * 0.65);
    this.restartText.setPosition(w / 2, h * 0.64);

    if (this.state === "start") this.drawStartOverlay();
    if (this.state === "complete") this.drawRestartButton();
  }

  private drawPitch(w: number, h: number) {
    this.pitchGfx.clear();
    this.pitchGfx.fillStyle(ESPRESSO_DEEP, 1);
    this.pitchGfx.fillRect(0, 0, w, h);
    this.pitchGfx.fillStyle(GRASS_DEEP, 1);
    this.pitchGfx.fillRect(0, this.goalTop - 18, w, h);
    this.pitchGfx.fillStyle(GRASS, 1);
    this.pitchGfx.fillRect(0, this.goalTop + this.goalHeight * 0.55, w, h);
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
    this.goalGfx.lineStyle(3, GOLD, 0.85);
    this.goalGfx.lineBetween(this.safeLeft, this.goalTop + 5, this.safeLeft, this.goalTop + this.goalHeight - 5);
    this.goalGfx.lineBetween(this.safeRight, this.goalTop + 5, this.safeRight, this.goalTop + this.goalHeight - 5);
  }

  private drawZones() {
    this.zoneGfx.clear();
    for (let i = 0; i < ZONES; i += 1) {
      const x = this.goalLeft + this.zoneWidth * i;
      const isEdge = i === 0 || i === ZONES - 1;
      this.zoneGfx.fillStyle(isEdge ? DANGER : GOLD, isEdge ? 0.2 : 0.16);
      this.zoneGfx.fillRect(x + 3, this.goalTop + 4, this.zoneWidth - 6, this.goalHeight - 8);
      this.zoneGfx.lineStyle(1, isEdge ? DANGER : GOLD, isEdge ? 0.55 : 0.45);
      this.zoneGfx.strokeRect(x + 3, this.goalTop + 4, this.zoneWidth - 6, this.goalHeight - 8);
    }
  }

  private drawScorePanel(w: number) {
    this.uiGfx.clear();
    this.uiGfx.fillStyle(ESPRESSO, 0.76);
    this.uiGfx.fillRoundedRect(Math.max(14, w / 2 - 145), 10, Math.min(290, w - 28), 60, 14);
    this.uiGfx.lineStyle(1, GOLD, 0.55);
    this.uiGfx.strokeRoundedRect(Math.max(14, w / 2 - 145), 10, Math.min(290, w - 28), 60, 14);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.state === "start") {
      this.startGame();
      return;
    }
    if (this.state === "complete") {
      this.restart();
      return;
    }
    if (this.isShooting) return;
    this.shoot(pointer.x);
  }

  private startGame() {
    this.state = "playing";
    this.shotsTaken = 0;
    this.goals = 0;
    this.overlayGfx.clear();
    this.startTitleText.setAlpha(0);
    this.startBodyText.setAlpha(0);
    this.startCtaText.setAlpha(0);
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
    const targetX = Phaser.Math.Clamp(rawTargetX, this.goalLeft - 28, this.goalRight + 28);
    const keeperTargetX = this.zoneCenters[Phaser.Math.Between(0, ZONES - 1)];
    const outcome = this.pickOutcome(targetX, keeperTargetX);
    const finalY = outcome === "miss" ? this.goalTop + this.goalHeight + 26 : this.goalLineY;

    this.isShooting = true;
    this.instructionText.setText("Shot in motion...");
    this.resultText.setAlpha(0);
    this.subResultText.setAlpha(0);

    this.tweens.add({
      targets: this.keeper,
      x: keeperTargetX,
      duration: 380,
      ease: "Quad.easeOut",
    });

    this.tweens.add({
      targets: this.ball,
      x: targetX,
      y: finalY,
      scale: outcome === "miss" ? 0.86 : 0.72,
      duration: 420,
      ease: "Quad.easeIn",
      onComplete: () => this.resolveShot(outcome),
    });
  }

  private pickOutcome(targetX: number, keeperTargetX: number): ShotOutcome {
    const outsideGoal = targetX < this.goalLeft || targetX > this.goalRight;
    const unsafeEdge = targetX < this.safeLeft || targetX > this.safeRight;
    if (outsideGoal || unsafeEdge) return "miss";
    if (Math.abs(targetX - keeperTargetX) <= this.keeperReach) return "saved";
    return "goal";
  }

  private resolveShot(outcome: ShotOutcome) {
    this.shotsTaken += 1;
    if (outcome === "goal") this.goals += 1;
    this.updateScore();

    const text = outcome === "goal" ? "GOAL!" : outcome === "saved" ? "SAVED!" : "MISS!";
    const color = outcome === "goal" ? "#8CCF88" : outcome === "saved" ? "#F0B46A" : "#E37260";
    const subtext =
      outcome === "goal"
        ? "Clean strike. The keeper guessed wrong."
        : outcome === "saved"
          ? "Keeper read the shot."
          : "Too close to the edge. Keep it on frame.";

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

  private resetForNextShot() {
    this.isShooting = false;
    this.ball.setScale(1);
    this.ball.setPosition(this.ballStartX, this.ballStartY);
    this.keeper.setPosition(this.scale.width / 2, this.goalLineY);
    this.instructionText.setText("Tap the gold zones. Red edges miss.");
  }

  private endGame() {
    const won = this.goals >= WIN_THRESHOLD;
    this.state = "complete";
    this.isShooting = false;
    this.ball.setScale(1);
    this.instructionText.setText("");
    this.overlayGfx.clear();
    this.drawRestartButton();
    this.resultText
      .setText(won ? "YOU WIN" : "TRY AGAIN")
      .setColor(won ? "#8CCF88" : "#F0B46A")
      .setAlpha(1)
      .setScale(1);
    this.subResultText
      .setText(`${this.goals}/${TOTAL_SHOTS} scored. ${won ? "Colattao energy wins the shootout." : "Score 3 goals to win."}`)
      .setColor("#F8EDD7")
      .setAlpha(1);
    this.restartText.setAlpha(1);
    this.updateScore();
  }

  private restart() {
    this.overlayGfx.clear();
    this.restartText.setAlpha(0);
    this.startGame();
  }

  private showStartScreen() {
    this.state = "start";
    this.updateScore();
    this.instructionText.setText("");
    this.resultText.setAlpha(0);
    this.subResultText.setAlpha(0);
    this.restartText.setAlpha(0);
    this.zoneGfx.setAlpha(0.85);
    this.keeper.setAlpha(0.9);
    this.ball.setAlpha(0.9);
    this.drawStartOverlay();
    this.startTitleText.setAlpha(1);
    this.startBodyText.setAlpha(1);
    this.startCtaText.setAlpha(1);
  }

  private drawStartOverlay() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.overlayGfx.clear();
    this.overlayGfx.fillStyle(ESPRESSO_DEEP, 0.72);
    this.overlayGfx.fillRect(0, 0, w, h);
    this.overlayGfx.fillStyle(CREAM, 0.96);
    this.overlayGfx.fillRoundedRect(w / 2 - 74, h * 0.65 - 19, 148, 38, 18);
    this.overlayGfx.lineStyle(2, GOLD_SOFT, 0.9);
    this.overlayGfx.strokeRoundedRect(w / 2 - 74, h * 0.65 - 19, 148, 38, 18);
    this.overlayGfx.setDepth(45);
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
    this.overlayGfx.setDepth(35);
  }

  private updateScore() {
    const nextShot = Math.min(this.shotsTaken + (this.state === "playing" ? 1 : 0), TOTAL_SHOTS);
    this.scoreText.setText(`Goals ${this.goals}/${WIN_THRESHOLD}`);
    this.shotText.setText(
      this.state === "start"
        ? `Best of ${TOTAL_SHOTS}`
        : this.state === "complete"
          ? `Final: ${this.goals}/${TOTAL_SHOTS}`
          : `Shot ${nextShot}/${TOTAL_SHOTS}`,
    );
  }
}
