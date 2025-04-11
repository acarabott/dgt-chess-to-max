import { parseBoardMessage } from "./parseBoardMessage";
import { createPGN } from "./createPGN";
import { createBoardSimulator } from "./boardSimulator";
import { createUI } from "./ui";
import { kInitialAscii } from "./kInitialAscii";
import { setupCommunication } from "./communication";
import type { AppContext } from "./api";

/*
TODO buffering values until message is complete (or use DGT library)
TODO error handling in `createPGN`
*/

const board = createBoardSimulator();
const pollInterval_ms = 100;

const communication = setupCommunication();

const main = () => {
    const context: AppContext = {
        max: {
            connectionStatusSignal: communication.statusSignal,
            getConnectionStatus: communication.getStatus,
        },
    };
    const ui = createUI(context);
    document.body.appendChild(ui.el);

    const fens: string[] = [];

    const tick = async () => {
        setTimeout(() => void tick(), pollInterval_ms);

        let boardState: Uint8Array;
        try {
            boardState = await board.getBoardState();
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
            communication.sendPGN(pgn);
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
