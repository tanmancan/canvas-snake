import { Drawable } from "./types/drawable";
import { HasCollision, Collision } from "./Collision";

export const FOOD_COLLISION = "FOOD";

export class Food implements Drawable, HasCollision {
  canvas?: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  width: number;
  height: number;
  gridSize: number;
  collision: Collision;

  private eatCount: number = 0;
  private foodPosition: number[];

  constructor(width: number, height: number, gridSize: number) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    const [x, y] = this.getRandomPosition();
    this.foodPosition = [x, y];

    this.collision = new Collision(this.eaten.bind(this), FOOD_COLLISION);
    this.collision.addBounds([[x, y]]);
    this.setUp();
  }

  setUp() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = "0";
    this.ctx.fillStyle = "red";
    this.draw();
  }

  tearDown() {
    this.canvas?.remove();
    this.canvas = null;
  }

  setCollision(collision: Collision) {
    this.collision = collision;
    this.ctx = null;
  }

  getCollision() {
    return this.collision;
  }

  eaten() {
    const ctx = this.getCtx();
    const [currentX, currentY] = this.foodPosition;
    ctx.clearRect(currentX, currentY, this.gridSize, this.gridSize);

    const [newX, newY] = this.getRandomPosition();
    ctx.fillRect(newX, newY, this.gridSize, this.gridSize);
    this.foodPosition = [newX, newY];
    this.collision.replaceBounds([[newX, newY]]);

    this.eatCount += 1;
  }

  getEatCount() {
    return this.eatCount;
  }

  getRandomPosition() {
    const widthSegments = this.width / this.gridSize;
    const heightSegments = this.height / this.gridSize;
    const posX = Math.floor(Math.random() * widthSegments);
    const posY = Math.floor(Math.random() * heightSegments);

    return [posX * this.gridSize, posY * this.gridSize];
  }

  getCanvas(): HTMLCanvasElement {
    return (this.canvas as unknown) as HTMLCanvasElement;
  }

  getCtx(): CanvasRenderingContext2D {
    return (this.ctx as unknown) as CanvasRenderingContext2D;
  }

  draw() {
    const ctx = this.getCtx();
    const [currentX, currentY] = this.foodPosition;
    ctx.fillRect(currentX, currentY, this.gridSize, this.gridSize);
  }
}
