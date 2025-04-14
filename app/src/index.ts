import { createUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTPollInterval_ms, kMaxMiraChannel } from "./constants";
import { setupBoard } from "./setupBoard";
import type { StartAction } from "./api";
import { setupKeyboard } from "./setupKeyboard";

/*
TODO edge case: making illegal move by not moving anything
TODO show error if board is not in correct initial position?
TODO show turn on screen
TODO fix initial flash of illegal state (first move)
TODO start game button?
TODO web server startup
TODO deploy to website
TODO convert to Node?
TODO make UI nice - chess UI library?
TODO remove kInitialAscii?
TODO button to simulate game
TODO return error codes, not messages, ui should own messages
TODO write tests
TODO clean up file structure

*/

const main = () => {
    const max = setupMax(kMaxMiraChannel);

    const moveKeyPressedSignal = setupKeyboard();

    const startAction: StartAction = async () => {
        const handleError = (message: string) => {
            ui.addError(message);
            max.sendMessage({
                ok: false,
                isGameLegal: false,
                message,
                fullPgn: "",
                fen: "",
                boardAscii: "",
                boardEncoded: new Uint8Array(),
                gameAscii: "",
                newMovePgn: "",
            });
        };

        const dgtBoard = await setupBoard(false, kDGTPollInterval_ms, moveKeyPressedSignal);
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
