import { createUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTPollInterval_ms, kMaxMiraChannel } from "./constants";
import { setupBoard } from "./setupBoard";
import type { StartAction } from "./api";

/*
TODO separate signal for illegal moves

TODO start game button?
TODO keyboard handling
TODO web server startup
TODO deploy to website
TODO convert to Node?
TODO make UI nice
TODO what format for lastLegalAscii? 
TODO button to simulate game
TODO allow sending parameters from Max
TODO return error codes, not messages, ui should own messages
TODO compare board states by Uint8Array, not ascii
TODO write tests

*/

const main = () => {
    const max = setupMax(kMaxMiraChannel);

    const startAction: StartAction = async () => {
        const onDisconnect = () => {
            const message = "Board disconnected. Reconnect it!";
            ui.addError(message);
            max.sendMessage({
                ok: false,
                isGameLegal: false,
                message,
                pgn: "",
                fen: "",
                boardAscii: "",
                gameAscii: "",
            });
        };

        const dgtBoard = await setupBoard(false, kDGTPollInterval_ms, onDisconnect);
        if (dgtBoard instanceof Error) {
            const message = dgtBoard.message;
            ui.addError(message);
            max.sendMessage({
                ok: false,
                isGameLegal: false,
                message: "Error setting up board, check the Web App",
                pgn: "",
                fen: "",
                boardAscii: "",
                gameAscii: "",
            });
            return;
        }

        ui.hideStartButton();

        dgtBoard.signal.listen((message) => {
            ui.boardListener(message);
            max.sendMessage(message);
        });
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
