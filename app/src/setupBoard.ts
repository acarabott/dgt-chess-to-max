import type { Color, Chess } from "chess.js";
import type { BoardMessage, BoardState, DGT, DGTBoard } from "./api";
import { Signal } from "./Signal";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "./createSerialPort";
import { handleBoardUpdate } from "./handleBoardUpdate";
import { parseBoardMessage } from "./parseBoardMessage";

export const setupBoard = async (
    game: Chess,
    simulateBoard: boolean,
    pollInterval_ms: number,
    moveKeyPressedSignal: Signal<Color>,
): Promise<DGT | Error> => {
    let shouldTick = true;
    let previousBoardEncoded = new Uint8Array();
    let shouldCheckMove = false;
    moveKeyPressedSignal.listen((color) => {
        if (color === game.turn()) {
            shouldCheckMove = true;
        }
    });

    const disconnectSignal = new Signal<void>();
    const boardSignal = new Signal<BoardMessage>();

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

    const tick = async () => {
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        let boardState: BoardState | undefined;
        let extraError = "";
        try {
            const boardData = await board.getBoardData();
            if (boardData !== undefined) {
                boardState = parseBoardMessage(boardData);
            }
        } catch (error: unknown) {
            extraError = error instanceof Error ? error.message : JSON.stringify(error);
        }

        if (boardState === undefined) {
            const boardMessage: BoardMessage = {
                ok: false,
                newMovePgn: "",
                message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${extraError}`,
                isGameLegal: false,
                boardAscii: "",
                boardEncoded: new Uint8Array(),
                fullPgn: game.pgn(),
                gameAscii: game.ascii(),
                fen: game.fen(),
            };
            boardSignal.notify(boardMessage);
            return undefined;
        }

        const update = handleBoardUpdate(
            game.fen(),
            boardState,
            shouldCheckMove,
            previousBoardEncoded,
        );

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
                boardAscii: boardState.ascii,
                boardEncoded: boardState.encoded,
                fullPgn: game.pgn(),
                gameAscii: game.ascii(),
                fen: game.fen(),
            };
            boardSignal.notify(message);
        }

        previousBoardEncoded = boardState.encoded;
    };

    void tick();

    return {
        boardSignal,
        disconnectSignal,
    };
};
