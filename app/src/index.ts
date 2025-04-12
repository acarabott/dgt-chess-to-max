import { createUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTPollInterval_ms, kMaxMiraChannel } from "./constants";
import { setupBoard } from "./setupBoard";
import type { StartAction } from "./api";

/*
TODO fix pgn error
TODO should onError communicate with max?

TODO keyboard handling
TODO error handling
TODO web server startup
TODO deploy to website
TODO convert to Node?
TODO make UI nice
TODO what format for lastLegalAscii? 
TODO button to simulate game
TODO allow sending parameters from Max
*/

const main = () => {
    const max = setupMax(kMaxMiraChannel);

    const startAction: StartAction = async () => {
        const onDisconnect = () => {
            const message = "Board disconnected. Reconnect it!";
            ui.addError(message);
            max.sendMessage({
                ok: false,
                message,
                pgn: "",
                fen: "",
                ascii: "",
                previousLegalAsciiPosition: "",
            });
        };

        const dgtBoard = await setupBoard(false, kDGTPollInterval_ms, onDisconnect);
        if (dgtBoard instanceof Error) {
            const message = dgtBoard.message;
            ui.addError(message);
            max.sendMessage({
                ok: false,
                message: "Error setting up board, check the Web App",
                pgn: "",
                fen: "",
                ascii: "",
                previousLegalAsciiPosition: "",
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
