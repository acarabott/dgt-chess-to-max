import type { Piece, Square } from "chess.js";
import { Chess, SQUARES } from "chess.js";
import { kTestSequence } from "./testSequence";

/* 
TODO might need to handle messages from board coming in fragmented
TODO take moves one at a time
TODO buffering values until message is complete (or use DGT library)
TODO sending messages to MAX
*/

enum DGTChessPiece {
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

const addViz = (title: string, chess: Chess, targetFen: string) => {
    const containerEl = document.createElement("div");

    const titleEl = document.createElement("h2");
    containerEl.appendChild(titleEl);
    titleEl.textContent = title;

    const vizEl = document.createElement("textarea");
    containerEl.appendChild(vizEl);
    vizEl.value = `${prettyPrint(chess.ascii())}
    
target: ${targetFen}
result: ${chess.fen()}

`;

    vizEl.readOnly = true;
    vizEl.rows = 14;
    vizEl.cols = 70;
    vizEl.style.fontFamily = "monospace";
    vizEl.style.fontSize = "30px";

    document.body.appendChild(containerEl);
};

const prettyPrint = (ascii: string) => {
    const kSymbolLookup: Record<string, string> = {
        P: "♙",
        B: "♗",
        N: "♘",
        R: "♖",
        Q: "♕",
        K: "♔",
        p: "♟",
        b: "♝",
        n: "♞",
        r: "♜",
        q: "♛",
        k: "♚",
    };

    let pretty = "";
    for (const char of ascii) {
        pretty += kSymbolLookup[char] ?? char;
    }

    return pretty;
};

const parseBoardMessage = (message: Uint8Array) => {
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

const createPGN = (fens: readonly string[]) => {
    const game = new Chess();
    addViz("init", game, "");

    const getPositions = (fen: string) => fen.split(" ")[0];

    for (const fen of fens) {
        const fenPositions = getPositions(fen);

        const move = game.moves().find((findMove) => {
            const chess = new Chess(game.fen());
            chess.move(findMove);
            const result = chess.fen();
            const movePositions = getPositions(result);

            return movePositions === fenPositions;
        });

        if (move === undefined) {
            // TODO handle this propertly
            throw new Error("couldn't find move for fen");
        }
        game.move(move);
        // addViz(fen, game, "")
    }
};

const fens = (() => {
    const start = performance.now();
    const result = kTestSequence.map(parseBoardMessage);
    const end = performance.now();
    console.log(`parsing messages: ${end - start}`);
    return result;
})();

{
    const start = performance.now();
    createPGN(fens);
    const end = performance.now();
    console.log(`creating PGN: ${end - start}`);
}
