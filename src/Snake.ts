import { KeyCode, EventTypes } from "./types/constants";
import { Drawable } from "./types/drawable";
import { HasCollision, Collision } from "./Collision";
import { FOOD_COLLISION } from "./Food";
import { WALL_COLLISION } from "./Grid";

type BodySegment = [number, number];

type SnakeVector = [number, number];

export const SNAKE_COLLISION = "SNAKE";

const HEAD_COLLISOIN = "HEAD";
const TAIL_COLLISION = "TAIL";

export class Snake implements Drawable, HasCollision {
  canvas?: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  width: number;
  height: number;
  gridSize: number;
  timestamp?: number;
  collision: Collision | null = null;

  private paused: boolean = false;
  private distanceFactor: number;
  private timeFactor: number = 5.5;
  private vector: SnakeVector;
  private body: BodySegment[] = [[0, 0]];
  private bodyLength = 3;
  private bodySegmentSize = 10;

  private headCollision: Collision | null = null;
  private tailCollision: Collision | null = null;

  private deadSnake: boolean = false;

  constructor(width: number, height: number, gridSize: number) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.distanceFactor = this.gridSize;
    this.bodySegmentSize = this.gridSize;
    this.vector = [this.gridSize, 0];

    this.setUp();
  }

  setUp() {
    window.addEventListener(EventTypes.KEYDOWN, this);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = "0";
    this.canvas.style.background = "whitesmoke";
    this.ctx.fillStyle = "green";

    this.collision = new Collision(this.collide.bind(this), SNAKE_COLLISION);
    this.collision.addBounds(this.body);

    /**
     * We will use these to track internal collision between the snake's head and tails.
     */
    this.headCollision = new Collision(this.collide.bind(this), HEAD_COLLISOIN);
    this.tailCollision = new Collision(this.collide.bind(this), TAIL_COLLISION);

    this.headCollision.addBounds([this.body[0]]);
    this.tailCollision.addBounds(this.body.slice(1));
  }

  tearDown() {
    window.removeEventListener(EventTypes.KEYDOWN, this);
    this.canvas?.remove();
    this.canvas = null;
    this.ctx = null;
    this.collision = null;
    this.headCollision = null;
    this.tailCollision = null;
  }

  checkInternalCollision() {
    if (this.tailCollision)
      this.headCollision?.checkBounds([this.tailCollision]);
  }

  collide(source: string) {
    switch (source) {
      case FOOD_COLLISION:
        this.eat();
        break;
      case TAIL_COLLISION:
      case HEAD_COLLISOIN:
      case WALL_COLLISION:
        this.die();
        break;
      default:
        break;
    }
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

  handleEvent(e: KeyboardEvent) {
    switch (e.type) {
      case EventTypes.KEYDOWN:
        this.keyDownHandler(e);
        break;
    }
  }

  keyDownHandler(e: KeyboardEvent) {
    if (this.paused) return;

    switch (e.code) {
      case KeyCode.ARROW_LEFT:
        this.vector = [-1 * this.distanceFactor, 0];
        break;
      case KeyCode.ARROW_RIGHT:
        this.vector = [this.distanceFactor, 0];
        break;
      case KeyCode.ARROW_UP:
        this.vector = [0, -1 * this.distanceFactor];
        break;
      case KeyCode.ARROW_DOWN:
        this.vector = [0, this.distanceFactor];
        break;
    }
  }

  eat() {
    this.bodyLength += 1;
    this.timeFactor -= 0.125;
  }

  move() {
    const newPos = this.getNewHeadPos();
    if (!newPos) return;

    let removedSegment: BodySegment | undefined;
    if ((this.body.length = this.bodyLength)) {
      removedSegment = this.body.pop();
    }

    this.body.unshift(newPos);

    this.collision?.replaceBounds(this.body);
    this.headCollision?.replaceBounds([this.body[0]]);
    this.tailCollision?.replaceBounds(this.body.slice(1));

    this.checkInternalCollision();

    return removedSegment;
  }

  getNewHeadPos(): [number, number] | null {
    const [headX, headY] = this.body[0];
    const [speedX, speedY] = this.vector;

    return [headX + speedX, headY + speedY];
  }

  die() {
    this.deadSnake = true;
  }

  isSnakeDead() {
    return this.deadSnake;
  }

  delayCheck(timestamp?: number): boolean {
    if (
      timestamp &&
      this.timestamp &&
      timestamp < this.timestamp + Math.exp(this.timeFactor)
    ) {
      return true;
    }

    return false;
  }

  draw(timestamp?: number, paused?: boolean) {
    const ctx = this.getCtx();

    if (this.isSnakeDead()) return;

    this.paused = (paused as boolean) ?? false;
    if (paused) {
      return;
    }

    if (!this.delayCheck(timestamp)) {
      const removedSegment = this.move();
      if (removedSegment) {
        const [removedX, removedY] = removedSegment;
        ctx.clearRect(
          removedX,
          removedY,
          this.bodySegmentSize,
          this.bodySegmentSize
        );
      }
      this.timestamp = timestamp;
    }

    this.body.forEach(([bodyX, bodyY]) => {
      ctx.fillRect(bodyX, bodyY, this.bodySegmentSize, this.bodySegmentSize);
    });
  }
}
