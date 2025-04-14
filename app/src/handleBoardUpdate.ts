import { Chess } from "chess.js";
import type { BoardState, LiveBoardState, BoardUpdate } from "./api";
import { arrayEqual } from "../lib/arrayEqual";

export const handleBoardUpdate = (
    gameFen: string,
    boardState: Readonly<BoardState>,
    shouldCheckMove: boolean,
    previousLiveState: LiveBoardState,
): BoardUpdate | undefined => {
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
                boardAscii,
                move: undefined,
                boardEncoded,
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
