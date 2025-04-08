import { Chess } from "chess.js";

export const createPGN = (fens: readonly string[]) => {
    const game = new Chess();

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
    }

    return game.pgn();
};
