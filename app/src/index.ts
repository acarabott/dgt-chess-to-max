import { createChessUI, createSetupUI } from "./ui";
import { setupMax } from "./max-communication";
import type { AppContext, DGTBoard, ErrorHandler } from "./api";
import { setupBoard } from "./setupBoard";
import { kMaxMiraChannel, kDGTPollInterval_ms } from "./constants";
import { createSerialPort } from "./createSerialPort";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";

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

const setupApp = async (simulateGame: boolean, onError: ErrorHandler) => {
    let board: DGTBoard;

    if (!simulateGame) {
        const serialPort = await createSerialPort(onError);
        if (serialPort === undefined) {
            onError("failed to create serial port");
            return;
        }
        board = new Board(serialPort);
    } else {
        board = createBoardSimulator();
    }

    const context: AppContext = {
        max: setupMax(kMaxMiraChannel),
        dgt: await setupBoard(board, kDGTPollInterval_ms),
    };

    context.dgt.signal.listen((message) => {
        context.max.sendMessage(message);
    });

    return context;
};

const main = () => {
    const setupUI = createSetupUI((onError) => {
        setupApp(false, onError)
            .then((context) => {
                if (context === undefined) {
                    onError("Failed to set up app");
                    return;
                }

                document.body.removeChild(setupUI.el);
                const chessUI = createChessUI(context);
                document.body.appendChild(chessUI.el);
            })
            .catch((reason: unknown) => {
                const reasonMessage =
                    reason instanceof Error ? reason.message : JSON.stringify(reason);
                onError(`Failed to set up app: ${reasonMessage}`);
            });
    });
    document.body.appendChild(setupUI.el);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
