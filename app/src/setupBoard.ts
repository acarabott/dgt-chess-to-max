import type { Color, Chess } from "chess.js";
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
    game: Chess,
    simulateBoard: boolean,
    pollInterval_ms: number,
    moveKeyPressedSignal: Signal<Color>,
): Promise<DGT | Error> => {
    const disconnectSignal = new Signal<void>();
    const boardSignal = new Signal<BoardMessage>();

    let shouldTick = true;

    let board: DGTBoard;
    {
        if (simulateBoard) {
            board = createBoardSimulator();
        } else {
            const onSerialPortDisconnect = () => {
                shouldTick = false;
                disconnectSignal.notify();
            };
            const serialPortOrError = await createSerialPort(onSerialPortDisconnect);
            if (serialPortOrError instanceof Error) {
                return serialPortOrError;
            }
            board = new Board(serialPortOrError);
        }
    }

    await board.reset();

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

        void handleBoardUpdate(game.fen(), board, shouldCheckMove, previousLiveState).then(
            (update) => {
                if (update === undefined) {
                    return;
                }

                if (update.result !== undefined) {
                    if (update.result.move !== undefined) {
                        game.move(update.result.move);
                        shouldCheckMove = false;
                    }

                    if (!update.result.isGameLegal) {
                        shouldCheckMove = false;
                    }
                    const message: BoardMessage = {
                        ok: update.result.ok,
                        newMovePgn: update.result.move ?? "",
                        message: update.result.message,
                        isGameLegal: update.result.isGameLegal,
                        boardAscii: update.result.boardAscii,
                        boardEncoded: update.result.boardEncoded,
                        fullPgn: game.pgn(),
                        gameAscii: game.ascii(),
                        fen: game.fen(),
                    };
                    boardSignal.notify(message);
                }

                if (update.liveState !== undefined) {
                    previousLiveState = update.liveState;
                }
            },
        );
    };

    tick();

    return {
        boardSignal,
        disconnectSignal,
    };
};
