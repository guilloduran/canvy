"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CanvasSize {
  width: number;
  height: number;
}

export function useCanvasResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  fixedSize?: { width: number; height: number }
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const fixedWidthRef = useRef(fixedSize?.width);
  const fixedHeightRef = useRef(fixedSize?.height);
  fixedWidthRef.current = fixedSize?.width;
  fixedHeightRef.current = fixedSize?.height;

  const updateSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const fw = fixedWidthRef.current;
    const fh = fixedHeightRef.current;

    if (fw && fh) {
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const aspect = fw / fh;
      const containerAspect = containerW / containerH;

      let displayW: number, displayH: number;
      if (containerAspect > aspect) {
        displayH = containerH;
        displayW = displayH * aspect;
      } else {
        displayW = containerW;
        displayH = displayW / aspect;
      }

      const dpr = window.devicePixelRatio || 1;
      const targetW = fw * dpr;
      const targetH = fh * dpr;

      // Only set canvas dimensions when they actually change (setting clears the canvas)
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;

      setSize({ width: fw, height: fh });
    } else {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const targetW = w * dpr;
      const targetH = h * dpr;

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      setSize({ width: w, height: h });
    }
  }, [containerRef]);

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateSize, containerRef]);

  // Re-run when fixed size values actually change
  useEffect(() => {
    updateSize();
  }, [fixedSize?.width, fixedSize?.height, updateSize]);

  return { canvasRef, size };
}
