/* Run in a local browser with agent-browser eval --stdin. No production test hooks. */
(async () => {
  if (!["localhost", "127.0.0.1"].includes(location.hostname)) throw Error("Use a local verification server");
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const until = async (check) => { for (let i = 0; i < 80; i++) { if (check()) return; await wait(50); } throw Error("State transition timed out"); };
  await until(() => document.querySelector("canvas") && !document.body.innerText.includes("Preparing your fall favorites"));
  const host = document.getElementById("game-container");
  let fiber = host[Object.keys(host).find((key) => key.startsWith("__reactFiber$"))];
  let game;
  for (; fiber && !game; fiber = fiber.return) {
    for (let hook = fiber.memoizedState; hook; hook = hook.next) {
      const candidate = hook.memoizedState?.current;
      if (candidate?.scene?.getScene) { game = candidate; break; }
    }
  }
  assert(game, "Game mounted");
  window.__fallTestGame = game; // Browser-only verification handle, never part of app code.
  let scene = game.scene.getScene("DemoScene");
  const restart = async () => { scene.scene.restart(); await until(() => scene.phase === "start" && !scene.roundStarted); };
  if (scene.phase !== "start") await restart();
  const freezeTimers = () => { scene.spawnTimer?.remove(false); scene.countdownTimer?.remove(false); };
  const spawn = (index, bad = false) => {
    const random = Math.random;
    const values = [0.5, bad ? 0 : 0.99, (index + 0.1) / 4, 0.5];
    try { Math.random = () => values.shift() ?? 0.5; scene.spawnItem(); }
    finally { Math.random = random; }
    return [...scene.fallingItems].at(-1);
  };
  scene.overlayAction(); freezeTimers();
  const drinks = [];
  for (let index = 0; index < 4; index++) {
    const item = spawn(index);
    const art = item.list[0];
    const before = scene.score;
    assert(item.getData("textureKey") === "colattao-fall-drink-" + index, "Every configured drink spawns");
    assert(art.displayWidth <= 76.01 && art.displayHeight <= 76.01, "Sprite respects game size");
    assert(item.input.hitArea.contains(item.displayOriginX, item.displayOriginY), "Tap area contains the visible center");
    assert(item.input.hitArea.contains(item.displayOriginX + 30, item.displayOriginY + 30), "Tap area covers the lower-right of the drink");
    await wait(120);
    assert(art.displayWidth <= 76.01 && art.displayHeight <= 76.01, "Wobble preserves base scale");
    drinks.push({ key: item.getData("textureKey"), width: art.displayWidth, height: art.displayHeight });
    item.emit("pointerdown");
    assert(scene.score === before + 10, "One good tap adds exactly ten");
    assert(!scene.fallingItems.has(item), "Tapped collectible removed");
  }
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 360;
  game.textures.addCanvas("large-fixture", canvas);
  const large = scene.createCollectibleArt("large-fixture", "Fixture", 76, false);
  assert(large.displayWidth === 76 && large.displayHeight === 76, "360px asset is scaled correctly");
  large.destroy(); game.textures.remove("large-fixture");
  const fallback = scene.createCollectibleArt("unavailable-fixture", "Pumpkin", 76, false);
  assert(fallback.type === "Container" && fallback.list.length === 2, "Missing image produces a playable cup fallback");
  fallback.destroy();
  const levels = [];
  for (const [index, target, seconds] of [[0, 120, 20], [1, 180, 25], [2, 300, 30]]) {
    assert(scene.currentLevelIndex === index && scene.timeLeft === seconds, "Level order and time retained");
    assert(scene.level.targetScore === target, "Level target retained");
    while (!scene.gameEnded) { spawn(0).emit("pointerdown"); }
    assert(scene.score === target && scene.fallingItems.size === 0, "Target ends level and clears collectibles");
    levels.push({ target, seconds });
    if (index < 2) { assert(scene.phase === "level-complete", "Level completion screen"); scene.overlayAction(); freezeTimers(); }
  }
  await until(() => document.body.innerText.includes("Pass Earned"));
  assert(scene.totalScore === 600, "Three levels produce 600 cumulative points");
  const replay = [...document.querySelectorAll("button")].find((button) => /play again/i.test(button.textContent));
  assert(replay, "Completion replay available"); replay.click();
  await until(() => scene.phase === "start" && !document.body.innerText.includes("Pass Earned"));
  scene.overlayAction(); freezeTimers(); spawn(0, true).emit("pointerdown");
  assert(scene.phase === "lost" && scene.score === 0, "Bad tap loses without awarding score");
  scene.overlayAction(); await until(() => scene.phase === "start"); scene.overlayAction();
  scene.spawnTimer.remove(false); scene.timeLeft = 1;
  await until(() => scene.phase === "lost");
  assert(scene.timeLeft === 0, "Timeout follows countdown boundary");
  await restart(); scene.overlayAction();
  scene.spawnTimer.remove(false);
  const item = spawn(1);
  await wait(600);
  const pause = [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Pause");
  pause.click(); await wait(40);
  const frozen = { time: scene.timeLeft, y: item.y };
  await wait(1250);
  assert(game.scene.isPaused("DemoScene") && scene.timeLeft === frozen.time && item.y === frozen.y, "Pause freezes time and motion");
  pause.click(); await wait(100);
  assert(!game.scene.isPaused("DemoScene") && item.y > frozen.y, "Resume continues motion");
  await restart();
  assert(scene.fallingItems.size === 0, "Restart clears active items");
  assert(game.events.listenerCount("fall-action") === 1, "Restart does not duplicate action listener");
  assert(scene.scale.listenerCount("resize") >= 1, "Resize handling remains attached");
  return { pass: true, drinks, levels, cumulativeScore: 600, fallback: true, sizing360: true, badTap: true, timeout: true, replay: true, pauseResume: true };
})();
