"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import { defaultMoireParams, drawMoire } from "../sketches/moire";

export default function MoirePage() {
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Moiré", {
    ringCount: { value: defaultMoireParams.ringCount, min: 10, max: 100, step: 1 },
    ringSpacing: { value: defaultMoireParams.ringSpacing, min: 4, max: 30, step: 0.5 },
    strokeWidth: { value: defaultMoireParams.strokeWidth, min: 0.5, max: 6, step: 0.1 },
    sets: { value: defaultMoireParams.sets, min: 2, max: 4, step: 1 },
    rotationSpeed1: { value: defaultMoireParams.rotationSpeed1, min: 0, max: 0.02, step: 0.001 },
    rotationSpeed2: { value: defaultMoireParams.rotationSpeed2, min: -0.02, max: 0.02, step: 0.001 },
    offsetX: { value: defaultMoireParams.offsetX, min: -200, max: 200, step: 1 },
    offsetY: { value: defaultMoireParams.offsetY, min: -200, max: 200, step: 1 },
    mouseInfluence: defaultMoireParams.mouseInfluence,
    lineColor: defaultMoireParams.lineColor,
    bgColor: defaultMoireParams.bgColor,
    composite: { value: defaultMoireParams.composite, options: { "Source Over": "source-over" as const, Difference: "difference" as const, Exclusion: "exclusion" as const, XOR: "xor" as const } },
    shape: { value: defaultMoireParams.shape, options: { Circle: "circle", "Radial Lines": "radial-lines" } },
    radialLineCount: { value: defaultMoireParams.radialLineCount, min: 20, max: 360, step: 1 },
  });

  useControls("Export", {
    "Export PNG": button(() => exportRef.current?.()),
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const draw = useCallback(
    ({ ctx, width, height, frame, mousePos }: {
      ctx: CanvasRenderingContext2D; width: number; height: number;
      frame: number; deltaTime: number; mousePos: { x: number; y: number };
    }) => {
      drawMoire(ctx, width, height, frame, paramsRef.current, mousePos);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="moire"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
