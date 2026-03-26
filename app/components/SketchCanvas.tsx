"use client";

import { useCallback, useRef } from "react";
import { useCanvasResize } from "../hooks/useCanvasResize";
import { useAnimationLoop } from "../hooks/useAnimationLoop";
import { useExportPNG } from "../hooks/useExportPNG";
import { useMousePosition } from "../hooks/useMousePosition";

interface SketchCanvasProps {
  draw: (args: {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    frame: number;
    deltaTime: number;
    mousePos: { x: number; y: number };
  }) => void;
  fixedSize?: { width: number; height: number };
  filename?: string;
  className?: string;
  onReset?: () => void;
  playing?: boolean;
  speed?: number;
  exportRef?: React.MutableRefObject<(() => void) | null>;
}

export default function SketchCanvas({
  draw,
  fixedSize,
  filename = "canvy-export",
  className = "",
  onReset,
  playing = true,
  speed = 1,
  exportRef,
}: SketchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasRef } = useCanvasResize(containerRef, fixedSize);
  const mousePos = useMousePosition(canvasRef);
  const exportPNG = useExportPNG(canvasRef, filename);
  if (exportRef) exportRef.current = exportPNG;

  const drawRef = useRef(draw);
  drawRef.current = draw;

  const onFrame = useCallback(
    (frame: number, deltaTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = fixedSize?.width ?? canvas.width / dpr;
      const h = fixedSize?.height ?? canvas.height / dpr;

      drawRef.current({
        ctx,
        width: w,
        height: h,
        frame,
        deltaTime,
        mousePos: mousePos.current,
      });

      ctx.restore();
    },
    [canvasRef, fixedSize, mousePos]
  );

  useAnimationLoop(onFrame, { onReset, playing, speed });

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center bg-black ${className}`}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
