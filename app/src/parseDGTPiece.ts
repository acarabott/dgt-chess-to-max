import type { Piece } from "chess.js";
import { DGTChessPiece } from "./api";

export const parseDGTPiece = (piece: DGTChessPiece): Piece | undefined => {
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
