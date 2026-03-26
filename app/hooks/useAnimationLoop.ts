"use client";

import { useCallback, useEffect, useRef } from "react";

const TARGET_FPS = 60;
const FRAME_DURATION_S = 1 / TARGET_FPS;

export function useAnimationLoop(
  onFrame: (frame: number, deltaTime: number) => void,
  options?: {
    onReset?: () => void;
    playing?: boolean;
    speed?: number;
  }
) {
  const playing = options?.playing ?? true;
  const speed = options?.speed ?? 1;

  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  const onResetRef = useRef(options?.onReset);
  onResetRef.current = options?.onReset;

  const renderFrame = useCallback((timestamp: number) => {
    const elapsed = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    if (playingRef.current) {
      timeRef.current += elapsed * speedRef.current;
    }

    const frame = timeRef.current / FRAME_DURATION_S;
    onFrameRef.current(frame, playingRef.current ? elapsed : 0);

    rafRef.current = requestAnimationFrame(renderFrame);
  }, []);

  useEffect(() => {
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame]);
}
