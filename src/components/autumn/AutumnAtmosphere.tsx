"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createMotionController, type MotionController } from "./MotionController";
import styles from "./autumn.module.css";

// Individual photographic cutouts with real alpha; no chroma-key background reaches the UI.
const LEAF_ASSETS = [
  "/assets/colattao/menu/autumn/maple-copper.webp",
  "/assets/colattao/menu/autumn/oak-russet.webp",
] as const;
const LEAVES = [
  { id: "anchor-1", kind: "anchor", x: 7, y: -20, size: 35, angle: -62 },
  { id: "anchor-2", kind: "anchor", x: 15, y: -16, size: 31, angle: 39 },
  { id: "anchor-3", kind: "anchor", x: 21, y: -19, size: 27, angle: -20 },
  { id: "anchor-4", kind: "anchor", x: 87, y: -17, size: 30, angle: 56 },
  { id: "loose-1", kind: "loose", x: 10, y: -27, size: 32, angle: -35 },
  { id: "loose-2", kind: "loose", x: 25, y: -21, size: 26, angle: 70 },
  { id: "loose-3", kind: "loose", x: 83, y: -22, size: 27, angle: -58 },
  { id: "edge-1", kind: "edge", x: 2, y: -19, size: 25, angle: -79 },
  { id: "edge-2", kind: "edge", x: 93, y: -18, size: 24, angle: 76 },
  { id: "edge-3", kind: "edge", x: 4, y: -26, size: 24, angle: 14 },
] as const;

const mediaQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(mediaQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export default function AutumnAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MotionController | null>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion,
    () => window.matchMedia(mediaQuery).matches, () => true);

  useEffect(() => {
    if (!rootRef.current) return;
    const controller = createMotionController(rootRef.current);
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.atmosphere} data-autumn-atmosphere="">
      <div aria-hidden="true" className={styles.leafLedge}>
        {LEAVES.map((leaf, index) => (
          <span key={leaf.id} data-leaf-id={leaf.id} data-kind={leaf.kind}
            data-angle={leaf.angle} data-state="rest" className={styles.leaf}
            style={{ left: `${leaf.x}%`, top: leaf.y, width: leaf.size, height: leaf.size * 1.2,
              "--leaf-angle": `${leaf.angle}deg` } as CSSProperties}>
            <span className={styles.leafVisual} style={{ backgroundImage: `url("${LEAF_ASSETS[index % LEAF_ASSETS.length]}")` }} />
          </span>
        ))}
      </div>
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
