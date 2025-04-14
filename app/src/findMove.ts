import { Chess } from "chess.js";

/**
 * Find a legal move given the current state of the game, and an attempted move
 * @param gameFEN FEN for the current state of the game
 * @param boardFEN FEN for the board state
 * @returns a move string, or undefined
 */
export const findMove = (gameFEN: string, boardFEN: string): string | undefined => {
    const getPosition = (fen: string) => fen.split(" ")[0];
    const boardPosition = getPosition(boardFEN);
    const currentGame = new Chess(gameFEN);
    const move = currentGame.moves().find((fmove) => {
        const tempGame = new Chess(gameFEN);
        tempGame.move(fmove);
        const movePosition = getPosition(tempGame.fen());
        return movePosition === boardPosition;
    });
    return move;
};
