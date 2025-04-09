import { parseBoardMessage } from "./parseBoardMessage";
import { createPGN } from "./createPGN";
import { createBoardSimulator } from "./boardSimulator";
import { sendPGN } from "./sendPGN";
import { createUI } from "./ui";
import { kInitialAscii } from "./kInitialAscii";

/* 
TODO sending messages to MAX
TODO error handling in `createPGN`
*/

const boardSimulator = createBoardSimulator();

const pollInterval_ms = 100;

const main = () => {
    const ui = createUI();
    document.body.appendChild(ui.el);

    const fens: string[] = [];

    const tick = async () => {
        setTimeout(() => void tick(), pollInterval_ms);

        let boardState: Uint8Array;
        try {
            boardState = await boardSimulator.getBoardState();
        } catch (error: unknown) {
            // eslint-disable-next-line no-console
            console.error("Error getting position from board:", error);
            return;
        }

        const { ascii, fen } = parseBoardMessage(boardState);
        ui.updateBoard(ascii, "");
        if (ascii === kInitialAscii) {
            // checking ASCII here, not FEN because FEN can have some slight variations
            // depending on how it was generated (from initial board state or iniitial Chess)
            return;
        }

        const previousFen = fens[fens.length - 1];
        if (fen === previousFen) {
            return;
        }

        fens.push(fen);
        const pgn = createPGN(fens);
        if (pgn.length === 0) {
            return;
        }

        try {
            await sendPGN(pgn);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error sending PGN:", error);
        }
    };

    void tick();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        main();
    });
} else {
    main();
}
