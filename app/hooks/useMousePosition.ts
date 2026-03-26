"use client";

import { useEffect, useRef } from "react";

export function useMousePosition(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const pos = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updatePos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = (canvas.width / (window.devicePixelRatio || 1)) / rect.width;
      const scaleY = (canvas.height / (window.devicePixelRatio || 1)) / rect.height;
      pos.current = {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handleMove = (e: MouseEvent) => {
      updatePos(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleLeave = () => {
      pos.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleLeave);
    };
  }, [canvasRef]);

  return pos;
}
