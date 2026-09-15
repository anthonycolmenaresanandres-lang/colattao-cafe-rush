/** Pure, time-based curves. Scroll supplies wind only; it never scrubs a fall. */
export type Pose = { x: number; y: number; angle: number; scale: number };
export type Velocity = { x: number; y: number; angle: number };
export type Path = {
  from: Pose; to: Pose; velocity: Velocity; duration: number;
  endVelocity?: Velocity; sway: number; rock: number; direction: number;
};
export const MAX_AIRBORNE = 2;
export const MAX_LANDED = 10;
export const POOL_SIZE = MAX_LANDED + MAX_AIRBORNE;
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const fallDuration = (distance: number) => clamp(distance / 120 * 1000 + 850, 2800, 6800);

function hermite(a: number, b: number, v0: number, v1: number, p: number, seconds: number) {
  return (2 * p ** 3 - 3 * p ** 2 + 1) * a + (p ** 3 - 2 * p ** 2 + p) * v0 * seconds
    + (-2 * p ** 3 + 3 * p ** 2) * b + (p ** 3 - p ** 2) * v1 * seconds;
}

export function samplePath(path: Path, elapsed: number): Pose {
  const p = clamp(elapsed / path.duration, 0, 1);
  const seconds = path.duration / 1000;
  const end = path.endVelocity ?? { x: 0, y: 0, angle: 0 };
  const distance = Math.max(0, path.to.y - path.from.y);
  // Limit endpoint slopes so even a short, resized descent stays monotonic.
  const maxYSpeed = distance / seconds * 1.5;
  const envelope = Math.sin(Math.PI * p) ** 2; // Zero value AND slope at both handoffs.
  return {
    x: hermite(path.from.x, path.to.x, path.velocity.x, end.x, p, seconds)
      + Math.sin(p * Math.PI * 3) * envelope * path.sway * path.direction,
    y: hermite(path.from.y, path.to.y, clamp(path.velocity.y, 0, maxYSpeed),
      clamp(end.y, 0, maxYSpeed), p, seconds),
    angle: hermite(path.from.angle, path.to.angle, path.velocity.angle, end.angle, p, seconds)
      + Math.sin(p * Math.PI * 4) * envelope * path.rock * path.direction,
    scale: path.from.scale + (path.to.scale - path.from.scale) * (3 * p ** 2 - 2 * p ** 3)
      - envelope * (1 - Math.cos(p * Math.PI * 4)) * 0.045,
  };
}

export function pathVelocity(path: Path, elapsed: number): Velocity {
  const before = Math.max(0, elapsed - 0.5);
  const after = Math.min(path.duration, elapsed + 0.5);
  const a = samplePath(path, before), b = samplePath(path, after);
  const seconds = Math.max(0.0001, (after - before) / 1000);
  return { x: (b.x - a.x) / seconds, y: (b.y - a.y) / seconds, angle: (b.angle - a.angle) / seconds };
}

export function landingPose(width: number, height: number, size: number, index: number): Pose {
  const left = index % 2 === 0;
  const tier = Math.floor(index / 2);
  return {
    x: left ? 3 + tier * 5 : width - size - 5 - tier * 5,
    y: height - size * 0.68 - (tier % 3) * 2.5,
    angle: left ? -58 + tier * 17 : 48 - tier * 21,
    scale: 1,
  };
}
