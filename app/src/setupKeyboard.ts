import type { Color } from "chess.js";
import type { Signal } from "../lib/Signal";

export const setupKeyboard = (moveInputSignal: Signal<Color>) => {
    window.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "KeyW":
                moveInputSignal.notify("w");
                break;

            case "KeyB":
                moveInputSignal.notify("b");
                break;

            default:
                break;
        }
    });
};
