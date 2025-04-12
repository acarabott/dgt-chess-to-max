import { Chess } from "chess.js";
import type { BoardMessage, DGT } from "./api";
import { kInitialAscii } from "./kInitialAscii";
import { parseBoardMessage } from "./parseBoardMessage";
import { Signal } from "./Signal";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "./createSerialPort";

enum BoardResultType {
    Good = "Good",
    Bad = "Bad",
    Ignore = "Ignore",
}

interface BoardResultBase {
    type: BoardResultType;
}

interface BoardResultGood extends BoardResultBase {
    type: BoardResultType.Good;
    pgn: string;
    ascii: string;
    fen: string;
}

interface BoardResultBad extends BoardResultBase {
    type: BoardResultType.Bad;
    message: string;
    ascii: string;
}

interface BoardResultIgnore extends BoardResultBase {
    type: BoardResultType.Ignore;
}

type BoardResult = BoardResultBad | BoardResultGood | BoardResultIgnore;

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

    const signal = new Signal<BoardMessage>();
    const game = new Chess();

    const tick = async () => {
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        const boardResult = await (async (): Promise<BoardResult> => {
            // read the state from the board
            // ------------------------------------------------------------------------------
            let boardData: Uint8Array | undefined;
            try {
                boardData = await board.getBoardState();
                if (boardData === undefined) {
                    return {
                        type: BoardResultType.Bad,
                        message: "Could not read the board. Check the connection.",
                        ascii: "",
                    };
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
                return {
                    type: BoardResultType.Bad,
                    message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${errorMessage}`,
                    ascii: "",
                };
            }

            // Check if a move was made
            // ------------------------------------------------------------------------------
            const boardState = parseBoardMessage(boardData);
            if (boardState.ascii === kInitialAscii || boardState.fen === game.fen()) {
                // Board was read ok, but is in the initial position or nothing changed
                // checking ASCII for initial state, not FEN because FEN can have some slight variations
                // depending on how it was generated (from initial DGT board state or initial Chess instance)
                return { type: BoardResultType.Ignore };
            }

            // Check if the move was legal
            // ------------------------------------------------------------------------------
            const getPosition = (fen: string) => fen.split(" ")[0];
            const currentPosition = getPosition(game.fen());
            const move = game.moves().find((findMove) => {
                const tempGame = new Chess(game.fen());
                tempGame.move(findMove);
                const movePositions = getPosition(tempGame.fen());
                return movePositions === currentPosition;
            });

            if (move === undefined) {
                return {
                    type: BoardResultType.Bad,
                    message:
                        "Could not generate PGN. Most likely because an illegal move, reset the pieces to match the last legal position.",
                    ascii: boardState.ascii,
                };
            }

            // Make the move
            // ------------------------------------------------------------------------------
            game.move(move);

            const pgn = game.pgn();
            const fen = game.fen();
            const ascii = game.ascii();

            return {
                type: BoardResultType.Good,
                pgn,
                fen,
                ascii,
            };
        })();

        let message: BoardMessage | undefined = undefined;
        switch (boardResult.type) {
            case BoardResultType.Good: {
                message = {
                    ok: true,
                    pgn: boardResult.pgn,
                    ascii: boardResult.ascii,
                    fen: boardResult.fen,
                    message: "",
                    lastLegalAscii: game.ascii(),
                };
                break;
            }
            case BoardResultType.Bad: {
                message = {
                    ok: false,
                    ascii: boardResult.ascii,
                    pgn: "",
                    fen: "",
                    message: boardResult.message,
                    lastLegalAscii: game.ascii(),
                };
                break;
            }
            case BoardResultType.Ignore: {
                break;
            }
        }

        if (message !== undefined) {
            signal.notify(message);
        }
    };

    void tick();

    return {
        signal,
    };
};
