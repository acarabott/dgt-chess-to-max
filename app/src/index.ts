import { parseBoardMessage } from "./parseBoardMessage";
import { createPGN } from "./createPGN";
import { createBoardSimulator } from "./boardSimulator";
import { sendPGN } from "./sendPGN";

/* 
TODO might need to handle messages from board coming in fragmented
TODO take moves one at a time
TODO buffering values until message is complete (or use DGT library)
TODO sending messages to MAX
TODO error handling in `createPGN`
*/

const boardSimulator = createBoardSimulator();

const pollInterval_ms = 100;

const main = () => {
    const fens: string[] = [];

    setInterval(() => {
        void (async () => {
            try {
                const position = await boardSimulator.getPosition();
                const fen = parseBoardMessage(position);
                const previousFen = fens[fens.length - 1];
                if (previousFen === fen) {
                    return;
                }

                fens.push(fen);
                const pgn = createPGN(fens);
                void sendPGN(pgn);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
        })();
    }, pollInterval_ms);
};

main();
