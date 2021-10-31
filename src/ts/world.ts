import { State, StateBuffer } from "./buffer";
import { Entity } from "./entity";
import { Player } from "./player";
import { Vector2 } from "./vector";

class World {
    player: Player;
    entities = new Map<number, Entity>();

    constructor(player: Player) {
        this.player = player;
    }
}

let world: World;
export function initWorld() {
    world = new World(new Player(0, new StateBuffer([
        new State(new Vector2(10, 10), new Vector2(0, 0), 0),
        new State(new Vector2(10, 10), new Vector2(0, 0), 0)
    ]), 0));
    world.player.me = true;
    world.player.stateBuffer.push(new State(new Vector2(10, 10), new Vector2(0, 0), 0));
    world.player.movementKeysBuffer.push(0);
}

export function getWorld() {
    return world;
}