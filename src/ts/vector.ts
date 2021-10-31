import { lerp } from "./helpers";

const w2sScale = 10;

export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    w2s() {
        return new Vector2(this.x * w2sScale, this.y * -w2sScale);
    }

    lerp(other: Vector2, t: number) {
        return new Vector2(
            lerp(this.x, other.x, t),
            lerp(this.y, other.y, t)
        );
    }

    euclidean() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
}