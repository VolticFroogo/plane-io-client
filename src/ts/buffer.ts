import { Vector2 } from "./vector";

export class State {
    position: Vector2;
    velocity: Vector2;
    rotation: number;

    constructor(position: Vector2, velocity: Vector2, rotation: number) {
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
    }

    clone(): State {
        return new State(this.position.clone(), this.velocity.clone(), this.rotation);
    }
}

const BufferBuildThreshold   = 3;
const BufferOptimalSize      = 5;
const BufferDepleteThreshold = 7;
const BufferBuildFrequency   = 5;

export class StateBuffer {
    states: State[];
    building: boolean = false;

    constructor(states: State[]) {
        this.states = states;
    }

    push(state: State) {
        this.states.push(state);

        if (this.states.length > BufferDepleteThreshold)
            this.states.shift();
    }

    step(tick: number): boolean {
        if (this.states.length <= 2)
            return false;
        
        if (this.states.length < BufferBuildThreshold)
            this.building = true;
        
        if (this.building) {
            if (this.states.length >= BufferOptimalSize) {
                this.building = false;
            } else if ((tick%BufferBuildFrequency) === 0) {
                return false;
            }
        }

        this.states.shift();
        return true;
    }
}