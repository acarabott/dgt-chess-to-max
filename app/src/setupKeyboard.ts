import type { Color } from "chess.js";
import { Signal } from "../lib/Signal";

export const setupKeyboard = () => {
    const moveKeySignal = new Signal<Color>();

    window.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "KeyW":
                moveKeySignal.notify("w");
                break;

            case "KeyB":
                moveKeySignal.notify("b");
                break;

            default:
                break;
        }
    });

    return moveKeySignal;
};
