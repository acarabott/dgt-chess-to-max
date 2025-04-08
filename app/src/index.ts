import { parseBoardMessage } from "./parseBoardMessage";
import { createPGN } from "./createPGN";
import { createBoardSimulator } from "./boardSimulator";
import { sendPGN } from "./sendPGN";
import { createUI } from "./ui";
import { kInitialAscii } from "./kInitialAscii";

/* 
TODO might need to handle messages from board coming in fragmented
TODO buffering values until message is complete (or use DGT library)
TODO sending messages to MAX
TODO error handling in `createPGN`
*/

const boardSimulator = createBoardSimulator();

const pollInterval_ms = 100;

const main = () => {
    const ui = createUI();
    document.body.appendChild(ui.el);

    const fens: string[] = [];

    setInterval(() => {
        boardSimulator
            .getPosition()
            .then((position) => {
                const { ascii, fen } = parseBoardMessage(position);
                ui.updateBoard(ascii, "");
                if (ascii === kInitialAscii) {
                    // checking ASCII here, not FEN because FEN can have some slight variations
                    // depending on how it was generated (from initial board state or iniitial Chess)
                    return;
                }

                const previousFen = fens[fens.length - 1];
                if (fen !== previousFen) {
                    fens.push(fen);
                }

                const pgn = createPGN(fens);
                if (pgn.length > 0) {
                    sendPGN(pgn).catch((error: unknown) => {
                        // eslint-disable-next-line no-console
                        console.error("Error sending PGN:", error);
                    });
                }
            })
            .catch((error: unknown) => {
                // eslint-disable-next-line no-console
                console.error("Error getting position from board:", error);
            });
    }, pollInterval_ms);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        main();
    });
} else {
    main();
}
