// eslint-disable-next-line @typescript-eslint/no-require-imports
const random = require("canvas-sketch-util/random");

export interface FlowFieldParams {
  particleCount: number;
  noiseScale: number;
  noiseSpeed: number;
  particleSpeed: number;
  trailAlpha: number;
  strokeWidth: number;
  colorMode: string;
  color: string;
  gradientA: string;
  gradientB: string;
  bgColor: string;
  curlNoise: boolean;
  respawnOnEdge: boolean;
}

export const defaultFlowFieldParams: FlowFieldParams = {
  particleCount: 2000,
  noiseScale: 0.003,
  noiseSpeed: 0.002,
  particleSpeed: 2,
  trailAlpha: 0.03,
  strokeWidth: 1,
  colorMode: "single",
  color: "#ffffff",
  gradientA: "#ff0044",
  gradientB: "#0066ff",
  bgColor: "#000000",
  curlNoise: false,
  respawnOnEdge: true,
};

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export class FlowFieldState {
  particles: Particle[] = [];
  trailCanvas: OffscreenCanvas | null = null;
  trailCtx: OffscreenCanvasRenderingContext2D | null = null;
  lastWidth = 0;
  lastHeight = 0;

  ensureTrail(width: number, height: number) {
    if (!this.trailCanvas || this.lastWidth !== width || this.lastHeight !== height) {
      this.trailCanvas = new OffscreenCanvas(width, height);
      this.trailCtx = this.trailCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      this.trailCtx.fillStyle = "#000000";
      this.trailCtx.fillRect(0, 0, width, height);
      this.lastWidth = width;
      this.lastHeight = height;
      this.particles = [];
    }
  }

  ensureParticles(width: number, height: number, count: number) {
    while (this.particles.length < count) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.particles.push({ x, y, prevX: x, prevY: y });
    }
    if (this.particles.length > count) {
      this.particles.length = count;
    }
  }

  clear(bgColor: string) {
    if (this.trailCtx && this.trailCanvas) {
      this.trailCtx.fillStyle = bgColor;
      this.trailCtx.fillRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    }
    this.particles = [];
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

export function drawFlowField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: FlowFieldParams,
  state: FlowFieldState
) {
  state.ensureTrail(width, height);
  state.ensureParticles(width, height, params.particleCount);
  const trail = state.trailCtx!;
  const trailCanvas = state.trailCanvas!;

  // Fade trail
  trail.fillStyle = params.bgColor;
  trail.globalAlpha = params.trailAlpha;
  trail.fillRect(0, 0, width, height);
  trail.globalAlpha = 1;

  // Draw particles onto trail
  trail.lineWidth = params.strokeWidth;
  trail.lineCap = "round";

  const time = frame * params.noiseSpeed;

  for (const p of state.particles) {
    p.prevX = p.x;
    p.prevY = p.y;

    let angle: number;
    if (params.curlNoise) {
      const eps = 1;
      const n1 = random.noise3D(p.x * params.noiseScale, (p.y + eps) * params.noiseScale, time);
      const n2 = random.noise3D(p.x * params.noiseScale, (p.y - eps) * params.noiseScale, time);
      const n3 = random.noise3D((p.x + eps) * params.noiseScale, p.y * params.noiseScale, time);
      const n4 = random.noise3D((p.x - eps) * params.noiseScale, p.y * params.noiseScale, time);
      const dx = (n1 - n2) / (2 * eps);
      const dy = -(n3 - n4) / (2 * eps);
      angle = Math.atan2(dy, dx);
    } else {
      const n = random.noise3D(p.x * params.noiseScale, p.y * params.noiseScale, time);
      angle = n * Math.PI * 2;
    }

    p.x += Math.cos(angle) * params.particleSpeed;
    p.y += Math.sin(angle) * params.particleSpeed;

    // Color
    let color = params.color;
    if (params.colorMode === "gradient") {
      const n = random.noise3D(p.x * params.noiseScale, p.y * params.noiseScale, time);
      const t = (n + 1) * 0.5;
      color = lerpColor(params.gradientA, params.gradientB, t);
    } else if (params.colorMode === "rainbow") {
      const hue = ((angle / Math.PI / 2) * 360 + 360) % 360;
      color = `hsl(${hue}, 80%, 60%)`;
    }

    trail.strokeStyle = color;
    trail.beginPath();
    trail.moveTo(p.prevX, p.prevY);
    trail.lineTo(p.x, p.y);
    trail.stroke();

    // Respawn
    if (params.respawnOnEdge) {
      if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.prevX = p.x;
        p.prevY = p.y;
      }
    } else {
      p.x = ((p.x % width) + width) % width;
      p.y = ((p.y % height) + height) % height;
    }
  }

  // Draw trail to main canvas
  ctx.drawImage(trailCanvas, 0, 0);
}
