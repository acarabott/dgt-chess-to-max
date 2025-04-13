import { Chess } from "chess.js";
import type { BoardMessage, BoardState, DGT } from "./api";
import { parseBoardMessage } from "./parseBoardMessage";
import { Signal } from "./Signal";
import { Board } from "../dgt/Board";
import { createBoardSimulator } from "./boardSimulator";
import { createSerialPort } from "./createSerialPort";
import { kInitialAscii } from "./kInitialAscii";

enum BoardResultType {
    Good = "Good",
    Error = "Error",
    Ignore = "Ignore",
}

interface BoardResult {
    type: BoardResultType;
    isGameLegal: boolean;
    boardAscii: string;
    message: string;
}

interface PreviousLiveState {
    ascii: string;
    isGameLegal: boolean;
}

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

    let previousLiveState: PreviousLiveState = {
        ascii: "",
        isGameLegal: false,
    };

    const tick = async () => {
        if (shouldTick) {
            setTimeout(() => tick(), pollInterval_ms);
        }

        const boardResult = await (async (): Promise<BoardResult> => {
            // read the state from the board
            // ------------------------------------------------------------------------------
            let boardState: BoardState;
            {
                try {
                    const boardData = await board.getBoardData();
                    if (boardData === undefined) {
                        return {
                            type: BoardResultType.Error,
                            isGameLegal: false,
                            message: "Could not read the board. Check the connection.",
                            boardAscii: "",
                        };
                    }
                    boardState = parseBoardMessage(boardData);
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : JSON.stringify(error);
                    return {
                        type: BoardResultType.Error,
                        isGameLegal: false,
                        message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${errorMessage}`,
                        boardAscii: "",
                    };
                }
            }

            // Check if a move was made
            // ------------------------------------------------------------------------------

            const isGameStart = boardState.ascii === kInitialAscii && game.history().length === 0;
            if (isGameStart) {
                return {
                    type: BoardResultType.Good,
                    isGameLegal: true,
                    boardAscii: boardState.ascii,
                    message: "",
                };
            }

            // Check if live state of the board has changed
            // ------------------------------------------------------------------------------
            const hasBoardChanged = boardState.ascii !== previousLiveState.ascii;
            if (!hasBoardChanged) {
                const isGameLegal = boardState.ascii === game.ascii();
                const hasLegalChanged = isGameLegal !== previousLiveState.isGameLegal;
                previousLiveState = {
                    ascii: boardState.ascii,
                    isGameLegal,
                };
                const type = hasLegalChanged ? BoardResultType.Good : BoardResultType.Ignore;

                return {
                    type,
                    isGameLegal,
                    boardAscii: boardState.ascii,
                    message: "",
                };
            }

            // Check if the move was legal
            // ------------------------------------------------------------------------------
            const getPosition = (fen: string) => fen.split(" ")[0];
            const boardPosition = getPosition(boardState.fen);
            const move = game.moves().find((findMove) => {
                const tempGame = new Chess(game.fen());
                tempGame.move(findMove);
                const movePosition = getPosition(tempGame.fen());
                return movePosition === boardPosition;
            });

            const moveIsLegal = move !== undefined;

            previousLiveState = {
                ascii: boardState.ascii,
                isGameLegal: moveIsLegal,
            };

            if (!moveIsLegal) {
                return {
                    type: BoardResultType.Good,
                    isGameLegal: false,
                    message:
                        "Could not generate PGN. Most likely because an illegal move, move the pieces to match the game position.",
                    boardAscii: boardState.ascii,
                };
            }

            // Make the move
            // ------------------------------------------------------------------------------
            game.move(move);

            const result: BoardResult = {
                type: BoardResultType.Good,
                isGameLegal: true,
                boardAscii: boardState.ascii,
                message: "",
            };

            return result;
        })();

        const sendBoardMessage = (ok: boolean) => {
            const boardMessage: BoardMessage = {
                ok,
                isGameLegal: boardResult.isGameLegal,
                boardAscii: boardResult.boardAscii,
                gameAscii: game.ascii(),
                pgn: game.pgn(),
                fen: game.fen(),
                message: boardResult.message,
            };
            boardSignal.notify(boardMessage);
        };

        switch (boardResult.type) {
            case BoardResultType.Good: {
                sendBoardMessage(true);
                break;
            }
            case BoardResultType.Error: {
                sendBoardMessage(false);
                break;
            }
            case BoardResultType.Ignore: {
                break;
            }
        }
    };

    void tick();

    return {
        signal: boardSignal,
    };
};
