import type { Piece, Square } from "chess.js";
import { SQUARES, Chess } from "chess.js";
import type { BoardState } from "./api";
import { DGTChessPiece } from "./api";

const parseDGTPiece = (piece: DGTChessPiece): Piece | undefined => {
    if (piece === DGTChessPiece.None) {
        return undefined;
    }

    switch (piece) {
        case DGTChessPiece.WhitePawn:
            return { color: "w", type: "p" };
        case DGTChessPiece.WhiteRook:
            return { color: "w", type: "r" };
        case DGTChessPiece.WhiteKnight:
            return { color: "w", type: "n" };
        case DGTChessPiece.WhiteBishop:
            return { color: "w", type: "b" };
        case DGTChessPiece.WhiteKing:
            return { color: "w", type: "k" };
        case DGTChessPiece.WhiteQueen:
            return { color: "w", type: "q" };
        case DGTChessPiece.BlackPawn:
            return { color: "b", type: "p" };
        case DGTChessPiece.BlackRook:
            return { color: "b", type: "r" };
        case DGTChessPiece.BlackKnight:
            return { color: "b", type: "n" };
        case DGTChessPiece.BlackBishop:
            return { color: "b", type: "b" };
        case DGTChessPiece.BlackKing:
            return { color: "b", type: "k" };
        case DGTChessPiece.BlackQueen:
            return { color: "b", type: "q" };
    }
};

/**
 * Parses a message from the DGT board and returns a FEN string representing the position on the board.
 * The message is expected to be a Uint8Array with the first 3 bytes being a header.
 * The remaining bytes represent the pieces on the board in a specific order.
 * Each byte corresponds to a square on the board, and the value of the byte indicates the piece on that square.
 * @param message - the message from the DGT board
 * @returns a FEN string representing the position on the board
 */
export const parseBoardMessage = (message: Uint8Array): BoardState => {
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

    return { fen, ascii, encoded };
};
