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

type ColattaoButterflyLogoMotionProps = {
  loop?: boolean;
  motionSource?: "device" | "timeline";
  showReplay?: boolean;
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

export default function ColattaoButterflyLogoMotion({
  loop = true,
  motionSource = "timeline",
  showReplay = true,
}: ColattaoButterflyLogoMotionProps) {
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
    let hasCompleted = false;
    let inputEnergy = 0;
    let inputTargetEnergy = 0;
    let inputTargetX = 0;
    let inputTargetY = 0;
    let inputX = 0;
    let inputY = 0;
    let isIntersecting = true;
    let isPrepared = false;
    let lastInputAt = 0;
    let lastScrollY = window.scrollY;
    let neutralBeta: number | null = null;
    let neutralGamma: number | null = null;
    let lastAcceptedBeta: number | null = null;
    let lastAcceptedGamma: number | null = null;
    let orientationPermissionRequested = false;
    let particles: ButterflyParticle[] = [];
    let logoSample: LogoSample | null = null;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let startedAt = 0;
    const butterflySprites = createButterflySprites();
    const isDeviceResponsive = motionSource === "device";

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
      (isDeviceResponsive || loop || !hasCompleted) &&
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
      const logoWidth = Math.min(width * 0.82, 405);
      const logoHeight = logoWidth / activeLogoSample.aspectRatio;
      const logoLeft = (width - logoWidth) / 2;
      const logoTop = (height - logoHeight) / 2;

      if (isDeviceResponsive) {
        const timeSinceInput =
          lastInputAt === 0 ? Number.POSITIVE_INFINITY : time - lastInputAt;

        if (timeSinceInput > 100) {
          inputTargetX *= 0.88;
          inputTargetY *= 0.88;
          inputTargetEnergy *= 0.86;
        }

        inputX = lerp(inputX, inputTargetX, 0.18);
        inputY = lerp(inputY, inputTargetY, 0.18);
        inputEnergy = lerp(inputEnergy, inputTargetEnergy, 0.16);

        const motionStrength = clamp(
          Math.max(inputEnergy, Math.hypot(inputX, inputY) * 0.72),
        );

        context.clearRect(0, 0, width, height);
        stage.dataset.motionPhase =
          motionStrength > 0.045 ? "respond" : "hold";
        stage.dataset.motionEnergy = motionStrength.toFixed(3);

        particles.forEach((particle, index) => {
          const targetX = logoLeft + logoWidth * particle.u;
          const targetY = logoTop + logoHeight * particle.v;
          const depth = 0.38 + particle.seed * 0.92;
          const wingX =
            Math.sin(particle.seed * 31 + index * 0.07) *
            motionStrength *
            (5 + particle.seed * 23);
          const wingY =
            Math.cos(particle.seed * 27 + index * 0.05) *
            motionStrength *
            (4 + particle.seed * 18);
          const flutter =
            Math.sin(time * 0.009 + particle.seed * 29) *
            motionStrength *
            3.4;
          const x =
            targetX +
            inputX * width * (0.055 + depth * 0.095) +
            wingX;
          const y =
            targetY +
            inputY * height * (0.045 + depth * 0.075) +
            wingY +
            flutter;
          const targetCell = Math.max(
            1.2,
            logoWidth * activeLogoSample.targetCellRatio * 1.35,
          );
          const alpha = 0.42 + particle.seed * 0.48;
          const butterflyThreshold = 0.055 + particle.seed * 0.035;

          if (motionStrength <= butterflyThreshold) {
            context.fillStyle = `rgb(${particle.color[0]} ${particle.color[1]} ${particle.color[2]} / ${alpha * 0.52})`;
            context.fillRect(
              x - targetCell / 2,
              y - targetCell / 2,
              targetCell,
              targetCell,
            );
            return;
          }

          const flap = Math.sin(time * 0.016 + particle.seed * 26) > 0;
          const sprite =
            butterflySprites[
              Math.floor(particle.seed * butterflySprites.length)
            ]?.[flap ? 1 : 0];

          if (!sprite) {
            return;
          }

          const accentScale = particle.seed > 0.9 ? 1.45 : 1;
          const renderSize =
            particle.size *
            (3 + motionStrength * 1.8) *
            accentScale;

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

        context.globalAlpha = lerp(1, 0.52, motionStrength);
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

        const stillResponding =
          timeSinceInput < 160 ||
          inputTargetEnergy > 0.012 ||
          inputEnergy > 0.012 ||
          Math.abs(inputX - inputTargetX) > 0.004 ||
          Math.abs(inputY - inputTargetY) > 0.004;

        if (canAnimate() && stillResponding) {
          animationFrame = window.requestAnimationFrame(draw);
        }

        return;
      }

      if (startedAt === 0) {
        startedAt = time;
      }

      const elapsed = time - startedAt;
      const phase = loop
        ? (elapsed % CYCLE_MS) / CYCLE_MS
        : Math.min(elapsed / (CYCLE_MS * 0.42), 1) * 0.42;
      const formation = formationForPhase(phase);
      const airborne = Math.sin(formation * Math.PI);
      const logoOpacity =
        formation > 0.88 ? smoothstep(0.88, 0.99, formation) : 0;
      const particleOpacity = 1 - logoOpacity * 0.82;

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

      if (!loop && elapsed >= CYCLE_MS * 0.42) {
        hasCompleted = true;
        stage.dataset.motionPhase = "hold";
      }

      if (canAnimate()) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const startAnimation = (restart = true) => {
      if (restart) {
        stopAnimation();
        startedAt = 0;
      }

      if (!canAnimate() || animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const pushMotionInput = (
      nextX: number,
      nextY: number,
      nextEnergy: number,
      source: "scroll" | "tilt" | "touch",
    ) => {
      if (!isDeviceResponsive || reducedMotion.matches) {
        return;
      }

      inputTargetX = clamp(nextX, -1, 1);
      inputTargetY = clamp(nextY, -1, 1);
      inputTargetEnergy = Math.max(
        inputTargetEnergy * 0.62,
        clamp(nextEnergy),
      );
      lastInputAt = performance.now();
      stage.dataset.motionInput = source;
      startAnimation(false);
    };

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) {
        return;
      }

      if (neutralBeta === null || neutralGamma === null) {
        neutralBeta = event.beta;
        neutralGamma = event.gamma;
        lastAcceptedBeta = event.beta;
        lastAcceptedGamma = event.gamma;
        stage.dataset.motionPermission = "active";
        return;
      }

      const angularChange = Math.hypot(
        event.beta - (lastAcceptedBeta ?? event.beta),
        event.gamma - (lastAcceptedGamma ?? event.gamma),
      );

      if (angularChange < 0.85) {
        return;
      }

      lastAcceptedBeta = event.beta;
      lastAcceptedGamma = event.gamma;

      let nextX = clamp((event.gamma - neutralGamma) / 24, -1, 1);
      let nextY = clamp((event.beta - neutralBeta) / 24, -1, 1);
      const screenAngle = window.screen.orientation?.angle ?? 0;

      if (screenAngle === 90) {
        [nextX, nextY] = [-nextY, nextX];
      } else if (screenAngle === 270) {
        [nextX, nextY] = [nextY, -nextX];
      } else if (screenAngle === 180) {
        nextX *= -1;
        nextY *= -1;
      }

      pushMotionInput(
        nextX,
        nextY,
        clamp(Math.hypot(nextX, nextY) / 1.15),
        "tilt",
      );
    };

    const requestPhoneMotionPermission = () => {
      if (
        !isDeviceResponsive ||
        reducedMotion.matches ||
        orientationPermissionRequested ||
        !("DeviceOrientationEvent" in window)
      ) {
        return;
      }

      const orientationConstructor = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"denied" | "granted">;
      };

      if (typeof orientationConstructor.requestPermission !== "function") {
        stage.dataset.motionPermission = "not-required";
        return;
      }

      orientationPermissionRequested = true;
      void orientationConstructor
        .requestPermission()
        .then((permission) => {
          stage.dataset.motionPermission = permission;
        })
        .catch(() => {
          stage.dataset.motionPermission = "unavailable";
        });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();

      if (bounds.width === 0 || bounds.height === 0) {
        return;
      }

      const nextX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const nextY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      pushMotionInput(
        nextX,
        nextY,
        clamp(Math.hypot(nextX, nextY) / 1.2),
        "touch",
      );
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;

      if (Math.abs(delta) < 0.5) {
        return;
      }

      pushMotionInput(
        0,
        clamp(delta / 52, -1, 1),
        clamp(Math.abs(delta) / 34),
        "scroll",
      );
    };

    const handleResize = () => {
      resize();

      if (isDeviceResponsive) {
        startAnimation(false);
      } else if (!loop && hasCompleted) {
        stage.dataset.motionState = "static";
      } else {
        startAnimation();
      }
    };

    const syncMotionPreference = () => {
      if (reducedMotion.matches) {
        stopAnimation();
        context.clearRect(0, 0, width, height);
        stage.dataset.motionState = "static";
        return;
      }

      if (!isDeviceResponsive && !loop && hasCompleted) {
        stage.dataset.motionState = "static";
        return;
      }

      stage.dataset.motionState = isPrepared ? "ready" : "loading";
      startAnimation();
    };

    const syncVisibility = () => {
      if (canAnimate()) {
        startAnimation(!isDeviceResponsive);
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
      window.addEventListener("resize", handleResize);
      document.addEventListener("visibilitychange", syncVisibility);
      reducedMotion.addEventListener("change", syncMotionPreference);

      if (isDeviceResponsive) {
        stage.dataset.motionInput = "rest";
        window.addEventListener(
          "deviceorientation",
          handleDeviceOrientation,
          { passive: true },
        );
        window.addEventListener("scroll", handleScroll, { passive: true });
        stage.addEventListener("pointerdown", requestPhoneMotionPermission, {
          passive: true,
        });
        stage.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
      }

      intersectionObserver?.observe(stage);
      syncMotionPreference();
    };

    void prepare();

    return () => {
      cancelled = true;
      stopAnimation();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", syncVisibility);
      reducedMotion.removeEventListener("change", syncMotionPreference);
      window.removeEventListener(
        "deviceorientation",
        handleDeviceOrientation,
      );
      window.removeEventListener("scroll", handleScroll);
      stage.removeEventListener("pointerdown", requestPhoneMotionPermission);
      stage.removeEventListener("pointermove", handlePointerMove);
      intersectionObserver?.disconnect();
      delete stage.dataset.motionEnergy;
      delete stage.dataset.motionInput;
      delete stage.dataset.motionPermission;
      delete stage.dataset.motionState;
      delete stage.dataset.motionPhase;
      delete stage.dataset.particleCount;
    };
  }, [cycleKey, loop, motionSource]);

  return (
    <div className={styles.shell}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-colattao-butterfly-motion
        data-motion-source={motionSource}
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
          fetchPriority="high"
        />
        <div className={styles.glow} aria-hidden="true" />
      </div>

      {showReplay ? (
        <button
          type="button"
          className={styles.replay}
          onClick={() => setCycleKey((current) => current + 1)}
        >
          Replay motion
        </button>
      ) : null}
    </div>
  );
}
