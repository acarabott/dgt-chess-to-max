import type { Square } from "chess.js";
import { SQUARES, Chess } from "chess.js";
import type { DGTChessPiece } from "./api";
import { parseDGTPiece } from "./parseDGTPiece";

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

    return fen;
};
