"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import { defaultRadialPulseParams, drawRadialPulse } from "../sketches/radialpulse";

export default function RadialPulsePage() {
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Radial Pulse", {
    ringCount: { value: defaultRadialPulseParams.ringCount, min: 5, max: 80, step: 1 },
    baseSpacing: { value: defaultRadialPulseParams.baseSpacing, min: 5, max: 40, step: 0.5 },
    baseWidth: { value: defaultRadialPulseParams.baseWidth, min: 1, max: 20, step: 0.5 },
    spacingWave: { value: defaultRadialPulseParams.spacingWave, min: 0, max: 1, step: 0.01 },
    widthWave: { value: defaultRadialPulseParams.widthWave, min: 0, max: 1, step: 0.01 },
    waveFreq: { value: defaultRadialPulseParams.waveFreq, min: 0.01, max: 0.5, step: 0.005 },
    noiseModulation: { value: defaultRadialPulseParams.noiseModulation, min: 0, max: 1, step: 0.01 },
    noiseDetail: { value: defaultRadialPulseParams.noiseDetail, min: 1, max: 10, step: 0.5 },
    rotation: { value: defaultRadialPulseParams.rotation, min: 0, max: 0.01, step: 0.0005 },
    colorMode: { value: defaultRadialPulseParams.colorMode, options: { Single: "single", "Radial Gradient": "radial-gradient", Pulse: "pulse" } },
    ringColor: defaultRadialPulseParams.ringColor,
    innerColor: defaultRadialPulseParams.innerColor,
    outerColor: defaultRadialPulseParams.outerColor,
    pulseColor: defaultRadialPulseParams.pulseColor,
    pulseSpeed: { value: defaultRadialPulseParams.pulseSpeed, min: 0.1, max: 2, step: 0.05 },
    bgColor: defaultRadialPulseParams.bgColor,
    glow: defaultRadialPulseParams.glow,
    glowRadius: { value: defaultRadialPulseParams.glowRadius, min: 2, max: 30, step: 1 },
  });

  useControls("Export", {
    "Export PNG": button(() => exportRef.current?.()),
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const draw = useCallback(
    ({ ctx, width, height, frame }: {
      ctx: CanvasRenderingContext2D; width: number; height: number;
      frame: number; deltaTime: number; mousePos: { x: number; y: number };
    }) => {
      drawRadialPulse(ctx, width, height, frame, paramsRef.current);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="radial-pulse"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
