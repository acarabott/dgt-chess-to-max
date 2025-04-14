import { Chess } from "chess.js";
import type { BoardState, BoardUpdate } from "./api";
import { arrayEqual } from "../lib/arrayEqual";

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
            result: {
                ok: true,
                isGameLegal: true, // true because we should not be checking moves
                message: "",
                move: undefined,
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

    if (move === undefined) {
        const update: BoardUpdate = {
            result: {
                ok: true,
                isGameLegal: false,
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
        result: {
            ok: true,
            move,
            isGameLegal: true,
            message: "",
        },
    };

    return update;
};
