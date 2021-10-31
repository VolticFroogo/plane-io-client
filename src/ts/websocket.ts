import { EntityType } from "./entity";
import { Player } from "./player";
import { getWorld } from "./world";

enum MessageType {
    Ping,
    Update,
    Instantiate,
}

let ws: WebSocket;
let queuedPackets: ArrayBuffer[] = [];

export function initWS() {
    ws = new WebSocket(`ws://${window.location.hostname}:8080/ws`);
    ws.binaryType = "arraybuffer";

    ws.onopen = (event) => {
        console.log("Opened!");
    };

    ws.onmessage = (event) => {
        let dataView = new DataView(event.data);
        let offset = 0;
        let prevOffset = -1;

        while (offset < dataView.buffer.byteLength) {
            if (offset === prevOffset) {
                console.log("Offset didn't increment in following message");
                console.log(event);
                return;
            }
            
            prevOffset = offset;

            let messageType = dataView.getUint8(offset);
            switch (messageType) {
                case MessageType.Ping:
                    break;

                case MessageType.Update:
                    offset = handleMessageUpdate(dataView, offset);
                    break;

                case MessageType.Instantiate:
                    offset = handleMessageInstantiate(dataView, offset);
                    break;
            }
        }
    };
}

function handleMessageUpdate(dataView: DataView, offset: number): number {
    let id = dataView.getUint32(offset+1);

    return getWorld().entities.get(id)?.handleUpdate(dataView, offset) as number;
}

function handleMessageInstantiate(dataView: DataView, offset: number): number {
    let entityType = dataView.getUint8(offset+1);
    let id = dataView.getUint32(offset+2);

    console.log(`Instantiated ID ${id}`);

    switch (entityType) {
        case EntityType.Player:
            return Player.instantiate(id, dataView, offset);
        
        default:
            return 5;
    }
}

export function sendPackets() {
    if (ws.readyState !== WebSocket.OPEN)
        return;
        
    let size = 0;
    queuedPackets.forEach((arrayBuffer) => size += arrayBuffer.byteLength);

    let concatBuffer = new ArrayBuffer(size);
    let uint8Array = new Uint8Array(concatBuffer);

    let offset = 0;
    queuedPackets.forEach((arrayBuffer) => {
        uint8Array.set(new Uint8Array(arrayBuffer), offset);
        offset += arrayBuffer.byteLength;
    });

    ws.send(concatBuffer);

    queuedPackets = [];
}

export function queueUpdatePacket(player: Player) {
    if (ws.readyState !== WebSocket.OPEN)
        return;

    let offset = 0;
    let arrayBuffer = new ArrayBuffer(14);
    let dataView = new DataView(arrayBuffer);
    
    // Message type.
    dataView.setUint8(offset, MessageType.Update);
    offset += 1;

    // Position X.
    dataView.setFloat32(offset, player.stateBuffer.states[1].position.x);
    offset += 4;

    // Position Y.
    dataView.setFloat32(offset, player.stateBuffer.states[1].position.y);
    offset += 4;

    // Rotation.
    dataView.setFloat32(offset, player.stateBuffer.states[1].rotation);
    offset += 4;

    // Movement keys.
    dataView.setUint8(offset, player.movementKeysBuffer[1]);
    offset += 1;

    queuedPackets.push(arrayBuffer);
}