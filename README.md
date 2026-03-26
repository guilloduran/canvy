# Canvy

Interactive generative art sketches built with Canvas 2D, React, and Next.js. Each sketch runs in real-time with tweakable parameters and PNG export.

## Sketches

| Sketch | Description |
|--------|-------------|
| **Network** | Particle system with physics-based connections and mouse interaction |
| **Letry** | ASCII art generator with animated glyphs and color cycling |
| **Orca** | Grid-based line patterns driven by noise fields |
| **Flow Field** | Particles tracing through Perlin noise vector fields |
| **Glitch Grid** | Randomized grid tiles with digital glitch aesthetics |
| **Waveform** | Layered sine waves forming organic terrain landscapes |
| **String Art** | Mathematical string connections between geometric shapes |
| **Moire** | Overlapping ring patterns creating interference effects |
| **Radial Pulse** | Concentric rings with noise-modulated pulsing rhythms |
| **Iso Cubes** | Isometric 3D cube grid animated with Perlin noise |
| **Cellular** | Conway's Game of Life and other cellular automata rules |

## Features

- **Real-time controls** via [Leva](https://github.com/pmndrs/leva) — tweak colors, sizes, speeds, and modes on the fly
- **PNG export** at configurable resolution (up to 4096x4096)
- **Animated previews** on the homepage
- **Canvas 2D rendering** — no WebGL required

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [Leva](https://github.com/pmndrs/leva) for parameter GUI
- [canvas-sketch-util](https://github.com/mattdesl/canvas-sketch-util) for noise and math utilities
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse sketches.

## Project Structure

```
app/
  components/    # SketchCanvas, SketchCard, Navbar
  hooks/         # useAnimationLoop, useCanvasResize, useExportPNG, useMousePosition
  lib/           # Shared math utilities and types
  sketches/      # Pure draw functions and default params for each sketch
  <sketch>/      # Route pages (one per sketch)
  page.tsx       # Homepage with animated preview cards
```

## Adding a New Sketch

1. Create a draw function in `app/sketches/yoursketch.ts` exporting `drawYourSketch` and `defaultYourSketchParams`
2. Create a route page at `app/your-sketch/page.tsx` using the same pattern as existing sketches
3. Add a navbar link in `app/components/Navbar.tsx`
4. Add a preview card in `app/page.tsx`

## License

MIT
