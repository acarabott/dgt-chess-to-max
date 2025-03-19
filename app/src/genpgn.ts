import { Chess, Move } from "chess.js";

function fenSequenceToPGN(fenSequence: string[]): string {
    if (fenSequence.length < 2) {
        throw new Error("At least two FENs are required to reconstruct moves.");
    }

    const moves: Move[] = [];

    const inner = new Chess();

    for (let i = 0; i < fenSequence.length - 1; i++) {
        const currentFEN = fenSequence[i];
        const nextFEN = fenSequence[i + 1];

        // Generate all possible legal moves
        inner.load(currentFEN);
        const legalMoves = inner.moves({ verbose: true });

        // Find the move that results in the next FEN
        const matchingMove = legalMoves.find((move) => {
            inner.move(move.san); // Try move
            const resultingFEN = inner.fen();
            inner.undo();
            return resultingFEN === nextFEN;
        });

        if (!matchingMove) {
            throw new Error(`No legal move found from FEN index ${i} to ${i + 1}`);
        }

        moves.push(matchingMove);
    }

    const game = new Chess();
    for (const move of moves) {
        game.move(move);
    }

    return game.pgn();
}

// Example Usage
const fenSequence = [];

const chess = new Chess(); // Initialize from the first FEN

while (!chess.isGameOver()) {
    const moves = chess.moves();
    const move = moves[Math.floor(Math.random() * moves.length)];
    chess.move(move);
    fenSequence.push(chess.fen());
}

const pgn = fenSequenceToPGN(fenSequence.slice(0, 10));
console.log("pgn:", pgn);
