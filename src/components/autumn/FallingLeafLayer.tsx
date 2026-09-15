import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { POOL_SIZE } from "./leafMotion";
import styles from "./autumn.module.css";

/** React owns a fixed-size pool; the controller owns only its poses/lifecycle. */
export default function FallingLeafLayer({ layerRef }: { layerRef: RefObject<HTMLDivElement | null> }) {
  return createPortal(
    <div ref={layerRef} className={styles.fallingLayer} aria-hidden="true" data-falling-leaf-layer="">
      {Array.from({ length: POOL_SIZE }, (_, index) => (
        <span key={index} className={styles.flyingLeaf} data-flight-slot={index} data-state="available">
          <span className={styles.leafVisual} />
        </span>
      ))}
    </div>, document.body,
  );
}
