import { Chess } from "chess.js";
import type { BoardMessage, DGT, LiveBoardState } from "./api";
import { Signal } from "./Signal";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "./createSerialPort";
import { handleBoardUpdate } from "./handleBoardUpdate";

export const setupBoard = async (
    simulateGame: boolean,
    pollInterval_ms: number,
    onDisconnect: () => void,
): Promise<DGT | Error> => {
    let shouldTick = true;

    const onSerialPortDisconnect = () => {
        shouldTick = false;
        onDisconnect();
    };

    const board = await (async () => {
        if (simulateGame) {
            return createBoardSimulator();
        }

        const serialPort = await createSerialPort(onSerialPortDisconnect);
        if (serialPort instanceof Error) {
            return serialPort;
        }
        return new Board(serialPort);
    })();

    if (board instanceof Error) {
        return board;
    }

    await board.reset();

    const boardSignal = new Signal<BoardMessage>();
    const game = new Chess();

    let previousLiveState: LiveBoardState = {
        ascii: "",
        isGameLegal: false,
    };

    const tick = () => {
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        void handleBoardUpdate(game, board, previousLiveState).then((update) => {
            if (update.message !== undefined) {
                boardSignal.notify(update.message);
            }
            if (update.liveState !== undefined) {
                previousLiveState = update.liveState;
            }
        });
    };

    tick();

    return {
        signal: boardSignal,
    };
};
