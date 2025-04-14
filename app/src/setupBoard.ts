import type { Color, Chess } from "chess.js";
import type { BoardMessage, BoardState, DGT, DGTBoard } from "./api";
import { Signal } from "./Signal";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "./createSerialPort";
import { parseBoardMessage } from "./parseBoardMessage";
import { arrayEqual } from "../lib/arrayEqual";
import { findMove } from "./findMove";

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
        // schedule next tick as long as still connected
        // ------------------------------------------------------------------------------
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        // read the current state of the board
        // ------------------------------------------------------------------------------
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

        // report the error if we couldn't read the board state
        // ------------------------------------------------------------------------------
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

        // check if the board has changed, and whether the move was legal or not
        // ------------------------------------------------------------------------------
        let newMovePgn: string;
        let message: string;
        let isGameLegal: boolean;
        if (shouldCheckMove) {
            const move = findMove(game.fen(), boardState.fen);
            if (move !== undefined) {
                game.move(move);

                newMovePgn = move;
                message = "";
                isGameLegal = true;
            } else {
                newMovePgn = "";
                message =
                    "Could not generate PGN. Most likely because an illegal move, move the pieces to match the game position.";
                isGameLegal = false;
            }
            shouldCheckMove = false;
        } else {
            // don't send board state when it hasn't changed
            const boardIsTheSame = arrayEqual(previousBoardEncoded, boardState.encoded);
            if (boardIsTheSame) {
                return;
            }
            newMovePgn = "";
            message = "";
            isGameLegal = true;
        }

        const boardMessage: BoardMessage = {
            ok: true,
            newMovePgn,
            message,
            isGameLegal,
            boardAscii: boardState.ascii,
            boardEncoded: boardState.encoded,
            fullPgn: game.pgn(),
            gameAscii: game.ascii(),
            fen: game.fen(),
        };
        boardSignal.notify(boardMessage);

        previousBoardEncoded = boardState.encoded;
    };

    void tick();

    return {
        boardSignal,
        disconnectSignal,
    };
};
