"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ColattaoButterflyLogoMotion.module.css";

const LOGO_SRC = "/assets/colattao/logo/colattao-logo.png";
const CYCLE_MS = 10_800;

type ButterflyParticle = {
  color: [number, number, number];
  seed: number;
  size: number;
  u: number;
  v: number;
};

type LogoSample = {
  aspectRatio: number;
  particles: ButterflyParticle[];
  targetCellRatio: number;
  sourceBounds: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
};

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function formationForPhase(phase: number) {
  if (phase < 0.42) {
    return smoothstep(0.02, 0.42, phase);
  }

  if (phase < 0.66) {
    return 1;
  }

  return 1 - smoothstep(0.66, 0.98, phase);
}

function createButterflySprites() {
  const palette = [
    [255, 226, 92],
    [246, 188, 40],
    [255, 241, 151],
  ] as const;

  return palette.map((color) =>
    [0.35, 0.92].map((flap) => {
      const sprite = document.createElement("canvas");
      sprite.width = 40;
      sprite.height = 40;
      const spriteContext = sprite.getContext("2d");

      if (!spriteContext) {
        return sprite;
      }

      const wingSpread = 4.6 + flap * 2.8;
      spriteContext.fillStyle = `rgb(${color[0]} ${color[1]} ${color[2]})`;
      spriteContext.shadowColor = "rgb(255 211 77 / 0.34)";
      spriteContext.shadowBlur = 3;
      spriteContext.beginPath();
      spriteContext.ellipse(
        20 - wingSpread,
        13.5,
        5.3 + flap * 1.8,
        9.1 - flap,
        -0.55,
        0,
        Math.PI * 2,
      );
      spriteContext.ellipse(
        20 + wingSpread,
        13.5,
        5.3 + flap * 1.8,
        9.1 - flap,
        0.55,
        0,
        Math.PI * 2,
      );
      spriteContext.ellipse(
        16.1,
        24.2,
        3.8 + flap,
        5.5,
        -0.42,
        0,
        Math.PI * 2,
      );
      spriteContext.ellipse(
        23.9,
        24.2,
        3.8 + flap,
        5.5,
        0.42,
        0,
        Math.PI * 2,
      );
      spriteContext.fill();
      spriteContext.shadowBlur = 0;
      spriteContext.fillStyle = "rgb(104 58 16 / 0.9)";
      spriteContext.beginPath();
      spriteContext.ellipse(20, 20, 1.35, 8, 0, 0, Math.PI * 2);
      spriteContext.fill();
      return sprite;
    }),
  );
}

function createParticles(image: HTMLImageElement, lowPower: boolean): LogoSample | null {
  const sampleWidth = 320;
  const sampleHeight = Math.max(
    64,
    Math.round(sampleWidth * (image.naturalHeight / image.naturalWidth)),
  );
  const sampleStep = 2;
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!sampleContext) {
    return null;
  }

  sampleContext.clearRect(0, 0, sampleWidth, sampleHeight);
  sampleContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
  const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
  let minimumX = sampleWidth;
  let minimumY = sampleHeight;
  let maximumX = -1;
  let maximumY = -1;

  for (let y = 0; y < sampleHeight; y += 1) {
    for (let x = 0; x < sampleWidth; x += 1) {
      const alpha = pixels[(y * sampleWidth + x) * 4 + 3];

      if (alpha < 40) {
        continue;
      }

      minimumX = Math.min(minimumX, x);
      minimumY = Math.min(minimumY, y);
      maximumX = Math.max(maximumX, x);
      maximumY = Math.max(maximumY, y);
    }
  }

  if (maximumX < minimumX || maximumY < minimumY) {
    return null;
  }

  const visibleWidth = maximumX - minimumX + 1;
  const visibleHeight = maximumY - minimumY + 1;
  const particles: ButterflyParticle[] = [];

  for (let y = minimumY; y <= maximumY; y += sampleStep) {
    for (let x = minimumX; x <= maximumX; x += sampleStep) {
      const pixelIndex = (y * sampleWidth + x) * 4;
      const alpha = pixels[pixelIndex + 3];

      if (alpha < 70) {
        continue;
      }

      const index = y * sampleWidth + x;
      const seed = seededRandom(index + 17);
      const goldMix = 0.08 + seededRandom(index + 71) * 0.24;

      particles.push({
        color: [
          Math.round(lerp(pixels[pixelIndex], 232, goldMix)),
          Math.round(lerp(pixels[pixelIndex + 1], 181, goldMix)),
          Math.round(lerp(pixels[pixelIndex + 2], 76, goldMix)),
        ],
        seed,
        size: 1.1 + seededRandom(index + 113) * 1.9,
        u: clamp((x - minimumX + sampleStep / 2) / visibleWidth),
        v: clamp((y - minimumY + sampleStep / 2) / visibleHeight),
      });
    }
  }

  const maximumParticles = lowPower ? 520 : 680;
  const sampledParticles =
    particles.length <= maximumParticles
      ? particles
      : Array.from({ length: maximumParticles }, (_, index) => {
          const sourceIndex = Math.floor(
            (index * particles.length) / maximumParticles,
          );
          return particles[sourceIndex];
        });
  const scaleX = image.naturalWidth / sampleWidth;
  const scaleY = image.naturalHeight / sampleHeight;
  const sourceX = Math.max(0, Math.floor(minimumX * scaleX));
  const sourceY = Math.max(0, Math.floor(minimumY * scaleY));
  const sourceWidth = Math.min(
    image.naturalWidth - sourceX,
    Math.ceil(visibleWidth * scaleX),
  );
  const sourceHeight = Math.min(
    image.naturalHeight - sourceY,
    Math.ceil(visibleHeight * scaleY),
  );

  return {
    aspectRatio: sourceWidth / sourceHeight,
    particles: sampledParticles,
    targetCellRatio: sampleStep / visibleWidth,
    sourceBounds: {
      height: sourceHeight,
      width: sourceWidth,
      x: sourceX,
      y: sourceY,
    },
  };
}

export default function ColattaoButterflyLogoMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const logo = logoRef.current;

    if (!stage || !canvas || !logo) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!context) {
      stage.dataset.motionState = "static";
      return () => {
        delete stage.dataset.motionState;
      };
    }

    let animationFrame = 0;
    let cancelled = false;
    let isIntersecting = true;
    let isPrepared = false;
    let particles: ButterflyParticle[] = [];
    let logoSample: LogoSample | null = null;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let startedAt = 0;
    const butterflySprites = createButterflySprites();

    const stopAnimation = () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const canAnimate = () =>
      isPrepared &&
      isIntersecting &&
      !document.hidden &&
      !reducedMotion.matches &&
      !cancelled;

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      animationFrame = 0;

      if (!canAnimate() || !logoSample) {
        return;
      }

      const activeLogoSample = logoSample;

      if (startedAt === 0) {
        startedAt = time;
      }

      const phase = ((time - startedAt) % CYCLE_MS) / CYCLE_MS;
      const formation = formationForPhase(phase);
      const airborne = Math.sin(formation * Math.PI);
      const logoOpacity =
        formation > 0.88 ? smoothstep(0.88, 0.99, formation) : 0;
      const particleOpacity = 1 - logoOpacity * 0.82;
      const logoWidth = Math.min(width * 0.82, 405);
      const logoHeight = logoWidth / activeLogoSample.aspectRatio;
      const logoLeft = (width - logoWidth) / 2;
      const logoTop = (height - logoHeight) / 2;

      context.clearRect(0, 0, width, height);
      stage.dataset.motionPhase =
        phase < 0.42 ? "assemble" : phase < 0.66 ? "hold" : "release";

      particles.forEach((particle, index) => {
        const angle = particle.seed * Math.PI * 7.5 + index * 0.013;
        const orbitRadiusX = width * (0.28 + seededRandom(index + 211) * 0.5);
        const orbitRadiusY = height * (0.22 + seededRandom(index + 307) * 0.52);
        const scatterX =
          width * 0.5 +
          Math.cos(angle) * orbitRadiusX +
          Math.sin(time * 0.00022 + particle.seed * 18) * width * 0.045;
        const scatterY =
          height * 0.5 +
          Math.sin(angle * 0.78) * orbitRadiusY +
          Math.cos(time * 0.00028 + particle.seed * 15) * height * 0.052;
        const targetX = logoLeft + logoWidth * particle.u;
        const targetY = logoTop + logoHeight * particle.v;
        const curl =
          airborne *
          (10 + particle.seed * 34) *
          Math.sin(formation * Math.PI * 2 + particle.seed * 13);
        const lift = airborne * (12 + particle.seed * 38);
        const x = lerp(scatterX, targetX, formation) + curl;
        const y =
          lerp(scatterY, targetY, formation) -
          lift +
          Math.sin(time * 0.006 + particle.seed * 20) * airborne * 2.2;
        const targetCell = Math.max(
          1.2,
          logoWidth * activeLogoSample.targetCellRatio * 1.35,
        );
        const accentScale = particle.seed > 0.9 ? 1.52 : 1;
        const butterflySize =
          particle.size * (0.9 + airborne * 0.42) * accentScale;
        const settle = smoothstep(0.76, 0.97, formation);
        const alpha = (0.56 + particle.seed * 0.4) * particleOpacity;

        if (settle > 0.72) {
          const size = lerp(butterflySize, targetCell, settle);
          context.fillStyle = `rgb(${particle.color[0]} ${particle.color[1]} ${particle.color[2]} / ${alpha})`;
          context.fillRect(x - size / 2, y - size / 2, size, size);
          return;
        }

        const flap = Math.sin(time * 0.014 + particle.seed * 24) > 0;
        const sprite =
          butterflySprites[Math.floor(particle.seed * butterflySprites.length)]?.[
            flap ? 1 : 0
          ];

        if (!sprite) {
          return;
        }

        const renderSize = butterflySize * 3.4;
        context.globalAlpha = alpha;
        context.drawImage(
          sprite,
          x - renderSize / 2,
          y - renderSize / 2,
          renderSize,
          renderSize,
        );
        context.globalAlpha = 1;
      });

      if (logoOpacity > 0) {
        context.globalAlpha = logoOpacity;
        context.drawImage(
          logo,
          activeLogoSample.sourceBounds.x,
          activeLogoSample.sourceBounds.y,
          activeLogoSample.sourceBounds.width,
          activeLogoSample.sourceBounds.height,
          logoLeft,
          logoTop,
          logoWidth,
          logoHeight,
        );
        context.globalAlpha = 1;
      }

      if (canAnimate()) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const startAnimation = () => {
      stopAnimation();

      if (!canAnimate()) {
        return;
      }

      startedAt = 0;
      animationFrame = window.requestAnimationFrame(draw);
    };

    const syncMotionPreference = () => {
      if (reducedMotion.matches) {
        stopAnimation();
        context.clearRect(0, 0, width, height);
        stage.dataset.motionState = "static";
        return;
      }

      stage.dataset.motionState = isPrepared ? "ready" : "loading";
      startAnimation();
    };

    const syncVisibility = () => {
      if (canAnimate()) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const intersectionObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              isIntersecting = entry?.isIntersecting ?? true;
              syncVisibility();
            },
            { rootMargin: "80px" },
          )
        : null;

    const prepare = async () => {
      if (!logo.complete) {
        await new Promise<void>((resolve) => {
          logo.addEventListener("load", () => resolve(), { once: true });
          logo.addEventListener("error", () => resolve(), { once: true });
        });
      }

      try {
        await logo.decode();
      } catch {
        // A completed image can reject decode after already reaching the renderer.
      }

      if (cancelled || logo.naturalWidth === 0 || logo.naturalHeight === 0) {
        stage.dataset.motionState = "static";
        logo.style.setProperty("--logo-opacity", "1");
        return;
      }

      const navigatorWithMemory = navigator as Navigator & {
        deviceMemory?: number;
      };
      const lowPower =
        window.innerWidth <= 600 ||
        navigator.hardwareConcurrency <= 4 ||
        (navigatorWithMemory.deviceMemory ?? 8) <= 4;

      logoSample = createParticles(logo, lowPower);

      if (!logoSample || logoSample.particles.length === 0) {
        stage.dataset.motionState = "static";
        return;
      }

      particles = logoSample.particles;
      resize();
      isPrepared = true;
      stage.dataset.motionState = "ready";
      stage.dataset.particleCount = String(particles.length);
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", syncVisibility);
      reducedMotion.addEventListener("change", syncMotionPreference);
      intersectionObserver?.observe(stage);
      syncMotionPreference();
    };

    void prepare();

    return () => {
      cancelled = true;
      stopAnimation();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncVisibility);
      reducedMotion.removeEventListener("change", syncMotionPreference);
      intersectionObserver?.disconnect();
      delete stage.dataset.motionState;
      delete stage.dataset.motionPhase;
      delete stage.dataset.particleCount;
    };
  }, [cycleKey]);

  return (
    <div className={styles.shell}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-colattao-butterfly-motion
      >
        <div className={styles.atmosphere} aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        {/* A native image keeps the official mark exact at rest and is the reduced-motion fallback. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          src={LOGO_SRC}
          alt="Colattao Coffee House"
          className={styles.logo}
        />
        <div className={styles.glow} aria-hidden="true" />
      </div>

      <button
        type="button"
        className={styles.replay}
        onClick={() => setCycleKey((current) => current + 1)}
      >
        Replay motion
      </button>
    </div>
  );
}
