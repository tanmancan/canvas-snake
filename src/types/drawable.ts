export interface Drawable {
  canvas?: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;
  timestamp?: number;
  setUp: () => void;
  tearDown: () => void;
  getCanvas: () => HTMLCanvasElement;
  getCtx: () => CanvasRenderingContext2D;
  draw: (timestamp?: number, paused?: boolean) => void;
}
