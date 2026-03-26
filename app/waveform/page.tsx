"use client";

import { useCallback, useRef } from "react";
import { button, useControls } from "leva";
import SketchCanvas from "../components/SketchCanvas";
import { defaultWaveformParams, drawWaveform } from "../sketches/waveform";

export default function WaveformPage() {
  const exportRef = useRef<(() => void) | null>(null);

  const animControls = useControls("Animation", {
    playing: { value: true, label: "Play" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1 },
  });

  const canvasSize = useControls("Canvas", {
    width: { value: 1080, min: 100, max: 4096, step: 1 },
    height: { value: 1080, min: 100, max: 4096, step: 1 },
  });

  const params = useControls("Waveform", {
    lineCount: { value: defaultWaveformParams.lineCount, min: 10, max: 80, step: 1 },
    pointsPerLine: { value: defaultWaveformParams.pointsPerLine, min: 50, max: 500, step: 10 },
    amplitude: { value: defaultWaveformParams.amplitude, min: 10, max: 120, step: 1 },
    noiseScale: { value: defaultWaveformParams.noiseScale, min: 0.002, max: 0.05, step: 0.001 },
    noiseSpeed: { value: defaultWaveformParams.noiseSpeed, min: 0, max: 0.02, step: 0.001 },
    lineSpacing: { value: defaultWaveformParams.lineSpacing, min: 4, max: 25, step: 0.5 },
    strokeWidth: { value: defaultWaveformParams.strokeWidth, min: 0.5, max: 4, step: 0.1 },
    fillBelow: defaultWaveformParams.fillBelow,
    perspective: { value: defaultWaveformParams.perspective, min: 0, max: 1, step: 0.01 },
    centerBias: { value: defaultWaveformParams.centerBias, min: 0, max: 1, step: 0.01 },
    lineColor: defaultWaveformParams.lineColor,
    colorByAmplitude: defaultWaveformParams.colorByAmplitude,
    lowColor: defaultWaveformParams.lowColor,
    highColor: defaultWaveformParams.highColor,
    bgColor: defaultWaveformParams.bgColor,
    mirror: defaultWaveformParams.mirror,
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
      drawWaveform(ctx, width, height, frame, paramsRef.current);
    },
    []
  );

  return (
    <SketchCanvas
      draw={draw}
      fixedSize={{ width: canvasSize.width, height: canvasSize.height }}
      filename="waveform"
      playing={animControls.playing}
      speed={animControls.speed}
      exportRef={exportRef}
    />
  );
}
