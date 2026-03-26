"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import {
  defaultNetworkParams,
  drawNetwork,
  NetworkState,
} from "../sketches/network";

export default function NetworkPage() {
  const stateRef = useRef(new NetworkState());
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const params = useControls("Network", {
    particleCount: { value: defaultNetworkParams.particleCount, min: 5, max: 100, step: 1 },
    minWidth: { value: defaultNetworkParams.minWidth, min: 0.5, max: 20 },
    maxWidth: { value: defaultNetworkParams.maxWidth, min: 0.5, max: 20 },
    radius: { value: defaultNetworkParams.radius, min: 50, max: 500 },
    repelStrength: { value: defaultNetworkParams.repelStrength, min: 0.001, max: 0.1 },
    speed: { value: defaultNetworkParams.speed, min: 0.1, max: 5 },
    bgColor: defaultNetworkParams.bgColor,
    particleColor: defaultNetworkParams.particleColor,
    lineColor: defaultNetworkParams.lineColor,
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
      mousePos,
    }: {
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      frame: number;
      deltaTime: number;
      mousePos: { x: number; y: number };
    }) => {
      drawNetwork(ctx, width, height, paramsRef.current, stateRef.current, mousePos);
    },
    []
  );

  const handleReset = useCallback(() => {
    stateRef.current = new NetworkState();
  }, []);

  return (
    <SketchCanvas
      draw={draw}
      filename="network"
      onReset={handleReset}
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
