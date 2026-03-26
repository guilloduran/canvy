export interface SketchDrawArgs {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  frame: number;
  deltaTime: number;
  mousePos: { x: number; y: number };
}

export type SketchDrawFn<P> = (args: SketchDrawArgs, params: P) => void;

export type SketchInitFn<P, S> = (
  args: { width: number; height: number },
  params: P
) => S;

export interface SketchDefinition<P, S = unknown> {
  name: string;
  description: string;
  defaultParams: P;
  init?: SketchInitFn<P, S>;
  draw: (args: SketchDrawArgs, params: P, state: S) => void;
}
