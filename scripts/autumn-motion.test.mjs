import assert from "node:assert/strict";
import test from "node:test";
import { fallDuration, landingPose, pathVelocity, releaseDelay, samplePath, POOL_SIZE } from "../src/components/autumn/leafMotion.ts";

const makePath = (distance, velocity = 30) => ({
  from: { x: 10, y: 100, angle: -70, scale: 1 },
  to: { x: 3, y: 100 + distance, angle: -50, scale: 1 },
  velocity: { x: 0, y: velocity, angle: 0 },
  endVelocity: { x: 0, y: 90, angle: 0 },
  duration: fallDuration(distance), sway: 4, rock: 19, direction: -1,
});

test("the finite cascade releases every leaf in under two seconds", () => {
  assert.equal(POOL_SIZE, 10);
  const delays = Array.from({ length: POOL_SIZE }, (_, index) => releaseDelay(index));
  assert.equal(delays[0], 0);
  assert.ok(delays.at(-1) < 2000);
  assert.ok(delays.every((value, index) => index === 0 || value > delays[index - 1]));
});

test("descent never reverses, including short paths after viewport changes", () => {
  for (const distance of [24, 60, 200, 500, 850, 1400]) {
    for (const speed of [0, 30, 150, 500]) {
      const path = makePath(distance, speed);
      let previous = path.from.y;
      for (let i = 0; i <= 1000; i++) {
        const pose = samplePath(path, path.duration * i / 1000);
        assert.ok(pose.y >= previous - 1e-8, `reversed: ${distance}px, ${speed}px/s`);
        assert.ok(pose.y <= path.to.y + 1e-8);
        assert.ok(pose.scale >= 0.9 && pose.scale <= 1);
        previous = pose.y;
      }
      assert.ok(Math.abs(previous - path.to.y) < 1e-8);
    }
  }
});

test("path handoffs preserve position and velocity without a lateral snap", () => {
  const path = makePath(500);
  for (const elapsed of [0, 900, 2300, path.duration - 100]) {
    const pose = samplePath(path, elapsed);
    const velocity = pathVelocity(path, elapsed);
    const next = { ...path, from: pose, velocity, duration: path.duration - elapsed + 1500,
      to: { ...path.to, y: path.to.y + 180 } };
    assert.deepEqual(samplePath(next, 0), pose);
    const nextVelocity = pathVelocity(next, 0);
    assert.ok(Math.abs(velocity.x - nextVelocity.x) < 0.1);
    assert.ok(Math.abs(velocity.y - nextVelocity.y) < 0.1);
    assert.ok(Math.abs(velocity.angle - nextVelocity.angle) < 0.1);
  }
});

test("soft landing moves down to rest without a bounce", () => {
  const path = { ...makePath(24, 90), duration: 420, endVelocity: undefined, sway: 0, rock: 0 };
  let previous = path.from.y;
  for (let t = 0; t <= 420; t++) {
    const pose = samplePath(path, t);
    assert.ok(pose.y >= previous && pose.y <= path.to.y);
    previous = pose.y;
  }
  assert.ok(Math.abs(pathVelocity(path, 420).y) < 0.2);
});

test("ten retained leaves stay in shallow corners across viewport sizes", () => {
  for (const width of [320, 390, 430, 768, 1440]) {
    for (let index = 0; index < 10; index++) {
      const pose = landingPose(width, 844, 25, index);
      assert.ok(pose.x >= 0 && pose.x + 25 <= width);
      assert.ok(pose.x + 25 <= 55 || pose.x >= width - 55);
      assert.ok(844 - pose.y <= 24);
    }
  }
});

test("overflow endpoints put the whole rotated leaf beyond the screen", () => {
  const height = 844, size = 25, diagonal = Math.hypot(size, size * 1.2);
  const end = height + diagonal + 8;
  const path = { ...makePath(end - 100), to: { x: 3, y: end, angle: -150, scale: 1 } };
  assert.ok(samplePath(path, path.duration).y - diagonal > height);
});
