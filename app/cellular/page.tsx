"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import {
  defaultCellularParams,
  drawCellular,
  CellularState,
} from "../sketches/cellular";

export default function CellularPage() {
  const stateRef = useRef(new CellularState());
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Cellular", {
    cellSize: { value: defaultCellularParams.cellSize, min: 3, max: 30, step: 1 },
    gridWidth: { value: defaultCellularParams.gridWidth, min: 20, max: 200, step: 1 },
    gridHeight: { value: defaultCellularParams.gridHeight, min: 20, max: 200, step: 1 },
    rule: { value: defaultCellularParams.rule, options: { Life: "life", HighLife: "highlife", Seeds: "seeds", "Day & Night": "day-night", Custom: "custom" } },
    customBirth: defaultCellularParams.customBirth,
    customSurvive: defaultCellularParams.customSurvive,
    initialDensity: { value: defaultCellularParams.initialDensity, min: 0.1, max: 0.8, step: 0.05 },
    stepsPerFrame: { value: defaultCellularParams.stepsPerFrame, min: 1, max: 5, step: 1 },
    cellShape: { value: defaultCellularParams.cellShape, options: { Square: "square", Circle: "circle", Rounded: "rounded" } },
    colorMode: { value: defaultCellularParams.colorMode, options: { Single: "single", Age: "age", "State Change": "state-change" } },
    aliveColor: defaultCellularParams.aliveColor,
    youngColor: defaultCellularParams.youngColor,
    oldColor: defaultCellularParams.oldColor,
    maxAge: { value: defaultCellularParams.maxAge, min: 10, max: 200, step: 5 },
    deadColor: defaultCellularParams.deadColor,
    bgColor: defaultCellularParams.bgColor,
    glow: defaultCellularParams.glow,
    glowRadius: { value: defaultCellularParams.glowRadius, min: 2, max: 20, step: 1 },
    trail: defaultCellularParams.trail,
    trailLength: { value: defaultCellularParams.trailLength, min: 5, max: 60, step: 1 },
  });

  useControls("Actions", {
    "New Seed": button(() => {
      stateRef.current.init(params.gridWidth, params.gridHeight, params.initialDensity);
    }),
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
      drawCellular(ctx, width, height, frame, paramsRef.current, stateRef.current);
    },
    []
  );

  const handleReset = useCallback(() => {
    stateRef.current = new CellularState();
  }, []);

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="cellular"
      onReset={handleReset}
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
