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

        addError = (message) => {
            const li = document.createElement("li");
            const now = new Date().toUTCString();
            const error = `${now}: ${message}`;
            li.textContent = error;
            errorListEl.prepend(li);
            clearErrorsEl.style.display = "block";

            showStartButton();
        };
    }

    const boardEl = document.createElement("textarea");
    {
        el.appendChild(boardEl);
        boardEl.readOnly = true;
        boardEl.rows = 14;
        boardEl.cols = 70;
        boardEl.style.fontFamily = "monospace";
        boardEl.style.fontSize = "30px";
    }
    const boardListener: Listener<BoardMessage> = (message) => {
        boardEl.value = prettyPrint(message.ascii);
    };

    const maxConnectionEl = document.createElement("div");
    el.appendChild(maxConnectionEl);
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

    return {
        el,
        setStartAction,
        addError,
        hideStartButton,
        boardListener,
        maxConnectionListener,
    };
};
