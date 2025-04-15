import type { Color, Chess } from "chess.js";
import { kDGTFilter } from "./api";
import type { BoardMessage, BoardState, DGT, DGTBoard } from "./api";
import { Signal } from "../lib/Signal";
import { Board } from "../lib/dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "../lib/createSerialPort";
import { parseBoardMessage } from "./parseBoardMessage";
import { arrayEqual } from "../lib/arrayEqual";
import { findMove } from "./findMove";
import { kDGTBaudRate } from "./constants";

export const setupBoard = async (
    game: Chess,
    simulateBoard: boolean,
    pollInterval_ms: number,
    moveKeyPressedSignal: Signal<Color>,
): Promise<DGT | Error> => {
    let shouldTick = true;
    let previousBoardEncoded = new Uint8Array();
    let playerHasIndicatedMove = false;
    moveKeyPressedSignal.listen((color) => {
        if (color === game.turn()) {
            playerHasIndicatedMove = true;
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
            const serialPortOrError = await createSerialPort(
                kDGTBaudRate,
                [kDGTFilter],
                onSerialPortDisconnect,
            );
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
                boardAscii: "",
                boardEncoded: new Uint8Array(),
                boardFen: "",
                gameAscii: game.ascii(),
                gameFen: game.fen(),
                gameFullPgn: game.pgn(),
                isGameLegal: false,
                message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${extraError}`,
                newMovePgn: "",
                ok: false,
            };
            boardSignal.notify(boardMessage);
            return undefined;
        }

        // check if the board has changed, and whether the move was legal or not
        // ------------------------------------------------------------------------------
        let newMovePgn: string;
        let message: string;
        let isGameLegal: boolean;
        if (playerHasIndicatedMove) {
            // if the player has indicated a move, we *always* check it
            // even if the board hasn't changed, as this would be an illegal move
            playerHasIndicatedMove = false;

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
        } else {
            // when the player has not indicated a move, and the board has not changed, ignore
            const boardIsTheSame = arrayEqual(previousBoardEncoded, boardState.encoded);
            if (boardIsTheSame) {
                return;
            }
            newMovePgn = "";
            message = "";
            isGameLegal = true;
        }

        const boardMessage: BoardMessage = {
            boardAscii: boardState.ascii,
            boardEncoded: boardState.encoded,
            boardFen: boardState.fen,
            gameAscii: game.ascii(),
            gameFen: game.fen(),
            gameFullPgn: game.pgn(),
            isGameLegal,
            message,
            newMovePgn,
            ok: true,
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
