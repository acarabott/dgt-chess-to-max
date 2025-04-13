import { Chess } from "chess.js";
import type { BoardState, BoardMessage, DGTBoard, LiveBoardState, BoardUpdate } from "./api";
import { kInitialAscii } from "./kInitialAscii";
import { parseBoardMessage } from "./parseBoardMessage";

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

export const handleBoardUpdate = async (
    game: Chess,
    board: DGTBoard,
    previousLiveState: LiveBoardState,
): Promise<BoardUpdate> => {
    let liveState: LiveBoardState | undefined;
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
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
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
            liveState = {
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

        liveState = {
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

    const createBoardMessage = (ok: boolean): BoardMessage => {
        const boardMessage: BoardMessage = {
            ok,
            isGameLegal: boardResult.isGameLegal,
            boardAscii: boardResult.boardAscii,
            gameAscii: game.ascii(),
            pgn: game.pgn(),
            fen: game.fen(),
            message: boardResult.message,
        };
        return boardMessage;
    };

    switch (boardResult.type) {
        case BoardResultType.Good: {
            const message = createBoardMessage(true);
            return { message, liveState };
        }
        case BoardResultType.Error: {
            const message = createBoardMessage(false);
            return { message, liveState };
        }
        case BoardResultType.Ignore: {
            return { message: undefined, liveState };
        }
    }
};
