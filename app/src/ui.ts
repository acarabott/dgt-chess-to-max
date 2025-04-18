import type { AddError, BoardMessage, Colors, StartAction, UI } from "./api";
import { MaxConnectionStatus } from "./api";
import { kMaxMiraChannel } from "./constants";
import { prettyPrintBoard, visualizeBoard } from "./prettyPrintBoard";
import type { Listener, Signal } from "../lib/Signal";
import { kGreen, kRed } from "./colors";
import type { Color } from "chess.js";

export const createUI = (startAction: StartAction, moveInputSignal: Signal<Color>): UI => {
    const el = document.createElement("div");
    el.style.fontFamily = "sans-serif";

    let addError: AddError;

    const startEl = document.createElement("button");
    {
        el.appendChild(startEl);
        startEl.textContent = "Connect to DGT board";
        startEl.style.width = "100px";
        startEl.style.height = "100px";
        startEl.style.cursor = "pointer";
        startEl.style.marginBottom = "20px";
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
        errorContainerEl.className = "error-container";
        el.appendChild(errorContainerEl);
        errorContainerEl.style.backgroundColor = kRed;
        errorContainerEl.style.fontFamily = "monospace";
        errorContainerEl.style.padding = "20px";
        errorContainerEl.style.display = "none";
        errorContainerEl.style.marginBottom = "20px";

        const errorListEl = document.createElement("ul");
        errorListEl.style.fontSize = "20px";
        errorContainerEl.appendChild(errorListEl);

        const clearErrorsEl = document.createElement("button");
        {
            errorContainerEl.appendChild(clearErrorsEl);
            clearErrorsEl.textContent = "Clear Errors";
            clearErrorsEl.style.display = "none";
            clearErrorsEl.style.width = "80px";
            clearErrorsEl.style.height = "80px";
            clearErrorsEl.style.cursor = "pointer";
            clearErrorsEl.addEventListener("click", () => {
                errorListEl.innerHTML = "";
                errorContainerEl.style.display = "none";
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
            errorContainerEl.style.display = "block";
            clearErrorsEl.style.display = "block";

            showStartButton();
        };
    }

    const createBoardCmp = (title: string) => {
        const parentEl = document.createElement("div");
        parentEl.style.border = "1px black solid";
        parentEl.style.padding = "20px";
        parentEl.style.width = "400px";

        const titleEl = document.createElement("h2");
        titleEl.textContent = title;
        titleEl.style.marginTop = "0";
        parentEl.appendChild(titleEl);

        const legalEl = document.createElement("span");
        legalEl.textContent = "Illegal move, reset";
        legalEl.style.marginLeft = "20px";
        legalEl.style.padding = "0 20px";
        legalEl.style.fontSize = "20px";
        legalEl.style.width = "100%";
        legalEl.style.height = "20px";
        legalEl.style.visibility = "hidden";
        titleEl.appendChild(legalEl);

        const boardEl = document.createElement("div");
        parentEl.appendChild(boardEl);

        return { parentEl, titleEl, legalEl, boardEl };
    };

    const boardsEl = document.createElement("div");
    el.appendChild(boardsEl);
    boardsEl.className = "boardsEl";
    boardsEl.style.display = "flex";
    boardsEl.style.flexDirection = "row";
    boardsEl.style.flexWrap = "wrap";
    boardsEl.style.gap = "50px";

    const liveBoardCmp = createBoardCmp("Live Board");
    boardsEl.appendChild(liveBoardCmp.parentEl);

    const gameBoardCmp = createBoardCmp("Legal Game");
    boardsEl.appendChild(gameBoardCmp.parentEl);

    const turnsEl = document.createElement("div");
    turnsEl.style.border = "1px solid black";
    turnsEl.style.padding = "20px";
    boardsEl.appendChild(turnsEl);

    const turnEl = document.createElement("h2");
    turnEl.textContent = "Turn: ";
    turnsEl.appendChild(turnEl);

    const turnTextEl = document.createElement("span");
    turnTextEl.style.padding = "10px";
    turnTextEl.style.border = "1px solid black";
    turnTextEl.textContent = "White";
    turnEl.appendChild(turnTextEl);

    const turnButtonsEl = document.createElement("div");
    turnButtonsEl.style.display = "flex";
    turnButtonsEl.style.flexDirection = "column";
    turnButtonsEl.style.gap = "200px";
    turnButtonsEl.style.marginTop = "40px";

    turnsEl.appendChild(turnButtonsEl);
    const createTurnButton = (color: Color) => {
        const turnButtonEl = document.createElement("button");
        turnButtonEl.textContent = `${{ w: "White", b: "Black" }[color]} Move`;
        turnButtonEl.style.border = "1px black solid";
        turnButtonEl.style.backgroundColor = { w: "white", b: kGreen }[color];
        turnButtonEl.style.width = "100%";
        turnButtonEl.style.height = "100px";
        turnButtonEl.style.cursor = "pointer";
        turnButtonEl.style.outlineStyle = "solid";
        turnButtonEl.style.outlineWidth = "4px";
        turnButtonEl.style.outlineColor = "transparent";

        turnButtonEl.addEventListener("click", () => {
            moveInputSignal.notify(color);
        });
        return turnButtonEl;
    };
    const turnButtonBlack = createTurnButton("b");
    turnButtonsEl.appendChild(turnButtonBlack);

    const turnButtonWhite = createTurnButton("w");
    turnButtonsEl.appendChild(turnButtonWhite);
    turnButtonWhite.style.outlineColor = "black";

    const setLegalState = (isLegal: boolean, _message: string) => {
        liveBoardCmp.legalEl.style.visibility = isLegal ? "hidden" : "visible";
        liveBoardCmp.parentEl.style.backgroundColor = isLegal ? "transparent" : kRed;
    };
    setLegalState(true, "");

    const maxEl = document.createElement("div");
    el.appendChild(maxEl);
    maxEl.style.border = "1px black solid";
    maxEl.style.padding = "20px";
    maxEl.style.marginTop = "10px";

    const maxTitleEl = document.createElement("h2");
    maxTitleEl.textContent = "Max";
    maxTitleEl.style.padding = "10px";
    maxTitleEl.style.marginTop = "0px";
    maxEl.appendChild(maxTitleEl);

    const maxConnectionEl = document.createElement("span");
    maxTitleEl.appendChild(maxConnectionEl);

    const maxMessageEl = document.createElement("textarea");
    maxEl.appendChild(maxMessageEl);
    maxMessageEl.rows = 20;
    maxMessageEl.cols = 80;
    maxMessageEl.style.width = "100%";
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
                connectionText = "Initialized";
                break;
            case MaxConnectionStatus.Connecting:
                connectionText = "Connecting";
                colors = { bg: "rgb(100, 100, 100)", fg: "black" };
                break;
            case MaxConnectionStatus.Connected:
                connectionText = "Connected";
                colors = { bg: kGreen, fg: "white" };
                break;
            case MaxConnectionStatus.ConnectionFailed:
                connectionText = "Connection Failed";
                colors = { bg: kRed, fg: "black" };
                break;
            case MaxConnectionStatus.Reconnecting:
                colors = { bg: "rgb(100, 100, 100)", fg: "black" };
                connectionText = "Reconnecting";
                break;
            case MaxConnectionStatus.Disconnected: {
                const text = `Max disconnected. Restart the patch and make sure there is a mira.frame object and a mira.channel object with the name ${kMaxMiraChannel}`;
                addError(text);
                connectionText = text;
                colors = { bg: kRed, fg: "black" };
                break;
            }
        }
        maxConnectionEl.textContent = `: ${connectionText}`;
        colors ??= { bg: "transparent", fg: "black" };
        maxTitleEl.style.backgroundColor = colors.bg;
        maxTitleEl.style.color = colors.fg;
    };

    const boardListener: Listener<BoardMessage> = (message) => {
        liveBoardCmp.boardEl.innerHTML = "";
        liveBoardCmp.boardEl.appendChild(visualizeBoard(message.boardAscii));
        gameBoardCmp.boardEl.innerHTML = "";
        gameBoardCmp.boardEl.appendChild(visualizeBoard(message.gameAscii));

        turnTextEl.textContent = message.turn === "w" ? "White" : "Black";
        turnTextEl.style.backgroundColor = message.turn === "w" ? "white" : kGreen;

        if (message.turn === "w") {
            turnButtonWhite.style.outlineColor = "black";
            turnButtonBlack.style.outlineColor = "transparent";
        } else {
            turnButtonWhite.style.outlineColor = "transparent";
            turnButtonBlack.style.outlineColor = "black";
        }

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
        document.body.style.borderWidth = "40px";
        document.body.style.borderStyle = "solid";
        document.body.style.padding = "20px";
        document.body.style.margin = "0px";

        const focusEl = document.createElement("div");
        focusEl.style.position = "fixed";
        focusEl.textContent = "Window does not have focus, keyboard will not work";
        focusEl.style.left = "0px";
        focusEl.style.top = "0px";
        focusEl.style.width = "100%";
        focusEl.style.textAlign = "center";
        focusEl.style.fontSize = "30px";
        focusEl.style.fontFamily = "sans-serif";
        document.body.appendChild(focusEl);

        const updateFocus = (hasFocus: boolean) => {
            focusEl.style.display = hasFocus ? "none" : "block";
            document.body.style.borderColor = hasFocus ? kGreen : kRed;
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
    style.backgroundColor = kRed;
    style.color = "black";
    style.fontFamily = "Impact, sans-serif";
    style.fontSize = "100px";
    style.padding = "20px";
    document.body.textContent = "This browser cannot connect to DGT boards. Use Google Chrome.";
};
