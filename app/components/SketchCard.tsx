"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

interface SketchCardProps {
  href: string;
  title: string;
  description: string;
  drawPreview: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frame: number
  ) => void;
}

export default function SketchCard({
  href,
  title,
  description,
  drawPreview,
}: SketchCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const drawRef = useRef(drawPreview);
  drawRef.current = drawPreview;

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  const lastTimeRef = useRef(0);
  const timeRef = useRef(0);
  const PREVIEW_SPEED = 0.15;

  const animate = useCallback((timestamp: number) => {
    const elapsed = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;
    timeRef.current += elapsed * PREVIEW_SPEED;
    frameRef.current = timeRef.current * 60;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawRef.current(ctx, canvas.width / dpr, canvas.height / dpr, frameRef.current);
    ctx.restore();

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    updateCanvasSize();

    const observer = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) observer.observe(containerRef.current);

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, updateCanvasSize]);

  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all duration-200"
    >
      <div ref={containerRef} className="w-full aspect-[4/3]">
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white group-hover:text-white/90">
          {title}
        </h2>
        <p className="text-sm text-white/50 mt-1">{description}</p>
      </div>
    </Link>
  );
}
