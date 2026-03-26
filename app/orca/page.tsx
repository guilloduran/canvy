"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import { defaultOrcaParams, drawOrca } from "../sketches/orca";

export default function OrcaPage() {
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Orca", {
    // Grid
    cols: { value: defaultOrcaParams.cols, min: 2, max: 50, step: 1 },
    rows: { value: defaultOrcaParams.rows, min: 2, max: 50, step: 1 },
    scaleMin: { value: defaultOrcaParams.scaleMin, min: 1, max: 100 },
    scaleMax: { value: defaultOrcaParams.scaleMax, min: 1, max: 100 },
    lineCap: {
      value: defaultOrcaParams.lineCap,
      options: { Butt: "butt" as const, Round: "round" as const, Square: "square" as const },
    },

    // Noise
    freq: { value: defaultOrcaParams.freq, min: -0.01, max: 0.01, step: 0.0001 },
    amp: { value: defaultOrcaParams.amp, min: 0, max: 1 },
    // Stroke
    lineColor: defaultOrcaParams.lineColor,
    gradient: defaultOrcaParams.gradient,
    gradientA: defaultOrcaParams.gradientA,
    gradientB: defaultOrcaParams.gradientB,
    gradientWidth: { value: defaultOrcaParams.gradientWidth, min: 1, max: 200 },

    // Background
    bgColor: defaultOrcaParams.bgColor,
    radialGradient: defaultOrcaParams.radialGradient,
    bgGradientA: defaultOrcaParams.bgGradientA,
    bgGradientB: defaultOrcaParams.bgGradientB,
  });

  useControls("Export", {
    "Export PNG": button(() => exportRef.current?.()),
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const draw = useCallback(
    ({
      ctx,
      width,
      height,
      frame,
    }: {
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      frame: number;
      deltaTime: number;
      mousePos: { x: number; y: number };
    }) => {
      drawOrca(ctx, width, height, frame, paramsRef.current);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="orca"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
