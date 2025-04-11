import { Board } from "../dgt/Board";
import type { DGT } from "./api";
import { createBoardSimulator } from "./boardSimulator";
import { createPGN } from "./createPGN";
import { kInitialAscii } from "./kInitialAscii";
import { parseBoardMessage } from "./parseBoardMessage";
import { Signal } from "./Signal";

export const setupBoard = async (serialPort: SerialPort | undefined): Promise<DGT> => {
    const pollInterval_ms = 100;

    const board = serialPort === undefined ? createBoardSimulator() : new Board(serialPort);

    await board.reset();

    const asciiSignal = new Signal<string>();
    const pgnSignal = new Signal<string>();

    const fens: string[] = [];

    const tick = async () => {
        setTimeout(() => void tick(), pollInterval_ms);

        let boardState: Uint8Array | undefined;
        try {
            boardState = await board.getBoardState();
            if (boardState === undefined) {
                return;
            }
        } catch (error: unknown) {
            // eslint-disable-next-line no-console
            console.error("Error getting position from board:", error);
            return;
        }

        const { ascii, fen } = parseBoardMessage(boardState);
        if (ascii === kInitialAscii) {
            // checking ASCII here, not FEN because FEN can have some slight variations
            // depending on how it was generated (from initial board state or iniitial Chess)
            return;
        }

        const previousFen = fens[fens.length - 1];
        if (fen === previousFen) {
            return;
        }

        asciiSignal.notify(ascii);

        fens.push(fen);
        const pgn = createPGN(fens);
        if (pgn.length === 0) {
            return;
        }

        try {
            pgnSignal.notify(pgn);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error sending PGN:", error);
        }
    };

    void tick();

    return {
        asciiSignal,
        pgnSignal,
    };
};
