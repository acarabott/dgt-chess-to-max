import { Chess } from "chess.js";

export const kInitialAscii = (() => {
    const game = new Chess();
    const ascii = game.ascii();
    return ascii;
})();
