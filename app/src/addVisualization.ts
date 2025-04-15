import { prettyPrintBoard } from "./prettyPrintBoard";

export const addViz = (
    title: string,
    resultFen: string,
    resultAscii: string,
    targetFen: string,
) => {
    const containerEl = document.createElement("div");

    const titleEl = document.createElement("h2");
    containerEl.appendChild(titleEl);
    titleEl.textContent = title;

    const vizEl = document.createElement("textarea");
    containerEl.appendChild(vizEl);
    vizEl.value = `${prettyPrintBoard(resultAscii)}\n\ntarget: ${targetFen}\nresult: ${resultFen}\n\n\n`;

    vizEl.readOnly = true;
    vizEl.rows = 14;
    vizEl.cols = 70;
    vizEl.style.fontFamily = "monospace";
    vizEl.style.fontSize = "30px";

    document.body.appendChild(containerEl);
};
