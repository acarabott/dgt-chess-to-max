import type { Piece } from "chess.js";
import { Chess } from "chess.js";

const pgn =
    "1.d4 Nf6 2.Nf3 d5 3.e3 Bf5 4.c4 c6 5.Nc3 e6 6.Bd3 Bxd3 7.Qxd3 Nbd7 8.b3 Bd6 9.O-O O-O 10.Bb2 Qe7 11.Rad1 Rad8 12.Rfe1 dxc4 13.bxc4 e5 14.dxe5 Nxe5 15.Nxe5 Bxe5 16.Qe2 Rxd1 17.Rxd1 Rd8 18.Rxd8+ Qxd8 19.Qd1 Qxd1+ 20.Nxd1 Bxb2 21.Nxb2 b5 22.f3 Kf8 23.Kf2 Ke7  1/2-1/2";

const moves = pgn
    .split("  ")[0]
    .split(" ")
    .map((move) => move.replace(/[0-9]+\./, ""));

const pieceToDGT = (piece: Readonly<Piece> | null): number => {
    let value = 0;
    if (piece !== null) {
        if (piece.color === "b") {
            value += 6;
        }
        switch (piece.type) {
            case "p": {
                value += 1;
                break;
            }
            case "n": {
                value += 3;
                break;
            }
            case "b": {
                value += 4;
                break;
            }
            case "r": {
                value += 2;
                break;
            }
            case "q": {
                value += 6;
                break;
            }
            case "k": {
                value += 5;
                break;
            }
        }
    }

    return value;
};

export const createMessage = (game: Chess) => {
    const board = game.board();
    const header = [134, 0, 67];
    const state = board.flatMap((rank) => rank.flatMap(pieceToDGT));
    const message = new Uint8Array([...header, ...state]);
    return message;
};

export const kTestSequence = (() => {
    const game = new Chess();
    const firstMessage = createMessage(game);
    const moveMessages = moves.map((move) => {
        game.move(move);
        return createMessage(game);
    });
    const sequence = [firstMessage, ...moveMessages];
    return sequence;
})();
