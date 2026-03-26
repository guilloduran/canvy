"use client";

import { useCallback, useEffect, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import {
  defaultLetryParams,
  drawLetry,
  LetryState,
  randomizeGlyphs,
} from "../sketches/letry";

export default function LetryPage() {
  const stateRef = useRef(new LetryState());
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const [params, set] = useControls("Letry", () => ({
    // General
    text: defaultLetryParams.text,
    fontSize: { value: defaultLetryParams.fontSize, min: 10, max: 200 },
    fontFamily: {
      value: defaultLetryParams.fontFamily,
      options: { "Sans Serif": "sans-serif", Serif: "serif", Monospace: "monospace" },
    },
    keyboardInput: defaultLetryParams.keyboardInput,

    // Grid
    cellSize: { value: defaultLetryParams.cellSize, min: 5, max: 50, step: 1 },
    randomSizeChance: { value: defaultLetryParams.randomSizeChance, min: 0, max: 1 },
    baseScale: { value: defaultLetryParams.baseScale, min: 0.5, max: 5 },
    maxScale: { value: defaultLetryParams.maxScale, min: 3, max: 12 },

    // Colors
    bgColor: defaultLetryParams.bgColor,
    textColor: defaultLetryParams.textColor,
    colorCycling: defaultLetryParams.colorCycling,
    cycleSpeed: { value: defaultLetryParams.cycleSpeed, min: 0.1, max: 2 },

    // Animation
    rotationSpeed: { value: defaultLetryParams.rotationSpeed, min: 0, max: 0.05, step: 0.001 },
    pulseEffect: defaultLetryParams.pulseEffect,
    pulseSpeed: { value: defaultLetryParams.pulseSpeed, min: 0.1, max: 2 },
    pulseStrength: { value: defaultLetryParams.pulseStrength, min: 0.1, max: 1 },

    // Glyphs
    glyph1: defaultLetryParams.glyph1,
    glyph2: defaultLetryParams.glyph2,
    glyph3: defaultLetryParams.glyph3,
    glyph4: defaultLetryParams.glyph4,
    "Randomize Glyphs": button(() => {
      set(randomizeGlyphs());
    }),
  }));

  useControls("Export", {
    "Export PNG": button(() => exportRef.current?.()),
  });

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!params.keyboardInput) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1) {
        set({ text: e.key.toUpperCase() });
      }
    };
    window.addEventListener("keyup", handler);
    return () => window.removeEventListener("keyup", handler);
  }, [params.keyboardInput, set]);

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
      drawLetry(ctx, width, height, frame, paramsRef.current, stateRef.current);
    },
    []
  );

  const handleReset = useCallback(() => {
    stateRef.current = new LetryState();
  }, []);

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="letry"
      onReset={handleReset}
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
