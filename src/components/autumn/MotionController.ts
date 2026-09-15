import {
  clamp, fallDuration, landingPose, MAX_AIRBORNE, MAX_LANDED, pathVelocity, samplePath,
  type Path, type Pose, type Velocity,
} from "./leafMotion";

export type MotionController = { setPaused: (paused: boolean) => void; destroy: () => void };
type Source = {
  node: HTMLElement; visual: HTMLElement; kind: string; angle: number; gust: number;
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
export function createMotionController(root: HTMLElement, layer: HTMLElement): MotionController {
  const ledge = root.querySelector<HTMLElement>("[data-leaf-ledge]")!;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sources: Source[] = Array.from(root.querySelectorAll<HTMLElement>("[data-leaf-id]")).map((node) => ({
    node, visual: node.firstElementChild as HTMLElement, kind: node.dataset.kind!,
    angle: Number(node.dataset.angle), gust: 0, spent: false,
    nodeStyle: node.style.cssText, visualStyle: (node.firstElementChild as HTMLElement).style.cssText,
  }));
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
  let wind = 0, targetWind = 0, lastInput = -Infinity, lastRelease = -Infinity, serial = 0;
  let rim = ledge.getBoundingClientRect().top, visible = false, paused = false, destroyed = false;

  const active = () => flights.filter((flight) => flight.phase !== "available" && flight.phase !== "landed");
  const canRun = () => !destroyed && !paused && !media.matches && !document.hidden && !editable();
  const stop = () => { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; };
  const wake = () => {
    if (canRun() && !frame && (visible || active().length)) frame = requestAnimationFrame(tick);
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
  const rearmOffscreen = () => {
    // New identities can occupy the vacated rim only while it is entirely offscreen.
    if (active().length || (rim >= -50 && rim <= viewport.height + 50)) return;
    for (const source of sources) {
      if (source.spent) {
        source.spent = false;
        source.gust = 0;
        source.node.style.cssText = source.nodeStyle;
        source.visual.style.cssText = source.visualStyle;
        source.node.dataset.state = "rest";
      }
    }
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
  const release = (source: Source, now: number) => {
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
      x: box.left + source.gust * 2, y: box.top - Math.abs(source.gust) * 0.8,
      angle: source.angle + source.gust * 4, scale: 1,
    };
    flight.node.style.width = `${box.width}px`;
    flight.node.style.height = `${box.height}px`;
    flight.visual.style.backgroundImage = source.visual.style.backgroundImage;
    flight.node.dataset.leafId = `${source.node.dataset.leafId}-flight-${++serial}`;
    flight.path = {
      from: { ...flight.pose },
      to: { ...flight.pose, x: clamp(flight.pose.x + direction * 16, 2, viewport.width - box.width - 2),
        y: flight.pose.y + 4, angle: flight.pose.angle + direction * 6 },
      velocity: STILL, endVelocity: { x: 0, y: 30, angle: 0 },
      duration: 280, sway: 0, rock: 0, direction,
    };
    flight.age = 0;
    // Exact same-frame handoff: artwork, size, transform origin and current pose
    // match. Hide the source first. This slot stays the same through landing.
    paint(flight);
    source.spent = true;
    source.node.dataset.state = "spent";
    source.node.style.visibility = "hidden";
    setPhase(flight, "loosen");
    lastRelease = now;
  };
  const tryRelease = (now: number) => {
    if (!visible || rim < 95 || rim > viewport.height - 28 || now - lastInput > 1000) return;
    const count = active().length;
    const strength = Math.abs(wind);
    const strongSecond = count === 1 && strength > 2.1 && now - lastRelease > 190;
    if (count >= MAX_AIRBORNE || strength < 1.05 || (!strongSecond && now - lastRelease < 1150)) return;
    const candidates = sources.filter((source) => source.kind === "edge" && !source.spent);
    const previousSide = active()[0]?.direction;
    const source = candidates.find((candidate) => previousSide !== undefined &&
      (Number.parseFloat(candidate.node.style.left) < 50 ? -1 : 1) !== previousSide) ?? candidates[0];
    if (source) release(source, now);
  };

  function tick(now: number) {
    frame = 0;
    if (!canRun()) return;
    const dt = lastFrame ? Math.min(now - lastFrame, 40) : 16;
    lastFrame = now;
    targetWind *= Math.exp(-dt / 200);
    wind += (targetWind - wind) * (1 - Math.exp(-dt / 120));
    for (const source of sources) {
      if (source.spent || source.kind === "anchor" || !visible) continue;
      const strength = source.kind === "loose" ? 0.65 : 1;
      source.gust = wind * strength;
      source.visual.style.transform = `translate3d(${source.gust * 2}px, ${-Math.abs(source.gust) * 0.8}px, 0) rotate(${source.angle + source.gust * 4}deg)`;
    }
    tryRelease(now);
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
    rearmOffscreen();
    if (active().length || (visible && Math.abs(wind) + Math.abs(targetWind) > 0.015)) wake();
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
    const velocity = clamp((window.scrollY - scrollY) / clamp(now - lastScroll, 16, 80), -5, 5);
    scrollY = window.scrollY;
    lastScroll = now;
    rim = ledge.getBoundingClientRect().top;
    visible = rim > 70 && rim < viewport.height + 40;
    rearmOffscreen();
    if (!canRun()) return;
    // Native momentum is accepted; category links/history/layout do not supply wind.
    if (now - lastInput < 1000) targetWind = velocity;
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
    if (media.matches) { active().forEach(recycle); rest(); }
    root.dataset.motion = media.matches ? "reduced" : paused ? "paused" : document.hidden ? "hidden" : editable() ? "keyboard" : "ready";
    onResize();
    wake();
  };
  const onFocus = () => queueMicrotask(sync);
  const observer = new IntersectionObserver(() => {
    rim = ledge.getBoundingClientRect().top;
    visible = rim > 70 && rim < viewport.height + 40;
    rearmOffscreen();
    if (!visible) rest();
    if (!visible && !active().length) stop();
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
    },
  };
}
