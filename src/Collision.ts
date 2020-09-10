/**
 * Represents a position in the canvas grid: x, y
 */
export type CollisionPosition = [number, number];

/**
 * A callback that is called when a collision has occurred. Should be
 * passed the source property of the Collision object being checked.
 */
export type CollisionCallback = (source: string) => any;

/**
 * Interface describing a collision between two objects.
 * Objects are represented by a list of positions in the canvas grid.
 * If any of the positions in two bounds intersect, then a collision will occur,
 * and a callback will be called for each object.
 */
export interface CollisionBounds {
  /**
   * Represents a list of canvas grid position, by their
   * concatenated x and y values.
   * Example: [10, 25] = "1025"
   */
  bounds: string[];
  /**
   * Callback that will be called if a collision has occurred
   * with another Collision object.
   */
  callback: CollisionCallback;
  /**
   * Add a grid position as a bound. Adds to any existing bounds.
   */
  addBounds: (bounds: CollisionPosition[]) => void;
  /**
   * Add a grid position as a bound. Replaces any existing bounds.
   */
  replaceBounds: (bounds: CollisionPosition[]) => void;
  /**
   * Get a list of bounds for this collision object.
   */
  getBounds: () => string[];
  /**
   * Check collision against another collision object.
   * If a collision occurs, this should call the callback function
   * for both collision object.
   */
  checkBounds: (sourceCollision: Collision[]) => void;
}

export interface HasCollision {
  collision: Collision | null;
  setCollision: (collision: Collision) => void;
  getCollision: () => Collision;
}

export class Collision implements CollisionBounds {
  bounds: string[] = [];
  callback: CollisionCallback;
  source: string;

  constructor(callback: CollisionCallback, source: string) {
    this.callback = callback;
    this.source = source;
  }

  addBounds(bounds: CollisionPosition[]) {
    const joinedBounds = bounds.map(([x, y]) => "" + x + y);
    const uniqueBounds = new Set([...this.bounds, ...joinedBounds]);
    this.bounds = Array.from(uniqueBounds);
  }

  replaceBounds(bounds: CollisionPosition[]) {
    this.bounds = [];
    this.addBounds(bounds);
  }

  getBounds() {
    return this.bounds;
  }

  checkBounds(sourceCollision: Collision[]) {
    let hasCollision;
    if (hasCollision) return;
    sourceCollision.forEach((collision) => {
      const sourceBounds = collision.getBounds();
      hasCollision = sourceBounds.some(
        (bound) => this.bounds.indexOf(bound) !== -1
      );
      if (hasCollision) {
        collision.callback(this.source);
        this.callback(collision.source);
        return;
      }
      hasCollision = false;
    });
  }
}
