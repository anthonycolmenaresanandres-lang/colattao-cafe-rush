import {
  clamp, fallDuration, landingPose, MAX_AIRBORNE, MAX_LANDED, pathVelocity, releaseDelay, samplePath,
  type Path, type Pose, type Velocity,
} from "./leafMotion";

export type CascadeState = "idle" | "running" | "complete";
export type MotionController = { setPaused: (paused: boolean) => void; startCascade: () => void; destroy: () => void };
type Source = {
  node: HTMLElement; visual: HTMLElement; order: number; angle: number; gust: number;
  spent: boolean; nodeStyle: string; visualStyle: string;
};
type Flight = {
  node: HTMLElement; visual: HTMLElement; source: Source | null;
  phase: "available" | "loosen" | "falling" | "settling" | "landed";
  path: Path | null; pose: Pose; age: number; size: number; direction: number;
  landing: number | null;
};
const STILL: Velocity = { x: 0, y: 0, angle: 0 };
const editable = () => {
  const element = document.activeElement;
  return element instanceof HTMLElement && (element.matches("input, textarea, select") || element.isContentEditable);
};

/** One sleeping RAF loop. React never re-renders in response to scrolling. */
export function createMotionController(root: HTMLElement, layer: HTMLElement,
  onCascadeChange: (state: CascadeState) => void = () => {}): MotionController {
  const ledge = root.querySelector<HTMLElement>("[data-leaf-ledge]")!;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sources: Source[] = Array.from(root.querySelectorAll<HTMLElement>("[data-leaf-id]")).map((node) => ({
    node, visual: node.firstElementChild as HTMLElement, order: Number(node.dataset.releaseOrder),
    angle: Number(node.dataset.angle), gust: 0, spent: false,
    nodeStyle: node.style.cssText, visualStyle: (node.firstElementChild as HTMLElement).style.cssText,
  })).sort((a, b) => a.order - b.order);
  const flights: Flight[] = Array.from(layer.querySelectorAll<HTMLElement>("[data-flight-slot]")).map((node) => ({
    node, visual: node.firstElementChild as HTMLElement, source: null, phase: "available",
    path: null, pose: { x: 0, y: 0, angle: 0, scale: 1 }, age: 0, size: 0, direction: 1, landing: null,
  }));
  const readViewport = () => ({
    width: innerWidth,
    height: (window.visualViewport?.height ?? innerHeight) + (window.visualViewport?.offsetTop ?? 0),
  });
  let viewport = readViewport();
  let frame = 0, lastFrame = 0, scrollY = window.scrollY, lastScroll = performance.now();
  let wind = 0, targetWind = 0, lastInput = -Infinity, serial = 0;
  let cascade: CascadeState = "idle", cascadeAge = 0, nextSource = 0;
  let rim = ledge.getBoundingClientRect().top, visible = false, paused = false, destroyed = false;

  const active = () => flights.filter((flight) => flight.phase !== "available" && flight.phase !== "landed");
  const canRun = () => !destroyed && !paused && !media.matches && !document.hidden && !editable();
  const stop = () => { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; };
  const wake = () => {
    if (canRun() && !frame && (visible || active().length || cascade === "running")) frame = requestAnimationFrame(tick);
  };
  const setPhase = (flight: Flight, phase: Flight["phase"]) => {
    flight.phase = phase;
    flight.node.dataset.state = phase;
    flight.node.style.willChange = phase === "available" || phase === "landed" ? "" : "transform";
    flight.visual.style.willChange = flight.node.style.willChange;
  };
  const paint = (flight: Flight) => {
    const pose = flight.pose;
    flight.node.style.transform = `translate3d(${pose.x}px, ${pose.y}px, 0)`;
    flight.visual.style.transform = `rotate(${pose.angle}deg) scaleX(${pose.scale})`;
  };
  const rest = () => {
    wind = targetWind = 0;
    for (const source of sources) {
      if (!source.spent) {
        source.gust = 0;
        source.visual.style.transform = `rotate(${source.angle}deg)`;
      }
    }
  };
  const recycle = (flight: Flight) => {
    setPhase(flight, "available");
    flight.source = null;
    flight.path = null;
    flight.landing = null;
    delete flight.node.dataset.leafId;
  };
  const restoreSources = () => {
    for (const source of sources) {
      source.spent = false;
      source.gust = 0;
      source.node.style.cssText = source.nodeStyle;
      source.visual.style.cssText = source.visualStyle;
      source.node.dataset.state = "rest";
    }
  };
  const setCascade = (state: CascadeState) => {
    cascade = state;
    root.dataset.cascade = state;
    onCascadeChange(state);
  };
  const startCascade = () => {
    if (!canRun() || cascade === "running") return;
    if (cascade === "complete") {
      flights.forEach(recycle);
      restoreSources();
    }
    nextSource = 0;
    cascadeAge = 0;
    setCascade("running");
    wake();
  };
  const destination = (flight: Flight) => flight.landing === null
    ? { x: flight.direction < 0 ? 3 : viewport.width - flight.size - 3,
      y: viewport.height + Math.hypot(flight.size, flight.size * 1.2) + 8,
      angle: flight.pose.angle + flight.direction * 45, scale: 1 }
    : landingPose(viewport.width, viewport.height, flight.size, flight.landing);
  const beginFall = (flight: Flight, velocity: Velocity) => {
    let end = destination(flight);
    if (end.y - 24 <= flight.pose.y) {
      flight.landing = null;
      end = destination(flight);
    }
    if (flight.landing !== null) end.y -= 24;
    end.y = Math.max(end.y, flight.pose.y + 24);
    flight.path = {
      from: { ...flight.pose }, to: end, velocity,
      endVelocity: { x: 0, y: flight.landing === null ? 125 : 90, angle: 0 },
      duration: fallDuration(end.y - flight.pose.y), sway: 4, rock: 19, direction: flight.direction,
    };
    flight.age = 0;
    setPhase(flight, "falling");
  };
  const release = (source: Source) => {
    const flight = flights.find((candidate) => candidate.phase === "available");
    if (!flight) return;
    const box = source.node.getBoundingClientRect();
    const direction = box.left + box.width / 2 < viewport.width / 2 ? -1 : 1;
    const occupied = new Set(flights.filter((candidate) => candidate.phase !== "available").map((candidate) => candidate.landing));
    const landing = Array.from({ length: MAX_LANDED }, (_, index) => index)
      .find((index) => index % 2 === (direction < 0 ? 0 : 1) && !occupied.has(index)) ?? null;
    flight.source = source;
    flight.size = box.width;
    flight.direction = direction;
    flight.landing = landing;
    flight.pose = {
      x: box.left + source.gust * 2,
      // A fast scroll may carry the remaining rim above the screen between
      // releases. Keep that handoff wholly above view, without a long invisible fall.
      y: Math.max(box.top - Math.abs(source.gust) * 0.8, -box.height * 2),
      angle: source.angle + source.gust * 4, scale: 1,
    };
    flight.node.style.width = `${box.width}px`;
    flight.node.style.height = `${box.height}px`;
    flight.visual.style.backgroundImage = source.visual.style.backgroundImage;
    flight.node.dataset.leafId = `${source.node.dataset.leafId}-flight-${++serial}`;
    flight.path = {
      from: { ...flight.pose },
      to: { ...flight.pose, x: direction < 0
        ? (viewport.width - Math.min(viewport.width, 470)) / 2 + 2
        : (viewport.width + Math.min(viewport.width, 470)) / 2 - box.width - 2,
        y: flight.pose.y + 8, angle: flight.pose.angle + direction * 10 },
      velocity: STILL, endVelocity: { x: 0, y: 30, angle: 0 },
      duration: 400 + (source.order % 3) * 45, sway: 0, rock: 0, direction,
    };
    flight.age = 0;
    // Exact same-frame handoff: artwork, size, transform origin and current pose
    // match. Hide the source first. This slot stays the same through landing.
    paint(flight);
    source.spent = true;
    source.node.dataset.state = "spent";
    source.node.style.visibility = "hidden";
    setPhase(flight, "loosen");
  };
  const tryStart = (now: number) => {
    if (cascade !== "idle") return;
    if (!visible || rim < 95 || rim > viewport.height - 28 || now - lastInput > 1000) return;
    if (Math.abs(wind) > 0.4) startCascade();
  };

  function tick(now: number) {
    frame = 0;
    if (!canRun()) return;
    const dt = lastFrame ? Math.min(now - lastFrame, 40) : 16;
    lastFrame = now;
    targetWind *= Math.exp(-dt / 200);
    wind += (targetWind - wind) * (1 - Math.exp(-dt / 120));
    for (const source of sources) {
      if (source.spent || !visible) continue;
      const strength = 0.65 + (source.order % 3) * 0.15;
      source.gust = wind * strength;
      source.visual.style.transform = `translate3d(${source.gust * 2}px, ${-Math.abs(source.gust) * 0.8}px, 0) rotate(${source.angle + source.gust * 4}deg)`;
    }
    tryStart(now);
    if (cascade === "running") {
      cascadeAge += dt;
      while (nextSource < sources.length && cascadeAge >= releaseDelay(nextSource) && active().length < MAX_AIRBORNE) {
        release(sources[nextSource++]);
      }
    }
    for (const flight of active()) {
      if (!flight.path) continue;
      flight.age = Math.min(flight.path.duration, flight.age + dt);
      flight.pose = samplePath(flight.path, flight.age);
      paint(flight);
      if (flight.age < flight.path.duration) continue;
      const velocity = pathVelocity(flight.path, flight.age);
      if (flight.phase === "loosen") beginFall(flight, velocity);
      else if (flight.phase === "falling" && flight.landing !== null) {
        flight.path = {
          from: { ...flight.pose }, to: destination(flight), velocity, duration: 420,
          sway: 0, rock: 0, direction: flight.direction,
        };
        flight.age = 0;
        setPhase(flight, "settling");
      } else if (flight.phase === "settling") {
        setPhase(flight, "landed");
        flight.path = null;
        flight.source = null;
      } else {
        // The entire rotated leaf has passed below the viewport. No early fade.
        recycle(flight);
      }
    }
    if (cascade === "running" && nextSource === sources.length && !active().length) setCascade("complete");
    if (cascade === "running" || active().length || (visible && Math.abs(wind) + Math.abs(targetWind) > 0.015)) wake();
    else { rest(); lastFrame = 0; }
  }

  const markInput = () => {
    const now = performance.now();
    if (now - lastInput > 150) lastScroll = now - 16;
    lastInput = now;
  };
  const onKey = (event: KeyboardEvent) => {
    if (!editable() && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) markInput();
  };
  const onNavigation = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("a[href*='#']")) {
      lastInput = -Infinity;
      targetWind = 0;
    }
  };
  const onScroll = () => {
    const now = performance.now();
    const delta = window.scrollY - scrollY;
    const velocity = clamp(delta / clamp(now - lastScroll, 16, 80), -5, 5);
    const previousRim = rim;
    scrollY = window.scrollY;
    lastScroll = now;
    rim = ledge.getBoundingClientRect().top;
    visible = rim > 70 && rim < viewport.height + 40;
    if (!canRun()) return;
    // Native momentum is accepted; category links/history/layout do not supply wind.
    if (now - lastInput < 1000) {
      targetWind = velocity;
      if (cascade === "idle" && Math.abs(delta) > 30 && previousRim > 70 &&
        previousRim < viewport.height + 40 && rim <= 70) startCascade();
    }
    if (!visible) rest();
    wake();
  };
  const onResize = () => {
    const next = readViewport();
    if (next.width === viewport.width && Math.abs(next.height - viewport.height) < 0.5) return;
    viewport = next;
    rim = ledge.getBoundingClientRect().top;
    visible = rim > 70 && rim < viewport.height + 40;
    for (const flight of flights) {
      if (flight.phase === "landed") {
        flight.pose = destination(flight);
        paint(flight);
      } else if (flight.path && flight.phase !== "loosen") {
        const velocity = pathVelocity(flight.path, flight.age);
        let end = destination(flight);
        if (end.y <= flight.pose.y + (flight.phase === "falling" ? 24 : 0)) {
          // If the new floor is above this leaf, continue DOWN and offscreen.
          flight.landing = null;
          end = destination(flight);
          setPhase(flight, "falling");
        } else if (flight.phase === "falling" && flight.landing !== null) end.y -= 24;
        end.y = Math.max(end.y, flight.pose.y + 24);
        const remaining = flight.path.duration - flight.age;
        const addedDistance = end.y - flight.path.to.y;
        flight.path = {
          ...flight.path, from: { ...flight.pose }, to: end, velocity,
          duration: clamp(remaining + addedDistance / 120 * 1000, 420, 7000),
        };
        flight.age = 0;
      }
    }
    wake();
  };
  const sync = () => {
    if (destroyed) return;
    stop();
    scrollY = window.scrollY;
    lastScroll = performance.now();
    lastInput = -Infinity;
    layer.dataset.suspended = String(editable());
    if (media.matches) {
      active().forEach(recycle);
      if (cascade === "running") setCascade("complete");
      rest();
    }
    root.dataset.motion = media.matches ? "reduced" : paused ? "paused" : document.hidden ? "hidden" : editable() ? "keyboard" : "ready";
    onResize();
    wake();
  };
  const onFocus = () => queueMicrotask(sync);
  const observer = new IntersectionObserver(() => {
    rim = ledge.getBoundingClientRect().top;
    visible = rim > 70 && rim < viewport.height + 40;
    if (!visible) rest();
    if (!visible && !active().length && cascade !== "running") stop();
    else wake();
  }, { rootMargin: "50px 0px" });
  observer.observe(ledge);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", markInput, { passive: true });
  window.addEventListener("touchmove", markInput, { passive: true });
  window.addEventListener("keydown", onKey);
  window.addEventListener("click", onNavigation, true);
  window.addEventListener("resize", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onResize);
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("focusin", onFocus);
  document.addEventListener("focusout", onFocus);
  media.addEventListener("change", sync);
  sync();

  return {
    setPaused(value) { paused = value; sync(); },
    startCascade,
    destroy() {
      destroyed = true;
      stop();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", markInput);
      window.removeEventListener("touchmove", markInput);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onNavigation, true);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocus);
      media.removeEventListener("change", sync);
      sources.forEach((source) => {
        source.node.style.cssText = source.nodeStyle;
        source.visual.style.cssText = source.visualStyle;
        source.node.dataset.state = "rest";
      });
      flights.forEach((flight) => {
        recycle(flight);
        flight.node.style.cssText = "";
        flight.visual.style.cssText = "";
      });
      delete layer.dataset.suspended;
      delete root.dataset.motion;
      delete root.dataset.cascade;
    },
  };
}
