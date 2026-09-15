"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createMotionController, type CascadeState, type MotionController } from "./MotionController";
import FallingLeafLayer from "./FallingLeafLayer";
import styles from "./autumn.module.css";

// Individual photographic cutouts with real alpha; no chroma-key background reaches the UI.
const LEAF_ASSETS = [
  "/assets/colattao/menu/autumn/maple-copper.webp",
  "/assets/colattao/menu/autumn/oak-russet.webp",
] as const;
const LEAVES = [
  { id: "leaf-1", order: 6, x: 7, y: -20, size: 35, angle: -62 },
  { id: "leaf-2", order: 8, x: 15, y: -16, size: 31, angle: 39 },
  { id: "leaf-3", order: 9, x: 21, y: -19, size: 27, angle: -20 },
  { id: "leaf-4", order: 5, x: 87, y: -17, size: 30, angle: 56 },
  { id: "leaf-5", order: 4, x: 10, y: -27, size: 32, angle: -35 },
  { id: "leaf-6", order: 7, x: 25, y: -21, size: 26, angle: 70 },
  { id: "leaf-7", order: 3, x: 83, y: -22, size: 27, angle: -58 },
  { id: "leaf-8", order: 0, x: 2, y: -19, size: 25, angle: -79 },
  { id: "leaf-9", order: 1, x: 93, y: -18, size: 24, angle: 76 },
  { id: "leaf-10", order: 2, x: 4, y: -26, size: 24, angle: 14 },
] as const;

const mediaQuery = "(prefers-reduced-motion: reduce)";
const subscribeMount = () => () => {};
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(mediaQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export default function AutumnAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MotionController | null>(null);
  const [paused, setPaused] = useState(false);
  const [cascade, setCascade] = useState<CascadeState>("idle");
  const mounted = useSyncExternalStore(subscribeMount, () => true, () => false);
  const reduced = useSyncExternalStore(subscribeMotion,
    () => window.matchMedia(mediaQuery).matches, () => true);

  useEffect(() => {
    if (!mounted || !rootRef.current || !layerRef.current) return;
    const controller = createMotionController(rootRef.current, layerRef.current, setCascade);
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [mounted]);

  return (
    <div ref={rootRef} className={styles.atmosphere} data-autumn-atmosphere="">
      {mounted && <FallingLeafLayer layerRef={layerRef} />}
      <div aria-hidden="true" className={styles.leafLedge} data-leaf-ledge="">
        {LEAVES.map((leaf, index) => (
          <span key={leaf.id} data-leaf-id={leaf.id} data-release-order={leaf.order}
            data-angle={leaf.angle} data-state="rest" className={styles.leaf}
            style={{ left: `${leaf.x}%`, top: leaf.y, width: leaf.size, height: leaf.size * 1.2,
              "--leaf-angle": `${leaf.angle}deg` } as CSSProperties}>
            <span className={styles.leafVisual} style={{ backgroundImage: `url("${LEAF_ASSETS[index % LEAF_ASSETS.length]}")` }} />
          </span>
        ))}
      </div>
      <button type="button" className={styles.cascadeControl}
        disabled={reduced || paused || cascade === "running"}
        aria-label={cascade === "complete" ? "Replay all falling leaves" : "Let all leaves fall"}
        onClick={() => controllerRef.current?.startCascade()}>
        {cascade === "running" ? "Leaves falling" : cascade === "complete" ? "Replay leaves" : "Let leaves fall"}
      </button>
      <button type="button" className={styles.motionControl} disabled={reduced}
        aria-label={reduced ? "Autumn motion off: reduced motion preference" :
          paused ? "Resume autumn motion" : "Pause autumn motion"}
        onClick={() => {
          const next = !paused;
          controllerRef.current?.setPaused(next);
          setPaused(next);
        }}>
        <span aria-hidden="true">{reduced ? "—" : paused ? "▷" : "Ⅱ"}</span>
        {reduced ? "Motion off" : paused ? "Resume motion" : "Pause motion"}
      </button>
    </div>
  );
}
