export interface MoireParams {
  ringCount: number;
  ringSpacing: number;
  strokeWidth: number;
  sets: number;
  rotationSpeed1: number;
  rotationSpeed2: number;
  offsetX: number;
  offsetY: number;
  mouseInfluence: boolean;
  lineColor: string;
  bgColor: string;
  composite: GlobalCompositeOperation;
  shape: string;
  radialLineCount: number;
}

export const defaultMoireParams: MoireParams = {
  ringCount: 40,
  ringSpacing: 12,
  strokeWidth: 2,
  sets: 2,
  rotationSpeed1: 0.005,
  rotationSpeed2: -0.003,
  offsetX: 0,
  offsetY: 0,
  mouseInfluence: true,
  lineColor: "#ffffff",
  bgColor: "#000000",
  composite: "difference",
  shape: "circle",
  radialLineCount: 120,
};

function drawCircleSet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  params: MoireParams,
  rotation: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  if (params.shape === "radial-lines") {
    for (let i = 0; i < params.radialLineCount; i++) {
      const angle = (i / params.radialLineCount) * Math.PI * 2;
      const maxR = params.ringCount * params.ringSpacing;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * maxR, Math.sin(angle) * maxR);
      ctx.stroke();
    }
  } else {
    for (let i = 1; i <= params.ringCount; i++) {
      const r = i * params.ringSpacing;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawMoire(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: MoireParams,
  mousePos: { x: number; y: number }
) {
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = params.lineColor;
  ctx.lineWidth = params.strokeWidth;

  const cx = width / 2;
  const cy = height / 2;

  const speeds = [
    params.rotationSpeed1,
    params.rotationSpeed2,
    params.rotationSpeed1 * 0.7,
    params.rotationSpeed2 * 0.5,
  ];
  const offsets = [
    { x: 0, y: 0 },
    { x: params.offsetX, y: params.offsetY },
    { x: -params.offsetX * 0.5, y: params.offsetY * 0.5 },
    { x: params.offsetX * 0.3, y: -params.offsetY * 0.7 },
  ];

  ctx.globalCompositeOperation = params.composite;

  for (let s = 0; s < params.sets; s++) {
    let ox = offsets[s]?.x ?? 0;
    let oy = offsets[s]?.y ?? 0;

    if (s === 1 && params.mouseInfluence && mousePos.x > 0 && mousePos.y > 0) {
      ox = (mousePos.x - cx) * 0.3;
      oy = (mousePos.y - cy) * 0.3;
    }

    const rotation = frame * (speeds[s] ?? 0);
    drawCircleSet(ctx, cx + ox, cy + oy, params, rotation);
  }

  ctx.globalCompositeOperation = "source-over";
}
