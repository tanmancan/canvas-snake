import { Drawable } from "./types/drawable";
import { Collision, HasCollision } from "./Collision";

export const WALL_COLLISION = "WALL";

export class Grid implements Drawable, HasCollision {
  canvas?: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  width: number;
  height: number;
  gridSize: number;
  collision: Collision | null = null;

  constructor(width: number, height: number, gridSize: number) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.setUp();
  }

  setUp() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = "1";
    this.ctx.translate(-0.5, -0.5);
    this.ctx.strokeStyle = "white";

    this.collision = new Collision(this.collide.bind(this), WALL_COLLISION);
    const wallBounds = this.getWallBounds();
    this.collision.addBounds(wallBounds);

    this.draw();
  }

  tearDown() {
    this.canvas?.remove();
    this.canvas = null;
    this.ctx = null;
    this.collision = null;
  }

  getWallBounds() {
    let bounds: [number, number][] = [];

    // Top and bottom wall
    for (let xPos = -this.gridSize; xPos < this.width; xPos += this.gridSize) {
      bounds.push([xPos, -this.gridSize]);
      bounds.push([xPos, this.height]);
    }
    // Side walls
    for (let yPos = -this.gridSize; yPos < this.height; yPos += this.gridSize) {
      bounds.push([-this.gridSize, yPos]);
      bounds.push([this.width, yPos]);
    }

    return bounds;
  }

  setCollision(collision: Collision) {
    this.collision = collision;
  }

  getCollision() {
    return (this.collision as unknown) as Collision;
  }

  getCanvas(): HTMLCanvasElement {
    return (this.canvas as unknown) as HTMLCanvasElement;
  }

  getCtx(): CanvasRenderingContext2D {
    return (this.ctx as unknown) as CanvasRenderingContext2D;
  }

  collide() {}

  draw() {
    const ctx = this.getCtx();
    ctx.beginPath();
    for (
      let gridLineX = 0;
      gridLineX < this.height;
      gridLineX += this.gridSize
    ) {
      ctx.moveTo(0, gridLineX);
      ctx.lineTo(this.width, gridLineX);
    }
    for (
      let gridLineY = 0;
      gridLineY < this.width;
      gridLineY += this.gridSize
    ) {
      ctx.moveTo(gridLineY, 0);
      ctx.lineTo(gridLineY, this.height);
    }
    ctx.stroke();
    ctx.closePath();
  }
}
