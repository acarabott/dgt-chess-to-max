import type { Color } from "chess.js";
import { Chess } from "chess.js";
import type { BoardMessage, DGT, DGTBoard, LiveBoardState } from "./api";
import { Signal } from "./Signal";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "./createSerialPort";
import { handleBoardUpdate } from "./handleBoardUpdate";

// Important that this has a "null-like" initial state.
// If it is initialized to the chess starting position,
// the initial board state will never be sent, as it
// is only sent if the live board state is different
// from the previous board state
const kInitialLiveBoardState: LiveBoardState = {
    boardEncoded: new Uint8Array(0),
    isGameLegal: false,
} as const;

export const setupBoard = async (
    simulateGame: boolean,
    pollInterval_ms: number,
    moveKeyPressedSignal: Signal<Color>,
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

    const boardSignal = new Signal<BoardMessage>();
    const game = new Chess();

    let previousLiveState = kInitialLiveBoardState;
    let shouldCheckMove = false;
    moveKeyPressedSignal.listen((color) => {
        if (color === game.turn()) {
            shouldCheckMove = true;
        }
    });

    const tick = () => {
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        void handleBoardUpdate(game, board, shouldCheckMove, previousLiveState).then((update) => {
            if (update === undefined) {
                return;
            }

            if (update.message !== undefined) {
                if (update.message.newMovePgn !== "" || !update.message.isGameLegal) {
                    shouldCheckMove = false;
                }
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
