export const prettyPrint = (ascii: string) => {
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
