/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-console */
import { Chess, validateFen } from "chess.js";

const kNumSquares = 64;

// prettier-ignore
const kSquares = [
    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
] as const

type SquareName = (typeof kSquares)[number];

console.assert(kSquares.length === kNumSquares, "Squares constant does not have 64 values");

enum ChessPiece {
    None = 0x0,
    WhitePawn = 0x1,
    WhiteRook = 0x2,
    WhiteKnight = 0x3,
    WhiteBishop = 0x4,
    WhiteKing = 0x5,
    WhiteQueen = 0x6,
    BlackPawn = 0x7,
    BlackRook = 0x8,
    BlackKnight = 0x9,
    BlackBishop = 0xa,
    BlackKing = 0xb,
    BlackQueen = 0xc,
}

console.assert(
    Object.values(ChessPiece).length === 13 * 2, // x2 because stores both values for bidirectional lookup
    "ChessPiece enum has incorrect number of values, should be 13",
);

const kSymbolLookup = [" ", "♙", "♖", "♘", "♗", "♔", "♕", "♟", "♜", "♞", "♝", "♛", "♚"] as const;

console.assert(
    kSymbolLookup.length === 13,
    "Symbol lookup has incorrect number of values, should be 13",
);

const getPieceSymbol = (piece: ChessPiece): string => {
    return kSymbolLookup[piece];
};

interface Square {
    name: SquareName;
    piece: ChessPiece;
}

const parseBoardMessage = (message: Uint8Array) => {
    const encoded = message.slice(3);

    if (encoded.length !== kNumSquares) {
        throw new Error("message does not have enough values");
    }

    const squares = Array.from(encoded).map((value, i) => {
        const square: Square = {
            name: kSquares[i],
            piece: value as ChessPiece,
        };

        return square;
    });

    return squares;
};

const boardMessage = new Uint8Array([
    134, 0, 67, 8, 9, 10, 12, 11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4,
    6, 5, 4, 3, 2,
]);

const parsed = parseBoardMessage(boardMessage);

let line = "";
for (let i = 0; i < parsed.length; i++) {
    const square = parsed[i];
    const symbol = getPieceSymbol(square.piece);
    line += symbol;
    if (i % 8 === 7) {
        console.log(line);
        line = "";
    }
}

const chess = new Chess();
console.log("pgn", chess.pgn());
const isValid = chess.put({ type: "p", color: "w" }, "e4");
console.log("isValid:", isValid);
console.log("pgn", chess.pgn());
