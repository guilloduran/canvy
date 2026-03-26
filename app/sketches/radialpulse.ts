// eslint-disable-next-line @typescript-eslint/no-require-imports
const random = require("canvas-sketch-util/random");

export interface RadialPulseParams {
  ringCount: number;
  baseSpacing: number;
  baseWidth: number;
  spacingWave: number;
  widthWave: number;
  waveFreq: number;
  noiseModulation: number;
  noiseDetail: number;
  rotation: number;
  colorMode: string;
  ringColor: string;
  innerColor: string;
  outerColor: string;
  pulseColor: string;
  pulseSpeed: number;
  bgColor: string;
  glow: boolean;
  glowRadius: number;
}

export const defaultRadialPulseParams: RadialPulseParams = {
  ringCount: 30,
  baseSpacing: 15,
  baseWidth: 4,
  spacingWave: 0.3,
  widthWave: 0.5,
  waveFreq: 0.1,
  noiseModulation: 0.2,
  noiseDetail: 3,
  rotation: 0.002,
  colorMode: "single",
  ringColor: "#ffffff",
  innerColor: "#ff0044",
  outerColor: "#0066ff",
  pulseColor: "#ffffff",
  pulseSpeed: 0.5,
  bgColor: "#000000",
  glow: false,
  glowRadius: 10,
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerpHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

export function drawRadialPulse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: RadialPulseParams
) {
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const globalRotation = frame * params.rotation;
  const angleSteps = 180;

  if (params.glow) {
    ctx.shadowColor = params.ringColor;
    ctx.shadowBlur = params.glowRadius;
  }

  for (let i = 0; i < params.ringCount; i++) {
    const t = i / params.ringCount;

    // Modulated spacing
    const spacingMod = 1 + Math.sin(frame * params.waveFreq + i) * params.spacingWave;
    const radius = params.baseSpacing * (i + 1) * spacingMod;

    // Modulated width
    const widthMod = 1 + Math.sin(frame * params.waveFreq * 0.7 + i * 1.5) * params.widthWave;
    const lineWidth = params.baseWidth * widthMod;

    // Color
    let color: string;
    if (params.colorMode === "radial-gradient") {
      color = lerpHex(params.innerColor, params.outerColor, t);
    } else if (params.colorMode === "pulse") {
      const pulsePos = (frame * params.pulseSpeed * 0.05) % 1;
      const dist = Math.abs(t - pulsePos);
      const pulse = Math.max(0, 1 - dist * 8);
      color = pulse > 0.1
        ? lerpHex(params.ringColor, params.pulseColor, pulse)
        : params.ringColor;
    } else {
      color = params.ringColor;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    // Draw wobbly ring
    ctx.beginPath();
    for (let a = 0; a <= angleSteps; a++) {
      const angle = (a / angleSteps) * Math.PI * 2 + globalRotation;

      // Noise modulation for wobble
      let r = radius;
      if (params.noiseModulation > 0) {
        const n = random.noise3D(
          Math.cos(angle) * params.noiseDetail,
          Math.sin(angle) * params.noiseDetail,
          i * 0.1 + frame * 0.005
        );
        r += n * params.noiseModulation * params.baseSpacing * 3;
      }

      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
}
