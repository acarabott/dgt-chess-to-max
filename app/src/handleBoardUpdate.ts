import { Chess } from "chess.js";
import type { BoardState, BoardMessage, DGTBoard, LiveBoardState, BoardUpdate } from "./api";
import { parseBoardMessage } from "./parseBoardMessage";
import { arrayEqual } from "../lib/arrayEqual";

type GameState = Pick<BoardMessage, "gameAscii" | "fen" | "fullPgn">;

export const handleBoardUpdate = async (
    game: Chess,
    board: DGTBoard,
    shouldCheckMove: boolean,
    previousLiveState: LiveBoardState,
): Promise<BoardUpdate | undefined> => {
    const gameState: GameState = {
        gameAscii: game.ascii(),
        fullPgn: game.pgn(),
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
                        newMovePgn: "",
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
                    newMovePgn: "",
                    boardEncoded: new Uint8Array(),
                    ...gameState,
                },
            };
            return update;
        }
    }
    const boardAscii = boardState.ascii;
    const boardEncoded = boardState.encoded;

    // Check if live state of the board has changed
    // ------------------------------------------------------------------------------

    if (!shouldCheckMove) {
        const boardHasChanged = !arrayEqual(previousLiveState.boardEncoded, boardEncoded);
        if (!boardHasChanged) {
            return undefined;
        }

        const isGameLegal = true; // true because we should not be checking moves
        const update: BoardUpdate = {
            liveState: {
                boardEncoded,
                isGameLegal,
            },
            message: {
                ok: true,
                isGameLegal,
                message: "",
                boardAscii: boardState.ascii,
                newMovePgn: "",
                boardEncoded: boardState.encoded,
                ...gameState,
            },
        };
        return update;
    }

    // Check if the move was legal
    // ------------------------------------------------------------------------------
    const getPosition = (fen: string) => fen.split(" ")[0];
    const boardPosition = getPosition(boardState.fen);
    const newMovePgn = game.moves().find((findMove) => {
        const tempGame = new Chess(game.fen());
        tempGame.move(findMove);
        const movePosition = getPosition(tempGame.fen());
        return movePosition === boardPosition;
    });

    const isGameLegal = newMovePgn !== undefined;

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
                newMovePgn: "",
                message:
                    "Could not generate PGN. Most likely because an illegal move, move the pieces to match the game position.",
                ...gameState,
            },
        };
        return update;
    }

    // Make the move
    // ------------------------------------------------------------------------------
    game.move(newMovePgn);

    const update: BoardUpdate = {
        liveState: {
            boardEncoded,
            isGameLegal: true,
        },
        message: {
            ok: true,
            boardAscii,
            boardEncoded,
            newMovePgn,
            isGameLegal: true,
            ...gameState,
            message: "",
        },
    };

    return update;
};
