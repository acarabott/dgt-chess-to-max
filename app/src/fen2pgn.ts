// https://raw.githubusercontent.com/iwamizawa-software/fen-to-pgn/refs/heads/main/fen-to-pgn.js

interface Data {
    place: string[];
    color: string;
    fullMoveNumber: number;
}

export const fenToData = function (fen: string | undefined): Data | undefined {
    if (!fen) {
        return;
    }
    try {
        const fields = fen.split(" ");
        return {
            place: fields[0].replace(/[1-8]/g, (n) => " ".repeat(n)).split("/"),
            color: fields[1],
            fullMoveNumber: +fields[5],
        };
    } catch (err) {
        throw new Error("Wrong fen:" + fen + "\nError:" + err);
    }
};
export const fenToPgn = function (fens: string[]) {
    if (fens.length < 2) {
        return "";
    }
    let pgn =
        fens[0] === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            ? ""
            : `[SetUp "1"]\n[FEN "${fens[0]}"]\n`;

    const previousFen = fens.shift();
    if (previousFen === undefined) {
        return;
    }
    const previous = fenToData(previousFen);
    if (previous === undefined) {
        return;
    }

    let current: Data | undefined;
    pgn += `${previous.fullMoveNumber}. ${previous.color === "b" ? ".. " : ""}`;
    while ((current = fenToData(fens.shift()))) {
        const removes = {};
        const adds = {};
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                if (previous.place[r][f] === current.place[r][f]) {
                    continue;
                }
                if (previous.place[r][f] !== " ") {
                    removes[previous.place[r][f]] = { r, f };
                }
                if (current.place[r][f] !== " ") {
                    adds[current.place[r][f]] = { r, f };
                }
            }
        }
        const pieces = Object.keys(adds);
        const pieceName = pieces[0].toUpperCase();
        const capture = Object.keys(removes).length === 2;
        if (pieces.length === 2) {
            pgn += "O-O" + ((adds["k"] || adds["K"]).f === 2 ? "-O" : "");
        } else {
            let to: string;
            if (pieceName === "P" || !removes[pieces[0]]) {
                to = capture
                    ? "abcdefgh"[
                          (removes[pieces[0]] || removes[previous.color === "w" ? "P" : "p"]).f
                      ]
                    : "";
            } else {
                to =
                    pieceName + "abcdefgh"[removes[pieces[0]].f] + "87654321"[removes[pieces[0]].r];
            }
            pgn +=
                to +
                (capture ? "x" : "") +
                "abcdefgh"[adds[pieces[0]].f] +
                "87654321"[adds[pieces[0]].r] +
                (removes[pieces[0]] ? "" : "=" + pieceName);
        }
        pgn +=
            previous.fullMoveNumber === current.fullMoveNumber
                ? " "
                : "\n" + (fens.length ? current.fullMoveNumber + "." : "");
        previous = current;
    }
    return pgn;
};
