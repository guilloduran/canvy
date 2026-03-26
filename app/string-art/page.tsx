"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import { defaultStringArtParams, drawStringArt } from "../sketches/stringart";

export default function StringArtPage() {
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("String Art", {
    pointCount: { value: defaultStringArtParams.pointCount, min: 20, max: 300, step: 1 },
    shape1: { value: defaultStringArtParams.shape1, options: { Circle: "circle", Square: "square", "Line Top": "line-top", "Line Left": "line-left" } },
    shape2: { value: defaultStringArtParams.shape2, options: { Circle: "circle", Square: "square", "Line Bottom": "line-bottom", "Line Right": "line-right" } },
    radius1: { value: defaultStringArtParams.radius1, min: 100, max: 500, step: 5 },
    radius2: { value: defaultStringArtParams.radius2, min: 100, max: 500, step: 5 },
    offset: { value: defaultStringArtParams.offset, min: 1, max: 50, step: 1 },
    strokeWidth: { value: defaultStringArtParams.strokeWidth, min: 0.2, max: 3, step: 0.1 },
    lineAlpha: { value: defaultStringArtParams.lineAlpha, min: 0.05, max: 1, step: 0.01 },
    colorMode: { value: defaultStringArtParams.colorMode, options: { Single: "single", Gradient: "gradient", "Angle Hue": "angle-hue" } },
    lineColor: defaultStringArtParams.lineColor,
    gradientA: defaultStringArtParams.gradientA,
    gradientB: defaultStringArtParams.gradientB,
    bgColor: defaultStringArtParams.bgColor,
    animateSpeed: { value: defaultStringArtParams.animateSpeed, min: 0.001, max: 0.05, step: 0.001 },
    rotationSpeed: { value: defaultStringArtParams.rotationSpeed, min: 0, max: 0.01, step: 0.0005 },
    mirror: defaultStringArtParams.mirror,
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
      drawStringArt(ctx, width, height, frame, paramsRef.current);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="string-art"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
