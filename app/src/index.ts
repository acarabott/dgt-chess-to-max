import { createUI, showUnsupportedUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTPollInterval_ms, kMaxMiraChannel } from "./constants";
import { setupBoard } from "./setupBoard";
import type { StartAction } from "./api";
import { setupKeyboard } from "./setupKeyboard";
import { Chess } from "chess.js";
import { isWebSerialSupport } from "../lib/createSerialPort";

/*
## Essential
TODO web server startup
TODO deploy to website
TODO run from node
TODO compile with bun/deno

## Polish
TODO show turn on screen
TODO make UI nice - chess UI library?

## Nice to have
TODO parseBoardMessage could take the current PGN and initialize the game from that, would mean that FEN would have the correct turns
TODO write tests
TODO edge case: making illegal move by not moving anything
TODO show error if board is not in correct initial position?
TODO button to simulate game
TODO return error codes, not messages, ui should own messages

*/

const main = () => {
    if (!isWebSerialSupport()) {
        showUnsupportedUI();
        return;
    }

    const game = new Chess();

    const max = setupMax(kMaxMiraChannel);

    const moveKeyPressedSignal = setupKeyboard();

    const startAction: StartAction = async () => {
        const handleError = (message: string) => {
            ui.addError(message);
            max.sendMessage({
                boardAscii: "",
                boardEncoded: new Uint8Array(),
                boardFen: "",
                gameAscii: "",
                gameFen: "",
                gameFullPgn: "",
                isGameLegal: false,
                message,
                newMovePgn: "",
                ok: false,
            });
        };

        const dgtBoard = await setupBoard(game, false, kDGTPollInterval_ms, moveKeyPressedSignal);
        if (dgtBoard instanceof Error) {
            handleError(dgtBoard.message);
            return;
        }

        dgtBoard.boardSignal.listen((message) => {
            ui.boardListener(message);
            max.sendMessage(message);
        });

        dgtBoard.disconnectSignal.listen(() => {
            handleError("Board disconnected. Reconnect it!");
        });

        ui.hideStartButton();
    };

    const ui = createUI(startAction);
    max.connectionStatusSignal.listen(ui.maxConnectionListener);

    document.body.appendChild(ui.el);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        main();
    });
} else {
    main();
}
