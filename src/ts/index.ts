import { render } from "./game";
import { initWS } from "./websocket";
import { initWorld } from "./world";

initWS();
initWorld();
render();