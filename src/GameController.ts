import { Snake } from "./Snake";
import { Grid } from "./Grid";
import { Food } from "./Food";
import { Ui } from "./Ui";
import { EventTypes, KeyCode } from "./types/constants";

export class GameController {
  private board: HTMLDivElement | null;

  private readonly gridSize = 40;
  private readonly gridWidth = 30;
  private readonly gridHeight = 15;
  private gameWidth: number;
  private gameHeight: number;

  private snake: Snake | null = null;
  private snakeCanvas: HTMLCanvasElement | null = null;
  private grid: Grid | null = null;
  private gridCanvas: HTMLCanvasElement | null = null;
  private food: Food | null = null;
  private foodCanvas: HTMLCanvasElement | null = null;
  private ui: Ui | null = null;
  private uiCanvas: HTMLCanvasElement | null = null;

  private rafId: number = 0;
  private paused: boolean = true;
  private gameCount: number = 1;

  private constructor() {
    this.board = document.querySelector("div#board");
    this.gameWidth = this.gridSize * this.gridWidth;
    this.gameHeight = this.gridSize * this.gridHeight;
    this.setUp();
  }

  static create() {
    return new GameController();
  }

  setUp() {
    window.addEventListener("keyup", this);
    this.snake = new Snake(this.gameWidth, this.gameHeight, this.gridSize);
    this.snakeCanvas = this.snake.getCanvas();
    this.grid = new Grid(this.gameWidth, this.gameHeight, this.gridSize);
    this.gridCanvas = this.grid.getCanvas();
    this.food = new Food(this.gameWidth, this.gameHeight, this.gridSize);
    this.foodCanvas = this.food.getCanvas();
    this.ui = new Ui(this.gameWidth, this.gameHeight, this.gridSize);
    this.uiCanvas = this.ui.getCanvas();

    this.board?.appendChild(this.snakeCanvas);
    this.board?.appendChild(this.gridCanvas);
    this.board?.appendChild(this.foodCanvas);
    this.board?.appendChild(this.uiCanvas);

    this.ui.setDebugData({ gameCount: this.gameCount });
  }

  tearDown() {
    window.removeEventListener("keyup", this);
    this.snake?.tearDown();
    this.ui?.tearDown();
    this.food?.tearDown();
    this.grid?.tearDown();

    this.snakeCanvas?.remove();
    this.gridCanvas?.remove();
    this.foodCanvas?.remove();
    this.uiCanvas?.remove();

    delete this.snake;
    delete this.snakeCanvas;
    delete this.grid;
    delete this.gridCanvas;
    delete this.food;
    delete this.foodCanvas;
    delete this.ui;
    delete this.uiCanvas;

    this.snake = null;
    this.snakeCanvas = null;
    this.grid = null;
    this.gridCanvas = null;
    this.food = null;
    this.foodCanvas = null;
    this.ui = null;
    this.uiCanvas = null;

    window.cancelAnimationFrame(this.rafId);
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case EventTypes.KEYUP:
        this.handleKeyup(e as KeyboardEvent);
        break;
    }
  }

  handleKeyup(e: KeyboardEvent) {
    switch (e.code) {
      case KeyCode.ENTER:
        if (this.snake?.isSnakeDead()) {
          this.gameCount++;
          this.tearDown();
          this.setUp();
          this.run();
          return;
        }
        this.paused = !this.paused;
        break;

      default:
        break;
    }
  }

  run(timestamp?: number) {
    this.clear();

    const score = this.food?.getEatCount() ?? 0;
    this.ui?.setScore(score);

    const snakeDead = this.snake?.isSnakeDead();

    if (snakeDead) {
      this.ui?.setGameOver(true);
      this.ui?.draw(timestamp, this.paused);
      return;
    }

    this.ui?.draw(timestamp, this.paused);
    this.snake?.draw(timestamp, this.paused);
    this.food?.draw();

    const snakeCollision = this.snake?.getCollision();
    const foodCollision = this.food?.getCollision();
    const wallCollision = this.grid?.getCollision();

    if (snakeCollision) {
      foodCollision?.checkBounds([snakeCollision]);
      wallCollision?.checkBounds([snakeCollision]);
    }

    this.rafId = window.requestAnimationFrame(this.run.bind(this));
  }

  public clear(): void {}
}
