import type { BoardState, BoardUpdate } from "./api";
import { arrayEqual } from "../lib/arrayEqual";
import { findMove } from "./findMove";

export const handleBoardUpdate = (
    gameFen: string,
    boardState: Readonly<BoardState>,
    shouldCheckMove: boolean,
    previousBoardEncoded: Readonly<Uint8Array>,
): BoardUpdate | undefined => {
    const boardEncoded = boardState.encoded;

    // Check if live state of the board has changed
    // ------------------------------------------------------------------------------

    if (!shouldCheckMove) {
        const boardHasChanged = !arrayEqual(previousBoardEncoded, boardEncoded);
        if (!boardHasChanged) {
            return undefined;
        }

        const update: BoardUpdate = {
            isGameLegal: true, // true because we should not be checking moves
            message: "",
            move: undefined,
        };
        return update;
    }

    // Check if the move was legal
    // ------------------------------------------------------------------------------
    const move = findMove(gameFen, boardState.fen);
    if (move === undefined) {
        const update: BoardUpdate = {
            isGameLegal: false,
            move: undefined,
            message:
                "Could not generate PGN. Most likely because an illegal move, move the pieces to match the game position.",
        };
        return update;
    }

    // Make the move
    // ------------------------------------------------------------------------------
    const update: BoardUpdate = {
        move,
        isGameLegal: true,
        message: "",
    };

    return update;
};
