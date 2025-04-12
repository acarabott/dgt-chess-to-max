import { Chess } from "chess.js";
import { Board } from "../dgt/Board";
import type { BoardMessage, DGT } from "./api";
import { createBoardSimulator } from "./boardSimulator";
import { kInitialAscii } from "./kInitialAscii";
import { parseBoardMessage } from "./parseBoardMessage";
import { Signal } from "./Signal";

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
}

interface BoardResultIgnore extends BoardResultBase {
    type: BoardResultType.Ignore;
}

type BoardResult = BoardResultBad | BoardResultGood | BoardResultIgnore;

export const setupBoard = async (
    serialPort: SerialPort | undefined,
    pollInterval_ms: number,
): Promise<DGT> => {
    const board = serialPort === undefined ? createBoardSimulator() : new Board(serialPort);
    await board.reset();

    const signal = new Signal<BoardMessage>();
    const game = new Chess();

    const tick = async () => {
        setTimeout(() => tick(), pollInterval_ms);

        const boardResult = await (async (): Promise<BoardResult> => {
            // read the state from the board
            // ------------------------------------------------------------------------------
            let boardState: Uint8Array | undefined;
            try {
                boardState = await board.getBoardState();
                if (boardState === undefined) {
                    return {
                        type: BoardResultType.Bad,
                        message: "Could not read the board. Check the connection.",
                    };
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
                return {
                    type: BoardResultType.Bad,
                    message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${errorMessage}`,
                };
            }

            // Check if a move was made
            // ------------------------------------------------------------------------------
            const boardMessage = parseBoardMessage(boardState);
            if (boardMessage.ascii === kInitialAscii || boardMessage.fen === game.fen()) {
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
                    pgn: "",
                    ascii: "",
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
