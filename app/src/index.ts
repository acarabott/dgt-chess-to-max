import { createUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTPollInterval_ms, kMaxErrorInterval_ms, kMaxMiraChannel } from "./constants";
import { setupBoard } from "./setupBoard";

/*
TODO should onError communicate with max?
TODO avoid repeated setups of max

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

    const ui = createUI();
    max.connectionStatusSignal.listen(ui.maxConnectionListener);

    ui.setStartAction(async () => {
        const onDisconnect = () => {
            const message = "Board disconnected. Reconnect it!";
            ui.addError(message);
            max.sendMessage({
                ok: false,
                message,
                pgn: "",
                fen: "",
                ascii: "",
                lastLegalAscii: "",
            });
        };

        const dgtOrError = await setupBoard(false, kDGTPollInterval_ms, onDisconnect);
        if (dgtOrError instanceof Error) {
            const message = dgtOrError.message;
            ui.addError(message);
            max.sendMessage({
                ok: false,
                message: "Error setting up board, check the Web App",
                pgn: "",
                fen: "",
                ascii: "",
                lastLegalAscii: "",
            });
            return;
        }

        ui.hideStartButton();

        {
            let previousErrorTimestamp_ms: number | undefined;
            dgtOrError.signal.listen((message) => {
                const now = Date.now();
                if (
                    previousErrorTimestamp_ms === undefined ||
                    now - previousErrorTimestamp_ms >= kMaxErrorInterval_ms
                ) {
                    max.sendMessage(message);
                    previousErrorTimestamp_ms = now;
                }
            });
        }

        dgtOrError.signal.listen(ui.boardListener);
    });

    document.body.appendChild(ui.el);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        main();
    });
} else {
    main();
}
