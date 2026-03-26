"use client";

import { useCallback, useEffect } from "react";

export function useExportPNG(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  filename = "canvy-export"
) {
  const exportPNG = useCallback(
    (scale = 1) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (scale === 1) {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        // High-res export: redraw at higher resolution
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = canvas.width * scale;
        exportCanvas.height = canvas.height * scale;
        const ctx = exportCanvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
        const link = document.createElement("a");
        link.download = `${filename}-${scale}x.png`;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
      }
    },
    [canvasRef, filename]
  );

  // Cmd+S / Ctrl+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        exportPNG();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exportPNG]);

  return exportPNG;
}
