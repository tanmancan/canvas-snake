import { Drawable } from "./types/drawable";
import { EventTypes } from "./types/constants";

const HIGH_SCORE_KEY = "canvas-snake-hs";

const OVERLAY_COLOR = "black";
const OVERLAY_TEXT_COLOR = "white";
const OVERLAY_TRANSPARENCY = 0.75;

enum OptionTypes {
  DEBUG = "DEBUG",
}

interface OptionsBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GameOptions {
  label: string;
  state: boolean;
  type: OptionTypes;
  bounds?: OptionsBounds;
  path?: Path2D;
}

export class Ui implements Drawable {
  canvas?: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  width: number;
  height: number;
  timestamp?: number;
  gridSize: number;

  private score: number = 0;
  private highScore: number = 0;
  private gameOver: boolean = false;

  private debugData = {
    x: 0,
    y: 0,
    lastTimestamp: 0,
    gameCount: 1,
  };

  private options: GameOptions[];

  private boxChecked = new Path2D();

  constructor(width: number, height: number, gridSize: number) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.options = [
      {
        label: "Show Debug Info",
        type: OptionTypes.DEBUG,
        state: false,
      },
    ];
    this.setUp();
  }

  setUp() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas?.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = "3";

    this.canvas.addEventListener("mousemove", this);
    this.canvas.addEventListener("mousedown", this);
    this.setDefaultTextStyles();
    this.preRenderOptions();

    this.highScore = window.localStorage.getItem(HIGH_SCORE_KEY)
      ? Number(window.localStorage.getItem(HIGH_SCORE_KEY))
      : 0;
    this.draw();
  }

  tearDown() {
    this.canvas?.removeEventListener("mousemove", this);
    this.canvas?.removeEventListener("mousedown", this);
    this.canvas?.remove();
    this.canvas = null;
    this.ctx = null;
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case EventTypes.MOUSEMOVE:
        this.handleMouseMove(e as MouseEvent);
        this.handleOptionHover(e as MouseEvent);
        break;
      case EventTypes.MOUSEDOWN:
        this.handleOptionClick(e as MouseEvent);
        break;
    }
  }

  handleMouseMove(e: MouseEvent) {
    this.debugData.x = e.offsetX;
    this.debugData.y = e.offsetY;
  }

  handleOptionClick(e: MouseEvent) {
    this.options.forEach((option) => {
      const inPath = this.optionIsPointInPath(e, option);
      if (inPath) {
        option.state = !option.state;
      }
    });
  }

  handleOptionHover(e: MouseEvent) {
    this.options.forEach((option) => {
      const inPath = this.optionIsPointInPath(e, option);
      if (this.canvas) {
        if (inPath) {
          this.canvas.style.cursor = "pointer";
        } else {
          this.canvas.style.cursor = "default";
        }
      }
    });
  }

  optionIsPointInPath(e: MouseEvent, option: GameOptions): boolean {
    const ctx = this.getCtx();
    let inPath = false;
    if (option.path && this.canvas) {
      const { clientWidth, clientHeight } = this.canvas;
      const widthModifier = this.width / clientWidth;
      const heightModifier = this.height / clientHeight;
      const adjustedX = e.offsetX * widthModifier;
      const adjustedY = e.offsetY * heightModifier;

      inPath = ctx.isPointInPath(option.path, adjustedX, adjustedY);
    }

    return inPath;
  }

  getCanvas(): HTMLCanvasElement {
    return (this.canvas as unknown) as HTMLCanvasElement;
  }

  getCtx(): CanvasRenderingContext2D {
    return (this.ctx as unknown) as CanvasRenderingContext2D;
  }

  setScore(score: number) {
    this.score = score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      window.localStorage.setItem(HIGH_SCORE_KEY, `${this.highScore}`);
    }
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
    ctx.fillStyle = OVERLAY_TEXT_COLOR;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }

  getOptionValue(key: OptionTypes) {
    const option = this.options.filter((opt) => opt.type === key);
    return option[0].state;
  }

  preRenderOptions() {
    const ctx = this.getCtx();
    const originX = this.width / 2;
    const originY = this.height / 2 - this.gridSize;

    this.options.forEach((option, idx) => {
      const measure = ctx.measureText(option.label);
      option.bounds = {
        x: originX - measure.width / 2,
        y: originY + idx * this.gridSize,
        width: measure.width,
        height: this.gridSize,
      };
      const hitBox = new Path2D();
      hitBox.rect(
        option.bounds.x,
        option.bounds.y,
        option.bounds.width,
        option.bounds.height
      );
      const checkBox = new Path2D(hitBox);
      checkBox.rect(
        option.bounds.x - this.gridSize * 1.5,
        option.bounds.y,
        this.gridSize,
        this.gridSize
      );
      option.path = checkBox;
    });
  }

  renderOptions() {
    const ctx = this.getCtx();
    this.options.forEach((option) => {
      ctx.stroke(this.boxChecked);
      if (option.path) ctx.fill(option.path);
      if (option.bounds) {
        const { x, y, width, height } = option.bounds;

        ctx.clearRect(x, y, width, height);
        ctx.clearRect(
          x - this.gridSize * 1.5 + 5,
          y + 5,
          this.gridSize - 10,
          this.gridSize - 10
        );
        ctx.globalAlpha = OVERLAY_TRANSPARENCY;
        ctx.fillStyle = OVERLAY_COLOR;
        ctx.fillRect(x, y, width, height);
        ctx.fillRect(
          x - this.gridSize * 1.5 + 5,
          y + 5,
          this.gridSize - 10,
          this.gridSize - 10
        );
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = OVERLAY_TEXT_COLOR;

        if (option.state) {
          ctx.fillStyle = "green";
          ctx.fillRect(
            x - this.gridSize * 1.5 + 5,
            y + 5,
            this.gridSize - 10,
            this.gridSize - 10
          );
          ctx.fillStyle = OVERLAY_TEXT_COLOR;
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(option.label, x + width / 2, y + this.gridSize / 2);
      }
    });

    this.setDefaultTextStyles();
  }

  renderOverlayBackground() {
    const ctx = this.getCtx();
    ctx.globalAlpha = OVERLAY_TRANSPARENCY;
    ctx.fillStyle = OVERLAY_COLOR;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1.0;
  }

  renderPauseScreen() {
    const ctx = this.getCtx();

    this.renderOverlayBackground();
    this.setOverlayTextStyles();

    ctx.fillText("Paused", this.width / 2, this.height / 2 - this.gridSize * 4);

    this.renderOptions();
  }

  renderGameOverScreen() {
    const ctx = this.getCtx();
    this.renderOverlayBackground();
    this.setOverlayTextStyles();
    ctx.fillText(
      `Game Over`,
      this.width / 2,
      this.height / 2 - this.gridSize * 4
    );
    ctx.fillText(
      `Score ${this.score}`,
      this.width / 2,
      this.height / 2 - this.gridSize * 2
    );
    ctx.fillText(
      `High score ${this.highScore}`,
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
    ctx.fillText(
      `Game no. ${this.debugData.gameCount}`,
      this.width / 2,
      this.height / 2 + this.gridSize * 4
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

    const debug = this.getOptionValue(OptionTypes.DEBUG);
    if (debug) {
      this.renderDebugScreen(time);
    }

    if (this.gameOver) {
      this.renderGameOverScreen();
      return;
    }

    if (paused) {
      this.renderPauseScreen();
      return;
    }

    this.renderScoreScreen();
  }
}
