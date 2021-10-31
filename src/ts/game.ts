import { queueUpdatePacket, sendPackets } from "./websocket";
import { getWorld } from "./world";

let stepTime = Date.now();
const tickrate = 1000/60;
let tick = 0;

function step() {
    stepTime += tickrate;
    tick++;

    getWorld().player.step(tick);
    getWorld().entities.forEach((entity) => entity.step(tick));

    queueUpdatePacket(getWorld().player);
    sendPackets();
}

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

export function render() {
    while (Date.now() > stepTime + tickrate) {
        step();
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let delta = (Date.now() - stepTime) / tickrate;

    getWorld().entities.forEach((entity) => entity.render(ctx, delta));
    getWorld().player.render(ctx, delta);

    requestAnimationFrame(render);
}