import { createUI } from "./ui";
import { setupMax } from "./max-communication";
import type { AppContext } from "./api";
import { setupBoard } from "./setupBoard";

/*
TODO buffering values until message is complete (or use DGT library)
TODO error handling in `createPGN`
*/

const main = () => {
    const context: AppContext = {
        max: setupMax(),
        dgt: setupBoard(true),
    };
    const ui = createUI(context);
    document.body.appendChild(ui.el);

    context.dgt.pgnSignal.listen((pgn) => {
        context.max.sendMessage({
            pgn,
            timestamp: Date.now(),
        });
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        main();
    });
} else {
    main();
}
