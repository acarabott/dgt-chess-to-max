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
    ascii: string;
}

interface BoardResultBad extends BoardResultBase {
    type: BoardResultType.Bad;
    message: string;
    ascii: string;
}

interface BoardResultIgnore extends BoardResultBase {
    type: BoardResultType.Ignore;
    ascii: string;
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
    let previousLiveAscii = "";

    let haveHandledInitialPosition = false;
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

            // checking ASCII for initial state, not FEN because FEN can have some slight variations
            // depending on how it was generated (from initial DGT board state or initial Chess instance)
            const isInitialPosition = boardState.ascii === kInitialAscii;
            if (!haveHandledInitialPosition && isInitialPosition) {
                haveHandledInitialPosition = true;
                return {
                    type: BoardResultType.Good,
                    ascii: boardState.ascii,
                };
            }

            // Check if live state of the board has changed
            // ------------------------------------------------------------------------------
            if (boardState.ascii === previousLiveAscii) {
                return {
                    type: BoardResultType.Ignore,
                    ascii: boardState.ascii,
                };
            }
            previousLiveAscii = boardState.ascii;

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

            const result: BoardResultGood = {
                type: BoardResultType.Good,
                ascii: boardState.ascii,
            };

            return result;
        })();

        const sendBoardMessage = (ok: boolean, message: string) => {
            const boardMessage: BoardMessage = {
                ok,
                ascii: boardResult.ascii,
                pgn: game.pgn(),
                fen: game.fen(),
                previousLegalAsciiPosition: game.ascii(),
                message,
            };
            signal.notify(boardMessage);
        };

        switch (boardResult.type) {
            case BoardResultType.Good: {
                sendBoardMessage(true, "");
                break;
            }
            case BoardResultType.Bad: {
                sendBoardMessage(false, boardResult.message);
                break;
            }
            case BoardResultType.Ignore: {
                break;
            }
        }
    };

    void tick();

    return {
        signal,
    };
};
