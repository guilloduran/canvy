"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import { defaultIsoCubesParams, drawIsoCubes } from "../sketches/isocubes";

export default function IsoCubesPage() {
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Iso Cubes", {
    gridSize: { value: defaultIsoCubesParams.gridSize, min: 4, max: 25, step: 1 },
    cubeSize: { value: defaultIsoCubesParams.cubeSize, min: 15, max: 80, step: 1 },
    maxHeight: { value: defaultIsoCubesParams.maxHeight, min: 1, max: 15, step: 0.5 },
    noiseScale: { value: defaultIsoCubesParams.noiseScale, min: 0.05, max: 0.5, step: 0.01 },
    noiseSpeed: { value: defaultIsoCubesParams.noiseSpeed, min: 0, max: 0.05, step: 0.001 },
    topColor: defaultIsoCubesParams.topColor,
    leftColor: defaultIsoCubesParams.leftColor,
    rightColor: defaultIsoCubesParams.rightColor,
    strokeColor: defaultIsoCubesParams.strokeColor,
    strokeWidth: { value: defaultIsoCubesParams.strokeWidth, min: 0, max: 3, step: 0.5 },
    bgColor: defaultIsoCubesParams.bgColor,
    colorByHeight: defaultIsoCubesParams.colorByHeight,
    heightColorLow: defaultIsoCubesParams.heightColorLow,
    heightColorHigh: defaultIsoCubesParams.heightColorHigh,
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
      drawIsoCubes(ctx, width, height, frame, paramsRef.current);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="iso-cubes"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
