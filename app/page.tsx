"use client";

import { useMemo } from "react";
import SketchCard from "./components/SketchCard";
import { drawNetwork, NetworkState } from "./sketches/network";
import { defaultNetworkParams } from "./sketches/network";
import { drawLetry, defaultLetryParams, LetryState } from "./sketches/letry";
import { drawOrca, defaultOrcaParams } from "./sketches/orca";
import { drawFlowField, defaultFlowFieldParams, FlowFieldState } from "./sketches/flowfield";
import { drawGlitchGrid, defaultGlitchGridParams, GlitchGridState } from "./sketches/glitchgrid";
import { drawWaveform, defaultWaveformParams } from "./sketches/waveform";
import { drawStringArt, defaultStringArtParams } from "./sketches/stringart";
import { drawMoire, defaultMoireParams } from "./sketches/moire";
import { drawRadialPulse, defaultRadialPulseParams } from "./sketches/radialpulse";
import { drawIsoCubes, defaultIsoCubesParams } from "./sketches/isocubes";
import { drawCellular, defaultCellularParams, CellularState } from "./sketches/cellular";

function usePreviewSketches() {
  return useMemo(() => {
    const networkPreviewState = new NetworkState();
    const letryPreviewState = new LetryState();
    const flowFieldPreviewState = new FlowFieldState();
    const glitchGridPreviewState = new GlitchGridState();
    const cellularPreviewState = new CellularState();

    return [
      {
        href: "/network",
        title: "Network",
        description: "Particle system with physics-based connections and mouse interaction",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
          drawNetwork(
            ctx, width, height,
            { ...defaultNetworkParams, particleCount: 20, radius: 120 },
            networkPreviewState,
            { x: -9999, y: -9999 }
          );
        },
      },
      {
        href: "/letry",
        title: "Letry",
        description: "ASCII art generator with animated glyphs and color cycling",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawLetry(ctx, width, height, frame, {
            ...defaultLetryParams,
            fontSize: 20,
            cellSize: 10,
            baseScale: 1.5,
            maxScale: 3,
            rotationSpeed: 0.005,
          }, letryPreviewState);
        },
      },
      {
        href: "/orca",
        title: "Orca",
        description: "Grid-based line patterns driven by noise fields",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawOrca(ctx, width, height, frame, defaultOrcaParams);
        },
      },
      {
        href: "/flow-field",
        title: "Flow Field",
        description: "Particles tracing through Perlin noise vector fields",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawFlowField(ctx, width, height, frame, defaultFlowFieldParams, flowFieldPreviewState);
        },
      },
      {
        href: "/glitch-grid",
        title: "Glitch Grid",
        description: "Randomized grid tiles with digital glitch aesthetics",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawGlitchGrid(ctx, width, height, frame, defaultGlitchGridParams, glitchGridPreviewState);
        },
      },
      {
        href: "/waveform",
        title: "Waveform",
        description: "Layered sine waves forming organic terrain landscapes",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawWaveform(ctx, width, height, frame, defaultWaveformParams);
        },
      },
      {
        href: "/string-art",
        title: "String Art",
        description: "Mathematical string connections between geometric shapes",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          const r = Math.min(width, height) * 0.4;
          drawStringArt(ctx, width, height, frame, {
            ...defaultStringArtParams,
            radius1: r,
            radius2: r * 0.75,
          });
        },
      },
      {
        href: "/moire",
        title: "Moiré",
        description: "Overlapping ring patterns creating interference effects",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawMoire(ctx, width, height, frame, defaultMoireParams, { x: -9999, y: -9999 });
        },
      },
      {
        href: "/radial-pulse",
        title: "Radial Pulse",
        description: "Concentric rings with noise-modulated pulsing rhythms",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawRadialPulse(ctx, width, height, frame, defaultRadialPulseParams);
        },
      },
      {
        href: "/iso-cubes",
        title: "Iso Cubes",
        description: "Isometric 3D cube grid animated with Perlin noise",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawIsoCubes(ctx, width, height, frame, defaultIsoCubesParams);
        },
      },
      {
        href: "/cellular",
        title: "Cellular",
        description: "Conway's Game of Life and other cellular automata rules",
        drawPreview: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
          drawCellular(ctx, width, height, frame, defaultCellularParams, cellularPreviewState);
        },
      },
    ];
  }, []);
}

export default function HomePage() {
  const sketches = usePreviewSketches();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">Canvy</h1>
        <p className="text-white/50 mt-2 text-lg">
          Interactive generative art sketches
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sketches.map((sketch) => (
          <SketchCard key={sketch.href} {...sketch} />
        ))}
      </div>
    </div>
  );
}
