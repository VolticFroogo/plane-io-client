import { State, StateBuffer } from "./buffer";
import { Entity } from "./entity";
import { angleLerp, lerp } from "./helpers";
import { Vector2 } from "./vector";
import { getWorld } from "./world";

let pressedKeys = new Set();
window.onkeyup = (e) => pressedKeys.delete(e.code);
window.onkeydown = (e) => pressedKeys.add(e.code);

enum MovementKey {
    W = 1 << 0,
    A = 1 << 1,
    D = 1 << 2,
}

export class Player extends Entity {
    me: boolean = false;
    movementKeysBuffer: number[] = [];
    accel: number = 0.1;
    gravity: number = 0.04;
    throttleDrag: number = 0.9;
    stoppedDrag: number = 0.97;
    rotationSpeed: number = Math.PI / 30;
    rotationSpeedMin: number = this.rotationSpeed / 4;
    rotationMaxVel: number = 1.2;
    buffering: boolean = false;

    step(tick: number) {
        if (!this.me) {
            if (this.stateBuffer.step(tick))
                this.movementKeysBuffer.shift();
            
            return;
        }

        this.stateBuffer.states = [this.stateBuffer.states[1].clone(), this.stateBuffer.states[1].clone()];
        this.movementKeysBuffer[0] = this.movementKeysBuffer[1];

        // Set movement keys based on what is currently pressed.
        // This is used in actual movement and is stored as a uint8 to be sent to the server.
        this.movementKeysBuffer[1] =
              (pressedKeys.has("KeyW") ? MovementKey.W : 0)
            | (pressedKeys.has("KeyA") ? MovementKey.A : 0)
            | (pressedKeys.has("KeyD") ? MovementKey.D : 0);

        // Turn left.
        if ((this.movementKeysBuffer[1] & MovementKey.A) !== 0) {
            this.stateBuffer.states[1].rotation -= lerp(this.rotationSpeed, this.rotationSpeedMin, this.stateBuffer.states[1].velocity.euclidean()/this.rotationMaxVel);
            
            if (this.stateBuffer.states[1].rotation < 0)
                this.stateBuffer.states[1].rotation += Math.PI * 2;
            
            if (this.stateBuffer.states[1].rotation > Math.PI * 2)
                this.stateBuffer.states[1].rotation -= Math.PI * 2;
        }

        // Turn right.
        if ((this.movementKeysBuffer[1] & MovementKey.D) !== 0) {
            this.stateBuffer.states[1].rotation += lerp(this.rotationSpeed, this.rotationSpeedMin, this.stateBuffer.states[1].velocity.euclidean()/this.rotationMaxVel);
            
            if (this.stateBuffer.states[1].rotation < 0)
                this.stateBuffer.states[1].rotation += Math.PI * 2;
            
            if (this.stateBuffer.states[1].rotation > Math.PI * 2)
                this.stateBuffer.states[1].rotation -= Math.PI * 2;
        }

        // Throttle.
        if ((this.movementKeysBuffer[1] & MovementKey.W) !== 0) {
            this.stateBuffer.states[1].velocity.x += Math.sin(this.stateBuffer.states[1].rotation) * this.accel;
            this.stateBuffer.states[1].velocity.y += Math.cos(this.stateBuffer.states[1].rotation) * this.accel;

            // Apply throttle drag.
            this.stateBuffer.states[1].velocity.x *= this.throttleDrag;
            this.stateBuffer.states[1].velocity.y *= this.throttleDrag;
        } else {
            // Apply stopped drag.
            this.stateBuffer.states[1].velocity.x *= this.stoppedDrag;
            this.stateBuffer.states[1].velocity.y *= this.stoppedDrag;
        }

        // Gravity.
        this.stateBuffer.states[1].velocity.y -= this.gravity * Math.max(0, 1-Math.abs(this.stateBuffer.states[1].velocity.x));

        // Apply velocity.
        this.stateBuffer.states[1].position.x += this.stateBuffer.states[1].velocity.x;
        this.stateBuffer.states[1].position.y += this.stateBuffer.states[1].velocity.y;
    }

    render(ctx: CanvasRenderingContext2D, delta: number) {
        ctx.fillStyle = this.me ? "black" : "red";

        let rotation = angleLerp(this.stateBuffer.states[0].rotation, this.stateBuffer.states[1].rotation, delta);
        let position = this.stateBuffer.states[0].position.lerp(this.stateBuffer.states[1].position, delta);
        
        position = position.w2s();
        ctx.translate(position.x, position.y);
        ctx.rotate(rotation);

        ctx.fillRect(-15, -15, 30, 30);
        ctx.resetTransform();
    }

    static instantiate(id: number, dataView: DataView, offset: number): number {
        // Offset mtype+etype+id bytes.
        offset += 6;

        let x = dataView.getFloat32(offset);
        offset += 4;

        let y = dataView.getFloat32(offset);
        offset += 4;

        let rotation = dataView.getFloat32(offset);
        offset += 4;

        let movementKeys = dataView.getUint8(offset);
        offset += 1;

        let player = new Player(id, new StateBuffer([
            new State(new Vector2(x, y), new Vector2(0, 0), rotation),
            new State(new Vector2(x, y), new Vector2(0, 0), rotation)
        ]), 0);
        player.movementKeysBuffer.push(movementKeys);
        
        getWorld().entities.set(id, player);

        return offset;
    }

    handleUpdate(dataView: DataView, offset: number): number {
        // Offset mtype+id bytes.
        offset += 5;

        let x = dataView.getFloat32(offset);
        offset += 4;

        let y = dataView.getFloat32(offset);
        offset += 4;

        let rotation = dataView.getFloat32(offset);
        offset += 4;
        
        let movementKeys = dataView.getUint8(offset);
        offset += 1;

        this.stateBuffer.push(new State(new Vector2(x, y), new Vector2(0, 0), rotation));
        this.movementKeysBuffer.push(movementKeys);

        return offset;
    }
}