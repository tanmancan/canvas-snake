import { Drawable } from "./types/drawable";
import { EventTypes } from "./types/constants";

export class Ui implements Drawable {
  canvas?: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  width: number;
  height: number;
  timestamp?: number;
  gridSize: number;

  private score: number = 0;
  private gameOver: boolean = false;

  private debug: boolean = true;
  private debugData = {
    x: 0,
    y: 0,
    lastTimestamp: 0,
    gameCount: 1,
  };

  constructor(width: number, height: number, gridSize: number) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.setUp();
  }

  setUp() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas?.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.addEventListener("mousemove", this);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = "3";
    this.setDefaultTextStyles();

    this.draw();
  }

  tearDown() {
    this.canvas?.removeEventListener("mousemove", this);
    this.canvas?.remove();
    this.canvas = null;
    this.ctx = null;
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case EventTypes.MOUSEMOVE:
        this.handleMouseMove(e as MouseEvent);
        break;
    }
  }

  handleMouseMove(e: MouseEvent) {
    this.debugData.x = e.offsetX;
    this.debugData.y = e.offsetY;
  }

  getCanvas(): HTMLCanvasElement {
    return (this.canvas as unknown) as HTMLCanvasElement;
  }

  getCtx(): CanvasRenderingContext2D {
    return (this.ctx as unknown) as CanvasRenderingContext2D;
  }

  setScore(score: number) {
    this.score = score;
  }

  setGameOver(gameOver: boolean) {
    this.gameOver = gameOver;
  }

  setDefaultTextStyles() {
    const ctx = this.getCtx();
    ctx.fillStyle = "black";
    ctx.font = `700 ${this.gridSize}px monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
  }

  setOverlayTextStyles() {
    const ctx = this.getCtx();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }

  renderPauseScreen() {
    const ctx = this.getCtx();
    this.setOverlayTextStyles();
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1.0;
    ctx.fillText("Paused", this.width / 2, this.height / 2);
  }

  renderGameOverScreen() {
    const ctx = this.getCtx();
    this.setOverlayTextStyles();
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1.0;
    ctx.fillText(
      `Game Over`,
      this.width / 2,
      this.height / 2 - this.gridSize * 2
    );
    ctx.fillText(
      `Score ${this.score}`,
      this.width / 2,
      this.height / 2 - this.gridSize
    );
    ctx.fillText(
      `Press Enter to`,
      this.width / 2,
      this.height / 2 + this.gridSize
    );
    ctx.fillText(
      `Start a New Game`,
      this.width / 2,
      this.height / 2 + this.gridSize * 2
    );
  }

  setDebugData(debugData: any) {
    this.debugData = {
      ...this.debugData,
      ...debugData,
    };
  }

  renderDebugScreen(timestamp?: number) {
    const debugText = [];

    debugText.push(`Mouse: ${this.debugData.x}, ${this.debugData.y}`);
    if (timestamp) {
      const frameLengthMs = timestamp - this.debugData.lastTimestamp;
      debugText.push(`FPS: ${Math.floor(1000 / frameLengthMs)}`);
      this.debugData.lastTimestamp = timestamp;
    }
    debugText.push(`Game count: ${this.debugData.gameCount}`);

    for (let index = 0; index < debugText.length; index++) {
      this.ctx?.fillText(
        `${debugText[index]}`,
        this.width - this.gridSize,
        this.height - this.gridSize * (index + 1)
      );
    }
  }

  renderScoreScreen() {
    const ctx = this.getCtx();
    this.setDefaultTextStyles();
    ctx.fillText(`${this.score}`, this.width - this.gridSize, this.gridSize);
  }

  clear() {
    const ctx = this.getCtx();
    ctx.clearRect(0, 0, this.width, this.height);
  }

  draw(time?: number, paused?: boolean) {
    this.clear();

    if (this.gameOver) {
      this.renderGameOverScreen();
      return;
    }

    if (paused) {
      this.renderPauseScreen();
      return;
    }

    if (this.debug) {
      this.renderDebugScreen(time);
    }

    this.renderScoreScreen();
  }
}
