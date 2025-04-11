import { createChessUI, createSetupUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTFilter } from "./api";
import type { AppContext } from "./api";
import { setupBoard } from "./setupBoard";

/*
TODO buffering values until message is complete (or use DGT library)
TODO error handling in `createPGN`
TODO keyboard handling
TODO error handling
TODO web server startup
TODO deploy to website
TODO convert to Node?
TODO make UI nice
*/

const main = () => {
    const setupUI = createSetupUI(() => {
        void (async () => {
            let serialPort: SerialPort;
            try {
                serialPort = await navigator.serial.requestPort({ filters: [kDGTFilter] });
                serialPort.onconnect = (event) => {
                    console.log("connected:", event);
                };
                await serialPort.open({ baudRate: 9600 });
            } catch (error: unknown) {
                // eslint-disable-next-line no-console
                console.error(error);
                return;
            }

            document.body.removeChild(setupUI.el);
            const context: AppContext = {
                max: setupMax(),
                dgt: await setupBoard(serialPort),
            };

            context.dgt.pgnSignal.listen((pgn) => {
                context.max.sendMessage({
                    pgn,
                    timestamp: Date.now(),
                });
            });
            const chessUI = createChessUI(context);
            document.body.appendChild(chessUI.el);
        })();
    });
    document.body.appendChild(setupUI.el);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
