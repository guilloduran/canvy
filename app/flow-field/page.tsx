"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import {
  defaultFlowFieldParams,
  drawFlowField,
  FlowFieldState,
} from "../sketches/flowfield";

export default function FlowFieldPage() {
  const stateRef = useRef(new FlowFieldState());
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Flow Field", {
    particleCount: { value: defaultFlowFieldParams.particleCount, min: 500, max: 10000, step: 100 },
    noiseScale: { value: defaultFlowFieldParams.noiseScale, min: 0.001, max: 0.01, step: 0.0005 },
    noiseSpeed: { value: defaultFlowFieldParams.noiseSpeed, min: 0, max: 0.01, step: 0.0005 },
    particleSpeed: { value: defaultFlowFieldParams.particleSpeed, min: 0.5, max: 6, step: 0.1 },
    trailAlpha: { value: defaultFlowFieldParams.trailAlpha, min: 0.01, max: 0.15, step: 0.005 },
    strokeWidth: { value: defaultFlowFieldParams.strokeWidth, min: 0.5, max: 4, step: 0.1 },
    colorMode: { value: defaultFlowFieldParams.colorMode, options: { Single: "single", Gradient: "gradient", Rainbow: "rainbow" } },
    color: defaultFlowFieldParams.color,
    gradientA: defaultFlowFieldParams.gradientA,
    gradientB: defaultFlowFieldParams.gradientB,
    bgColor: defaultFlowFieldParams.bgColor,
    curlNoise: defaultFlowFieldParams.curlNoise,
    respawnOnEdge: defaultFlowFieldParams.respawnOnEdge,
  });

  useControls("Actions", {
    "Clear Trails": button(() => {
      stateRef.current.clear(params.bgColor);
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
      drawFlowField(ctx, width, height, frame, paramsRef.current, stateRef.current);
    },
    []
  );

  const handleReset = useCallback(() => {
    stateRef.current = new FlowFieldState();
  }, []);

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="flow-field"
      onReset={handleReset}
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
