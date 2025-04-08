import { prettyPrint } from "./prettyPrint";

export const createUI = () => {
    const containerEl = document.createElement("div");

    const boardEl = document.createElement("textarea");
    {
        containerEl.appendChild(boardEl);
        boardEl.readOnly = true;
        boardEl.rows = 14;
        boardEl.cols = 70;
        boardEl.style.fontFamily = "monospace";
        boardEl.style.fontSize = "30px";
    }

    const updateBoard = (ascii: string, pgn: string) => {
        boardEl.value = `${prettyPrint(ascii)}\n\n${pgn}`;
    };

    return {
        el: containerEl,
        updateBoard,
    };
};
