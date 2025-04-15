import type { AddError, BoardMessage, Colors, StartAction, UI } from "./api";
import { MaxConnectionStatus } from "./api";
import { kMaxMiraChannel } from "./constants";
import { prettyPrintBoard } from "./prettyPrintBoard";
import type { Listener } from "../lib/Signal";

export const createUI = (startAction: StartAction): UI => {
    const el = document.createElement("div");

    let addError: AddError;

    const startEl = document.createElement("button");
    {
        el.appendChild(startEl);
        startEl.textContent = "Connect to DGT board";
        startEl.addEventListener("click", () => {
            void startAction();
        });
    }

    const hideStartButton = () => {
        startEl.style.display = "none";
    };

    const showStartButton = () => {
        startEl.style.display = "block";
    };

    {
        const errorContainerEl = document.createElement("div");
        el.appendChild(errorContainerEl);
        errorContainerEl.style.backgroundColor = "red";
        errorContainerEl.style.fontFamily = "monospace";

        const errorListEl = document.createElement("ul");
        errorContainerEl.appendChild(errorListEl);

        const clearErrorsEl = document.createElement("button");
        {
            errorContainerEl.appendChild(clearErrorsEl);
            clearErrorsEl.textContent = "Clear Errors";
            clearErrorsEl.style.display = "none";
            clearErrorsEl.addEventListener("click", () => {
                errorListEl.innerHTML = "";
                clearErrorsEl.style.display = "none";
            });
        }

        let previousMessage = "";
        let repeatedMessageCount = 0;
        addError = (message, html) => {
            if (message === previousMessage && errorListEl.lastChild !== null) {
                errorListEl.removeChild(errorListEl.lastChild);
                repeatedMessageCount++;
            } else {
                repeatedMessageCount = 0;
            }
            previousMessage = message;

            const li = document.createElement("li");
            const now = new Date().toUTCString();
            const count = repeatedMessageCount === 0 ? "" : ` (${repeatedMessageCount})`;
            const error = `${now}: ${message}${count}`;
            const messageEl = document.createElement("div");
            li.appendChild(messageEl);
            messageEl.textContent = error;
            if (html !== undefined) {
                li.appendChild(html);
            }
            errorListEl.prepend(li);
            clearErrorsEl.style.display = "block";

            showStartButton();
        };
    }

    const createBoardEl = (fontSize: string) => {
        const boardEl = document.createElement("textarea");
        boardEl.readOnly = true;
        boardEl.rows = 10;
        boardEl.cols = 30;
        boardEl.style.fontFamily = "monospace";
        boardEl.style.fontSize = fontSize;
        return boardEl;
    };

    const liveBoardEl = createBoardEl("30px");
    el.appendChild(liveBoardEl);

    const legalEl = document.createElement("div");
    el.appendChild(legalEl);
    legalEl.style.background = "red";
    legalEl.style.color = "white";

    const setLegalState = (isLegal: boolean, message: string) => {
        legalEl.textContent = message;
        legalEl.style.display = isLegal ? "none" : "block";
    };
    setLegalState(true, "");

    const previousLegalBoardEl = createBoardEl("20px");
    el.appendChild(previousLegalBoardEl);

    const maxEl = document.createElement("div");
    el.appendChild(maxEl);
    maxEl.style.border = "1px black solid";

    const maxTitleEl = document.createElement("h2");
    maxTitleEl.textContent = "Max";
    maxEl.appendChild(maxTitleEl);

    const maxConnectionEl = document.createElement("div");
    maxEl.appendChild(maxConnectionEl);

    const maxMessageEl = document.createElement("textarea");
    maxEl.appendChild(maxMessageEl);
    maxMessageEl.rows = 20;
    maxMessageEl.cols = 80;
    maxMessageEl.style.textWrapMode = "nowrap";

    const maxMessageHistory: string[] = [];
    const kMaxMessageHistoryLength = 50;
    const appendMaxMessage = (message: Readonly<BoardMessage>) => {
        const timestamp = new Date().toUTCString();
        const timeStampedMessage = `${timestamp}: ${JSON.stringify(message)}`;
        maxMessageHistory.unshift(timeStampedMessage);
        if (maxMessageHistory.length > kMaxMessageHistoryLength) {
            maxMessageHistory.pop();
        }
        maxMessageEl.textContent = maxMessageHistory.join("\n");
    };

    const maxConnectionListener: Listener<MaxConnectionStatus> = (status) => {
        let connectionText: string;

        let colors: Colors | undefined;
        switch (status) {
            case MaxConnectionStatus.Init:
                connectionText = "Max: Initialized";
                break;
            case MaxConnectionStatus.Connecting:
                connectionText = "Max: Connecting";
                break;
            case MaxConnectionStatus.Connected:
                connectionText = "Max: Connected";
                colors = { bg: "green", fg: "white" };
                break;
            case MaxConnectionStatus.ConnectionFailed:
                connectionText = "Max: Connection Failed";
                break;
            case MaxConnectionStatus.Reconnecting:
                connectionText = "Max: Reconnecting";
                break;
            case MaxConnectionStatus.Disconnected: {
                const text = `Max disconnected. Restart the patch and make sure there is a mira.frame object and a mira.channel object with the name ${kMaxMiraChannel}`;
                addError(text);
                connectionText = text;
                colors = { bg: "red", fg: "black" };
                break;
            }
        }
        maxConnectionEl.textContent = connectionText;
        colors ??= { bg: "transparent", fg: "black" };
        maxConnectionEl.style.backgroundColor = colors.bg;
        maxConnectionEl.style.color = colors.fg;
    };

    const boardListener: Listener<BoardMessage> = (message) => {
        liveBoardEl.value = prettyPrintBoard(message.boardAscii);
        previousLegalBoardEl.value = prettyPrintBoard(message.gameAscii);

        appendMaxMessage(message);

        setLegalState(message.isGameLegal, message.message);

        if (!message.ok) {
            let html: HTMLElement | undefined;
            const createEl = (title: string, ascii: string) => {
                if (ascii.trim().length === 0) {
                    return undefined;
                }
                const boardEl = document.createElement("pre");
                boardEl.textContent = `${title}:\n ${prettyPrintBoard(ascii)}`;
                return boardEl;
            };

            const gameEl = createEl("Game", message.gameAscii);
            const boardEl = createEl("Board", message.boardAscii);

            if (gameEl !== undefined || boardEl !== undefined) {
                const containerEl = document.createElement("div");
                containerEl.style.display = "flex";
                containerEl.style.flexDirection = "row";
                if (gameEl !== undefined) {
                    containerEl.appendChild(gameEl);
                }
                if (boardEl !== undefined) {
                    containerEl.appendChild(boardEl);
                }

                html = containerEl;
            }

            addError(message.message, html);
        }
    };

    {
        // window focus indicator
        document.body.style.borderWidth = "20px";
        document.body.style.borderStyle = "solid";
        document.body.style.padding = "20px";
        document.body.style.margin = "0px";

        const updateFocus = (hasFocus: boolean) => {
            document.body.style.borderColor = hasFocus ? "rgb(43, 212, 156)" : "rgb(212, 100, 100)";
        };
        updateFocus(true);
        window.addEventListener("focus", () => {
            updateFocus(true);
        });
        window.addEventListener("blur", () => {
            updateFocus(false);
        });
    }

    return {
        el,
        addError,
        hideStartButton,
        boardListener,
        maxConnectionListener,
    };
};

export const showUnsupportedUI = () => {
    const style = document.body.style;
    style.backgroundColor = "rgb(212, 100, 100)";
    style.color = "black";
    style.fontFamily = "Impact, sans-serif";
    style.fontSize = "100px";
    style.padding = "20px";
    document.body.textContent = "This browser cannot connect to DGT boards. Use Google Chrome.";
};
