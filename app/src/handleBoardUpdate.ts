import { Chess } from "chess.js";
import type { BoardState, DGTBoard, LiveBoardState, BoardUpdate } from "./api";
import { parseBoardMessage } from "./parseBoardMessage";
import { arrayEqual } from "../lib/arrayEqual";

export const handleBoardUpdate = async (
    gameFen: string,
    board: DGTBoard,
    shouldCheckMove: boolean,
    previousLiveState: LiveBoardState,
): Promise<BoardUpdate | undefined> => {
    // read the state from the board
    // ------------------------------------------------------------------------------
    let boardState: BoardState;
    {
        try {
            const boardData = await board.getBoardData();
            if (boardData === undefined) {
                const update: BoardUpdate = {
                    liveState: undefined,
                    result: {
                        ok: false,
                        isGameLegal: false,
                        boardAscii: "",
                        move: undefined,
                        boardEncoded: new Uint8Array(),
                        message: "Could not read the board. Check the connection.",
                    },
                };
                return update;
            }

            boardState = parseBoardMessage(boardData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            const update: BoardUpdate = {
                liveState: undefined,
                result: {
                    ok: false,
                    isGameLegal: false,
                    message: `Error reading the board. Try turning it off, reconnecting, and refreshing the page. ${errorMessage}`,
                    boardAscii: "",
                    move: undefined,
                    boardEncoded: new Uint8Array(),
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
            result: {
                ok: true,
                isGameLegal,
                message: "",
                boardAscii: boardState.ascii,
                move: undefined,
                boardEncoded: boardState.encoded,
            },
        };
        return update;
    }

    // Check if the move was legal
    // ------------------------------------------------------------------------------
    const getPosition = (fen: string) => fen.split(" ")[0];
    const boardPosition = getPosition(boardState.fen);
    const currentGame = new Chess(gameFen);
    const move = currentGame.moves().find((findMove) => {
        const tempGame = new Chess(gameFen);
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
            result: {
                ok: true,
                isGameLegal: false,
                boardAscii,
                boardEncoded,
                move: undefined,
                message:
                    "Could not generate PGN. Most likely because an illegal move, move the pieces to match the game position.",
            },
        };
        return update;
    }

    // Make the move
    // ------------------------------------------------------------------------------
    const update: BoardUpdate = {
        liveState: {
            boardEncoded,
            isGameLegal: true,
        },
        result: {
            ok: true,
            boardAscii,
            boardEncoded,
            move,
            isGameLegal: true,
            message: "",
        },
    };

    return update;
};
