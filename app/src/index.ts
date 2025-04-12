import { createChessUI, createSetupUI } from "./ui";
import { setupMax } from "./max-communication";
import { kDGTFilter } from "./api";
import type { AppContext } from "./api";
import { setupBoard } from "./setupBoard";

/*
TODO stop sending error so fast
TODO keyboard handling
TODO error handling
TODO web server startup
TODO deploy to website
TODO convert to Node?
TODO make UI nice
TODO what format for lastLegalAscii? 
*/

const kDGTPollInterval_ms = 100;
const kDGTBaudRate = 9600;
const kMaxMiraChannel = "chess";

const main = () => {
    const setupUI = createSetupUI(() => {
        void (async () => {
            let serialPort: SerialPort;
            try {
                serialPort = await navigator.serial.requestPort({ filters: [kDGTFilter] });
                serialPort.onconnect = (_event) => {
                    // TODO
                };
                await serialPort.open({ baudRate: kDGTBaudRate });
            } catch (error: unknown) {
                // eslint-disable-next-line no-console
                console.error(error);
                return;
            }

            document.body.removeChild(setupUI.el);
            const context: AppContext = {
                max: setupMax(kMaxMiraChannel),
                dgt: await setupBoard(serialPort, kDGTPollInterval_ms),
            };

            context.dgt.signal.listen((message) => {
                context.max.sendMessage(message);
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
