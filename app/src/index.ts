import { createUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTPollInterval_ms, kMaxMiraChannel } from "./constants";
import { setupBoard } from "./setupBoard";

/*
TODO stop sending error so fast
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
*/

const main = () => {
    const max = setupMax(kMaxMiraChannel);

    const ui = createUI();
    max.connectionStatusSignal.listen(ui.maxConnectionListener);

    ui.setStartAction(async () => {
        const onDisconnect = () => {
            ui.addError("Board disconnected. Reconnect it!");
        };

        const dgtOrError = await setupBoard(false, kDGTPollInterval_ms, onDisconnect);
        if (dgtOrError instanceof Error) {
            ui.addError(dgtOrError.message);
            return;
        }

        ui.hideStartButton();
        dgtOrError.signal.listen((message) => {
            max.sendMessage(message);
        });
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
