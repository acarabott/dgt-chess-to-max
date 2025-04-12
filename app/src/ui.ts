import type { BoardMessage, Colors, ErrorHandler, StartAction, UI } from "./api";
import { MaxConnectionStatus } from "./api";
import { kMaxMiraChannel } from "./constants";
import { prettyPrint } from "./prettyPrint";
import type { Listener } from "./Signal";

export const createUI = (): UI => {
    const el = document.createElement("div");

    let addError: ErrorHandler;

    let startAction: StartAction = () => {
        // noop
    };
    const setStartAction = (action: StartAction) => {
        startAction = action;
    };

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
        addError = (message) => {
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
            li.textContent = error;
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
        liveBoardEl.value = prettyPrint(message.ascii);
        previousLegalBoardEl.value = prettyPrint(message.previousLegalAsciiPosition);

        appendMaxMessage(message);

        if (!message.ok) {
            addError(message.message);
        }
    };

    return {
        el,
        setStartAction,
        addError,
        hideStartButton,
        boardListener,
        maxConnectionListener,
    };
};
