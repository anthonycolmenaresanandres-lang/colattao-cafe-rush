/** Frame work touches only transforms/opacity; React never renders on scroll. */
export type MotionController = { setPaused: (paused: boolean) => void; destroy: () => void };
type Leaf = {
  node: HTMLElement; visual: HTMLElement; kind: string; angle: number;
  phase: "rest" | "loosen" | "falling" | "spent"; age: number;
  x: number; y: number; width: number; direction: number; startWind: number;
  gust: number; nodeStyle: string; visualStyle: string;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const MAX_AIRBORNE = 2;
const LOOSEN_MS = 140;
const FALL_MS = 1900;

export function createMotionController(root: HTMLElement): MotionController {
  const ledge = root.parentElement!;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const leaves: Leaf[] = Array.from(root.querySelectorAll<HTMLElement>("[data-leaf-id]"))
    .map((node) => ({
      node, visual: node.firstElementChild as HTMLElement, kind: node.dataset.kind!,
      angle: Number(node.dataset.angle), phase: "rest", age: 0,
      x: 0, y: 0, width: 0, direction: 1, startWind: 0,
      gust: 0, nodeStyle: node.style.cssText, visualStyle: (node.firstElementChild as HTMLElement).style.cssText,
    }));
  let frame = 0, lastFrame = 0, lastScroll = performance.now(), scrollY = window.scrollY;
  let wind = 0, targetWind = 0, lastInput = -Infinity, lastDetach = -Infinity;
  let visible = false, paused = false, destroyed = false;

  const airborne = () => leaves.filter((leaf) => leaf.phase === "loosen" || leaf.phase === "falling");
  const canRun = () => !destroyed && !paused && !media.matches && !document.hidden;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  };
  const wake = () => {
    if (canRun() && !frame && (visible || airborne().length)) frame = requestAnimationFrame(tick);
  };
  const setPhase = (leaf: Leaf, phase: Leaf["phase"]) => {
    leaf.phase = phase;
    leaf.node.dataset.state = phase;
  };
  const settle = () => {
    wind = 0;
    targetWind = 0;
    for (const leaf of leaves) {
      if (leaf.phase === "rest") leaf.visual.style.transform = `rotate(${leaf.angle}deg)`;
    }
  };
  const spend = (leaf: Leaf) => {
    setPhase(leaf, "spent");
    leaf.node.style.visibility = "hidden";
    leaf.visual.style.willChange = "";
  };

  // Freeze the SAME positioner in viewport coordinates. Its untransformed box
  // and the child's current transform are preserved: no clone, gap or visual jump.
  const detach = (leaf: Leaf) => {
    const box = leaf.node.getBoundingClientRect();
    leaf.startWind = leaf.gust;
    leaf.x = box.left;
    leaf.y = box.top;
    leaf.width = box.width;
    leaf.direction = box.left + box.width / 2 < innerWidth / 2 ? -1 : 1;
    leaf.node.style.position = "fixed";
    leaf.node.style.left = `${box.left}px`;
    leaf.node.style.top = `${box.top}px`;
    leaf.node.style.zIndex = "40";
    setPhase(leaf, "falling");
    leaf.age = 0;
  };

  const rustle = (leaf: Leaf, gust: number) => {
    leaf.gust = gust;
    const strength = leaf.kind === "loose" ? 0.65 : 1;
    leaf.visual.style.transform = `translate3d(${gust * 2 * strength}px, ${-Math.abs(gust) * 0.8 * strength}px, 0) rotate(${leaf.angle + gust * 4 * strength}deg)`;
  };

  function tick(now: number) {
    frame = 0;
    if (!canRun()) return;
    const dt = lastFrame ? Math.min(now - lastFrame, 40) : 16;
    lastFrame = now;
    targetWind *= Math.exp(-dt / 125);
    wind += (targetWind - wind) * (1 - Math.exp(-dt / 90));

    for (const leaf of leaves) {
      if (leaf.kind === "anchor" || leaf.phase === "spent") continue;
      if (leaf.phase === "rest") {
        if (visible) rustle(leaf, wind);
      } else if (leaf.phase === "loosen") {
        leaf.age += dt;
        rustle(leaf, leaf.startWind + Math.sin(leaf.age / 28) * 0.3);
        if (leaf.age >= LOOSEN_MS) {
          // Still visible? Never launch a leaf from behind the sticky header.
          if (leaf.node.getBoundingClientRect().top > 78) detach(leaf);
          else spend(leaf);
        }
      } else {
        leaf.age += dt;
        const p = Math.min(leaf.age / FALL_MS, 1);
        const easeOut = 1 - Math.pow(1 - p, 3);
        // Drift into the side gutter before descending alongside the text.
        const targetX = leaf.direction < 0
          ? 9 + (innerWidth - Math.min(innerWidth, 470)) / 2
          : (innerWidth + Math.min(innerWidth, 470)) / 2 - leaf.width - 9;
        const drift = (targetX - leaf.x) * Math.min(p / 0.24, 1);
        const flutter = Math.sin(p * Math.PI * 5) * 3 * Math.sin(p * Math.PI);
        const dy = (28 + Math.min(innerHeight * 0.48, 330) * p) * p;
        const startX = leaf.startWind * 2;
        const startY = -Math.abs(leaf.startWind) * 0.8;
        leaf.visual.style.transform = `translate3d(${startX * (1 - easeOut) + drift + flutter}px, ${startY * (1 - easeOut) + dy}px, 0) rotate(${leaf.angle + leaf.startWind * 4 + leaf.direction * 195 * p + Math.sin(p * 15) * 15}deg) scaleX(${1 - Math.sin(p * Math.PI * 4) ** 2 * 0.55})`;
        leaf.visual.style.opacity = String(p < 0.22 ? 1 - p * 2.2 : Math.max(0, (1 - p) * 0.66));
        if (p === 1 || leaf.y + dy > innerHeight + 50) spend(leaf);
      }
    }
    if (airborne().length || (visible && Math.abs(wind) + Math.abs(targetWind) > 0.015)) wake();
    else { settle(); lastFrame = 0; }
  }

  const markInput = () => { lastInput = performance.now(); };
  const onKey = (event: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) markInput();
  };
  const onScroll = () => {
    const now = performance.now();
    const delta = window.scrollY - scrollY;
    const velocity = clamp(delta / clamp(now - lastScroll, 16, 64), -5, 5);
    scrollY = window.scrollY;
    lastScroll = now;
    if (!canRun() || !visible) return;
    targetWind = velocity;
    const rim = ledge.getBoundingClientRect().top;
    const gestureUpgrade = Math.abs(velocity) > 3 && airborne().length === 1 && now - lastDetach < 220;
    // Input gate prevents category links, history restoration and layout changes
    // from being mistaken for a flick. Native touch and wheel are never canceled.
    if (now - lastInput < 300 && Math.abs(velocity) > 1.25 &&
        (now - lastDetach > 900 || gestureUpgrade) && rim > 100 && rim < innerHeight - 20) {
      const limit = Math.abs(velocity) > 3 ? MAX_AIRBORNE : 1;
      const slots = Math.max(0, limit - airborne().length);
      const candidates = leaves.filter((leaf) => leaf.kind === "edge" && leaf.phase === "rest");
      for (const leaf of candidates.slice(0, slots)) {
        setPhase(leaf, "loosen");
        leaf.age = 0;
        leaf.startWind = wind;
        leaf.visual.style.willChange = "transform, opacity";
      }
      if (slots && candidates.length) lastDetach = now;
    }
    wake();
  };
  const sync = () => {
    stop();
    scrollY = window.scrollY;
    lastScroll = performance.now();
    if (media.matches) {
      airborne().forEach(spend);
      settle();
    }
    root.dataset.motion = media.matches ? "reduced" : paused ? "paused" : document.hidden ? "hidden" : "ready";
    wake();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) settle();
    if (!visible && !airborne().length) stop();
    else wake();
  });
  observer.observe(ledge);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", markInput, { passive: true });
  window.addEventListener("touchmove", markInput, { passive: true });
  window.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", sync);
  media.addEventListener("change", sync);
  // A resized viewport invalidates fixed coordinates; retire airborne leaves
  // instead of teleporting them back onto the ledge.
  const onResize = () => { airborne().forEach(spend); sync(); };
  window.addEventListener("resize", onResize, { passive: true });
  sync();

  return {
    setPaused(value) { paused = value; sync(); },
    destroy() {
      destroyed = true;
      stop();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", markInput);
      window.removeEventListener("touchmove", markInput);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
      // Restore the deterministic starting DOM for Strict Mode's effect replay.
      leaves.forEach((leaf) => {
        leaf.node.style.cssText = leaf.nodeStyle;
        leaf.visual.style.cssText = leaf.visualStyle;
        leaf.node.dataset.state = "rest";
      });
    },
  };
}
