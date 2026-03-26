export interface StringArtParams {
  pointCount: number;
  shape1: string;
  shape2: string;
  radius1: number;
  radius2: number;
  offset: number;
  strokeWidth: number;
  lineAlpha: number;
  colorMode: string;
  lineColor: string;
  gradientA: string;
  gradientB: string;
  bgColor: string;
  animateSpeed: number;
  rotationSpeed: number;
  mirror: boolean;
}

export const defaultStringArtParams: StringArtParams = {
  pointCount: 80,
  shape1: "circle",
  shape2: "circle",
  radius1: 400,
  radius2: 300,
  offset: 1,
  strokeWidth: 0.5,
  lineAlpha: 0.4,
  colorMode: "single",
  lineColor: "#ffffff",
  gradientA: "#ff0044",
  gradientB: "#4400ff",
  bgColor: "#000000",
  animateSpeed: 0.01,
  rotationSpeed: 0.002,
  mirror: false,
};

function getShapePoints(
  shape: string,
  count: number,
  radius: number,
  cx: number,
  cy: number,
  rotation: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x: number, y: number;

    switch (shape) {
      case "square": {
        const perimeter = 4;
        const p = t * perimeter;
        if (p < 1) { x = -1 + p * 2; y = -1; }
        else if (p < 2) { x = 1; y = -1 + (p - 1) * 2; }
        else if (p < 3) { x = 1 - (p - 2) * 2; y = 1; }
        else { x = -1; y = 1 - (p - 3) * 2; }
        x *= radius; y *= radius;
        break;
      }
      case "line-top":
        x = -radius + t * radius * 2; y = -radius;
        break;
      case "line-bottom":
        x = -radius + t * radius * 2; y = radius;
        break;
      case "line-left":
        x = -radius; y = -radius + t * radius * 2;
        break;
      case "line-right":
        x = radius; y = -radius + t * radius * 2;
        break;
      default: { // circle
        const angle = t * Math.PI * 2;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }
    }

    // Apply rotation
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    points.push({
      x: cx + x * cos - y * sin,
      y: cy + x * sin + y * cos,
    });
  }

  return points;
}

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

export function drawStringArt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: StringArtParams
) {
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const rotation = frame * params.rotationSpeed;
  const animatedOffset = params.offset + frame * params.animateSpeed;

  const points1 = getShapePoints(params.shape1, params.pointCount, params.radius1, cx, cy, rotation);
  const points2 = getShapePoints(params.shape2, params.pointCount, params.radius2, cx, cy, -rotation * 0.5);

  ctx.lineWidth = params.strokeWidth;
  ctx.globalAlpha = params.lineAlpha;

  for (let i = 0; i < params.pointCount; i++) {
    const j = (i + Math.floor(animatedOffset)) % params.pointCount;
    const p1 = points1[i];
    const p2 = points2[j];

    const t = i / params.pointCount;
    if (params.colorMode === "gradient") {
      ctx.strokeStyle = lerpHex(params.gradientA, params.gradientB, t);
    } else if (params.colorMode === "angle-hue") {
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const hue = ((angle / Math.PI) * 180 + 360) % 360;
      ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
    } else {
      ctx.strokeStyle = params.lineColor;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    if (params.mirror) {
      const mx1 = cx - (p1.x - cx);
      const mx2 = cx - (p2.x - cx);
      ctx.beginPath();
      ctx.moveTo(mx1, p1.y);
      ctx.lineTo(mx2, p2.y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}
