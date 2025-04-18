import { kGreen } from "./colors";

export const prettyPrintBoard = (ascii: string) => {
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

export const visualizeBoard = (ascii: string) => {
    const kSymbolLookup: Partial<Record<string, string>> = {
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
        ".": " ",
    };

    const squareSize_px = 50;
    const boardSize_px = (8 + 2) * squareSize_px;

    const containerEl = document.createElement("div");
    containerEl.style.width = `${boardSize_px}`;
    containerEl.style.display = "flex";
    containerEl.style.flexDirection = "column";

    const rows = ascii.split("\n");
    const gameRows = rows.slice(1, 9);

    const whiteColor = "white";
    const blackColor = kGreen;

    const styleSquare = (squareEl: HTMLElement) => {
        squareEl.style.width = `${squareSize_px}px`;
        squareEl.style.height = `${squareSize_px}px`;
        squareEl.style.display = "flex";
        squareEl.style.justifyContent = "center";
        squareEl.style.alignItems = "center";
        squareEl.style.fontSize = `${squareSize_px}px`;
        squareEl.style.border = `0.5px ${blackColor} solid`;
        squareEl.style.boxSizing = "border-box";
    };

    const createRowEl = () => {
        const rowEl = document.createElement("div");
        rowEl.style.display = "flex";
        rowEl.style.flexDirection = "row";
        rowEl.style.width = "100%";
        return rowEl;
    };

    let gameRowIndex = 0;
    for (const row of gameRows) {
        const gameCols = row.slice(4, 27);
        const rowEl = createRowEl();
        containerEl.appendChild(rowEl);

        const rowColors = [whiteColor, blackColor];
        if (gameRowIndex % 2 === 1) {
            rowColors.reverse();
        }

        const numberEl = document.createElement("div");
        rowEl.appendChild(numberEl);
        styleSquare(numberEl);
        numberEl.style.fontSize = "20px";
        numberEl.textContent = (8 - gameRowIndex).toString();

        let colIndex = 0;
        for (const char of gameCols) {
            const symbol = kSymbolLookup[char];
            if (symbol !== undefined) {
                const square = document.createElement("div");
                square.style.backgroundColor = rowColors[colIndex % 2];
                square.textContent = symbol;
                styleSquare(square);
                rowEl.appendChild(square);
                colIndex++;
            }
        }
        gameRowIndex++;
    }
    const lettersRowEl = createRowEl();
    containerEl.appendChild(lettersRowEl);
    for (const letter of ["", "A", "B", "C", "D", "E", "F", "G", "H"]) {
        const squareEl = document.createElement("div");
        styleSquare(squareEl);
        squareEl.textContent = letter;
        squareEl.style.fontSize = "20px";
        lettersRowEl.appendChild(squareEl);
    }

    return containerEl;
};
