import { parseBoardMessage } from "./parseBoardMessage";
import { createPGN } from "./createPGN";
import { createBoardSimulator } from "./boardSimulator";
import { createUI } from "./ui";
import { kInitialAscii } from "./kInitialAscii";
import * as Xebra from "xebra.js";

const xebraState = new Xebra.State({
    hostname: "127.0.0.1",
    port: 8086,
});

const sendPGN = (pgn: string) => {
    if (xebraState.connectionState !== Xebra.CONNECTION_STATES.CONNECTED) {
        console.error("could not send pgn, not connected to Max patch");
        return;
    }
    xebraState.sendMessageToChannel("pgn", pgn);
};
xebraState.on("connection_changed", (connectionState) => {
    switch (connectionState) {
        case Xebra.CONNECTION_STATES.INIT: {
            console.log("init");
            break;
        }
        case Xebra.CONNECTION_STATES.CONNECTING: {
            console.log("conneting");
            break;
        }
        case Xebra.CONNECTION_STATES.CONNECTED: {
            console.log("connected");
            break;
        }
        case Xebra.CONNECTION_STATES.CONNECTION_FAIL: {
            console.log("CONNECTION_FAIL");
            break;
        }
        case Xebra.CONNECTION_STATES.RECONNECTING: {
            console.log("RECONNECTING");
            break;
        }
        case Xebra.CONNECTION_STATES.DISCONNECTED: {
            console.log("DISCONNECTED");
            break;
        }
        default: {
            throw new Error("default case");
        }
    }
});

xebraState.connect();

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
            sendPGN(pgn);
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
