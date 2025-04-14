import { Chess } from "chess.js";
import type { BoardMessage, DGT, DGTBoard, LiveBoardState } from "./api";
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

    let board: DGTBoard;
    {
        if (simulateGame) {
            board = createBoardSimulator();
        } else {
            const onSerialPortDisconnect = () => {
                shouldTick = false;
                onDisconnect();
            };
            const serialPortOrError = await createSerialPort(onSerialPortDisconnect);
            if (serialPortOrError instanceof Error) {
                return serialPortOrError;
            }
            board = new Board(serialPortOrError);
        }
    }

    await board.reset();

    const signal = new Signal<BoardMessage>();
    const game = new Chess();

    let previousLiveState: LiveBoardState = {
        boardEncoded: new Uint8Array(0),
        isGameLegal: false,
    };

    const tick = () => {
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        void handleBoardUpdate(game, board, previousLiveState).then((update) => {
            if (update.message !== undefined) {
                signal.notify(update.message);
            }
            if (update.liveState !== undefined) {
                previousLiveState = update.liveState;
            }
        });
    };

    tick();

    return {
        signal,
    };
};
