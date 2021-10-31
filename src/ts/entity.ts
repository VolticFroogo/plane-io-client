import { State, StateBuffer } from "./buffer";

export enum EntityType {
    Player
}

export class Entity {
    id: number;
    stateBuffer: StateBuffer;
    radius: number;
    updatedFrame: boolean = true;

    constructor(id: number, stateBuffer: StateBuffer, radius: number) {
        this.id = id;
        this.stateBuffer = stateBuffer;
        this.radius = radius;
    }
    
    step(tick: number) {}

    render(ctx: CanvasRenderingContext2D, delta: number) {}

    handleUpdate(dataView: DataView, offset: number): number {
        return 0;
    }
}