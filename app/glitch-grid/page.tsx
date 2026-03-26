"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import {
  defaultGlitchGridParams,
  drawGlitchGrid,
  GlitchGridState,
} from "../sketches/glitchgrid";

export default function GlitchGridPage() {
  const stateRef = useRef(new GlitchGridState());
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Glitch Grid", {
    cols: { value: defaultGlitchGridParams.cols, min: 5, max: 60, step: 1 },
    rows: { value: defaultGlitchGridParams.rows, min: 5, max: 60, step: 1 },
    palette: { value: defaultGlitchGridParams.palette, options: { Neon: "neon", Monochrome: "monochrome", Vapor: "vapor", Custom: "custom" } },
    customColor1: defaultGlitchGridParams.customColor1,
    customColor2: defaultGlitchGridParams.customColor2,
    customColor3: defaultGlitchGridParams.customColor3,
    glitchIntensity: { value: defaultGlitchGridParams.glitchIntensity, min: 0, max: 1, step: 0.01 },
    shiftAmount: { value: defaultGlitchGridParams.shiftAmount, min: 1, max: 20, step: 1 },
    duplicationChance: { value: defaultGlitchGridParams.duplicationChance, min: 0, max: 0.5, step: 0.01 },
    scanLines: defaultGlitchGridParams.scanLines,
    scanLineOpacity: { value: defaultGlitchGridParams.scanLineOpacity, min: 0, max: 0.5, step: 0.01 },
    noiseOverlay: defaultGlitchGridParams.noiseOverlay,
    noiseAmount: { value: defaultGlitchGridParams.noiseAmount, min: 0, max: 0.2, step: 0.01 },
    animateSpeed: { value: defaultGlitchGridParams.animateSpeed, min: 0.1, max: 5, step: 0.1 },
    bgColor: defaultGlitchGridParams.bgColor,
    blockStyle: { value: defaultGlitchGridParams.blockStyle, options: { Fill: "fill", Outline: "outline", Mixed: "mixed" } },
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
      drawGlitchGrid(ctx, width, height, frame, paramsRef.current, stateRef.current);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="glitch-grid"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
