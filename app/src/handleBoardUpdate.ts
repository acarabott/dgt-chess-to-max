import { Chess } from "chess.js";
import type { BoardState, BoardMessage, DGTBoard, LiveBoardState, BoardUpdate } from "./api";
import { kInitialAscii } from "./kInitialAscii";
import { parseBoardMessage } from "./parseBoardMessage";
import { arrayEqual } from "../lib/arrayEqual";

type GameState = Pick<BoardMessage, "gameAscii" | "fen" | "pgn">;

export const handleBoardUpdate = async (
    game: Chess,
    board: DGTBoard,
    previousLiveState: LiveBoardState,
): Promise<BoardUpdate> => {
    const gameState: GameState = {
        gameAscii: game.ascii(),
        pgn: game.pgn(),
        fen: game.fen(),
    };
    // read the state from the board
    // ------------------------------------------------------------------------------
    let boardState: BoardState;
    {
        try {
            const boardData = await board.getBoardData();
            if (boardData === undefined) {
                const update: BoardUpdate = {
                    liveState: undefined,
                    message: {
                        ok: false,
                        isGameLegal: false,
                        boardAscii: "",
                        boardEncoded: new Uint8Array(),
                        message: "Could not read the board. Check the connection.",
                        ...gameState,
                    },
                };
                return update;
            }

            boardState = parseBoardMessage(boardData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            const update: BoardUpdate = {
                liveState: undefined,
                message: {
                    ok: false,
                    isGameLegal: false,
                    message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${errorMessage}`,
                    boardAscii: "",
                    boardEncoded: new Uint8Array(),
                    ...gameState,
                },
            };
            return update;
        }
    }
    const boardAscii = boardState.ascii;
    const boardEncoded = boardState.encoded;

    // Check if the game has started
    // ------------------------------------------------------------------------------
    const isGameStart = boardAscii === kInitialAscii && game.history().length === 0;
    if (isGameStart) {
        const update: BoardUpdate = {
            liveState: {
                boardEncoded,
                isGameLegal: true,
            },
            message: {
                ok: true,
                boardAscii,
                boardEncoded,
                isGameLegal: true,
                ...gameState,
                message: "",
            },
        };
        return update;
    }

    // Check if live state of the board has changed
    // ------------------------------------------------------------------------------
    const boardHasNotChanged = arrayEqual(previousLiveState.boardEncoded, boardEncoded);
    if (boardHasNotChanged) {
        const isGameLegal = boardAscii === gameState.gameAscii;
        const hasLegalChanged = isGameLegal !== previousLiveState.isGameLegal;

        let message: BoardMessage | undefined = undefined;
        if (hasLegalChanged) {
            message = {
                ok: true,
                boardAscii,
                boardEncoded,
                isGameLegal,
                message: "",
                ...gameState,
            };
        }

        const update: BoardUpdate = {
            message,
            liveState: {
                boardEncoded,
                isGameLegal,
            },
        };

        return update;
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

    const isGameLegal = move !== undefined;

    const liveState: LiveBoardState = {
        boardEncoded,
        isGameLegal,
    };

    if (!isGameLegal) {
        const update: BoardUpdate = {
            liveState,
            message: {
                ok: true,
                isGameLegal: false,
                boardAscii,
                boardEncoded,
                message:
                    "Could not generate PGN. Most likely because an illegal move, move the pieces to match the game position.",
                ...gameState,
            },
        };
        return update;
    }

    // Make the move
    // ------------------------------------------------------------------------------
    game.move(move);

    const update: BoardUpdate = {
        liveState: {
            boardEncoded,
            isGameLegal: true,
        },
        message: {
            ok: true,
            boardAscii,
            boardEncoded,
            isGameLegal: true,
            ...gameState,
            message: "",
        },
    };

    return update;
};
