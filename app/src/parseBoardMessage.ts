import type { Square } from "chess.js";
import { SQUARES, Chess } from "chess.js";
import type { DGTChessPiece } from "./api";
import { parseDGTPiece } from "./parseDGTPiece";

// TODO this could take the current PGN and initialize the game from that, would mean that FEN would have the correct turns

/**
 * Parses a message from the DGT board and returns a FEN string representing the position on the board.
 * The message is expected to be a Uint8Array with the first 3 bytes being a header.
 * The remaining bytes represent the pieces on the board in a specific order.
 * Each byte corresponds to a square on the board, and the value of the byte indicates the piece on that square.
 * @param message - the message from the DGT board
 * @returns a FEN string representing the position on the board
 */
export const parseBoardMessage = (message: Uint8Array) => {
    const encoded = message.slice(3);

    if (encoded.length !== SQUARES.length) {
        throw new Error("message does not have enough values");
    }

    const chess = new Chess();
    chess.clear();

    for (let i = 0; i < encoded.length; i++) {
        const square: Square = SQUARES[i];
        const dgtPiece: DGTChessPiece = encoded[i];
        const piece = parseDGTPiece(dgtPiece);
        if (piece !== undefined) {
            chess.put(piece, square);
        }
    }

    const fen = chess.fen();
    const ascii = chess.ascii();

    return { fen, ascii };
};
