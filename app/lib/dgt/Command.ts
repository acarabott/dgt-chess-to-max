export const SQUARES = [
    "a8",
    "b8",
    "c8",
    "d8",
    "e8",
    "f8",
    "g8",
    "h8",
    "a7",
    "b7",
    "c7",
    "d7",
    "e7",
    "f7",
    "g7",
    "h7",
    "a6",
    "b6",
    "c6",
    "d6",
    "e6",
    "f6",
    "g6",
    "h6",
    "a5",
    "b5",
    "c5",
    "d5",
    "e5",
    "f5",
    "g5",
    "h5",
    "a4",
    "b4",
    "c4",
    "d4",
    "e4",
    "f4",
    "g4",
    "h4",
    "a3",
    "b3",
    "c3",
    "d3",
    "e3",
    "f3",
    "g3",
    "h3",
    "a2",
    "b2",
    "c2",
    "d2",
    "e2",
    "f2",
    "g2",
    "h2",
    "a1",
    "b1",
    "c1",
    "d1",
    "e1",
    "f1",
    "g1",
    "h1",
];

export type Square = (typeof SQUARES)[number];

export type Color = "white" | "black";
export type Role = "pawn" | "rook" | "knight" | "bishop" | "king" | "queen";
export interface Piece {
    role: Role;
    color: Color;
}

const PIECES: Record<number, Piece | null> = {
    0x0: null,
    0x1: { role: "pawn", color: "white" },
    0x2: { role: "rook", color: "white" },
    0x3: { role: "knight", color: "white" },
    0x4: { role: "bishop", color: "white" },
    0x5: { role: "king", color: "white" },
    0x6: { role: "queen", color: "white" },
    0x7: { role: "pawn", color: "black" },
    0x8: { role: "rook", color: "black" },
    0x9: { role: "knight", color: "black" },
    0xa: { role: "bishop", color: "black" },
    0xb: { role: "king", color: "black" },
    0xc: { role: "queen", color: "black" },
    0xd: null, // PIECE1
    0xe: null, // PIECE2
    0xf: null, // PIECE3
};

export interface Command<T = void> {
    code: number;
    length: number;
    process?(msg: Uint8Array): T;
}

export class SendReset implements Command {
    code = 0x40;
    length = 0;
}

export class SendUpdateBoard implements Command {
    code = 0x44;
    length = 0;

    process(msg: Uint8Array) {
        // DGT_MSG_FIELD_UPDATE
        const pieces = new Map<Square, Piece | null>();
        pieces.set(SQUARES[msg[3]], PIECES[msg[4]]);
        return pieces;
    }
}

export class SendBoard implements Command {
    code = 0x42;
    length = 67;

    process(msg: Uint8Array) {
        return msg;
    }
}

export class ReturnSerialNr implements Command {
    code = 0x45;
    length = 8;

    process(msg: Uint8Array) {
        // DGT_MSG_SERIALNR
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(msg.slice(3));
    }
}

export class ReturnVersion implements Command {
    code = 0x4d;
    length = 5;

    process(msg: Uint8Array) {
        // DGT_MSG_VERSION
        return `${msg[3]}.${msg[4]}`;
    }
}

export class Position extends Map<Square, Piece | null> {
    get ascii() {
        let color = 0;
        let s = "  +------------------------+\n";
        for (let rank = 8; rank >= 1; rank--) {
            s += `${rank} |`;
            for (const file of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
                const square = `${file}${rank}`;
                const piece = this.get(square);
                let symbol = " ";
                if (piece) {
                    symbol = `\x1B[30m${pieceSymbol(piece.role, piece.color)}\x1B[39m`;
                }

                if (color) {
                    s += `\x1B[42m ${symbol} \x1B[49m`;
                } else {
                    s += `\x1B[107m ${symbol} \x1B[49m`;
                }

                color ^= 1; // switch color
            }

            s += "|\n";
            color ^= 1;
        }

        s += "  +------------------------+\n";
        s += "    a  b  c  d  e  f  g  h";
        return s;
    }
}

function pieceSymbol(role: Role, color: Color) {
    const colorIndex = {
        white: 0,
        black: 1,
    }[color];

    const symbols = {
        pawn: ["♙", "♟︎"],
        knight: ["♘", "♞"],
        bishop: ["♗", "♝"],
        rook: ["♖", "♜"],
        queen: ["♕", "♛"],
        king: ["♔", "♚"],
    };

    return symbols[role][colorIndex];
}
