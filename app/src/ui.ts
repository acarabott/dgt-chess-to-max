import type { BoardMessage, ErrorHandler } from "./api";
import { MaxConnectionStatus } from "./api";
import { prettyPrint } from "./prettyPrint";
import type { Listener } from "./Signal";

export type StartAction = () => void | Promise<void>;

export const createUI = () => {
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
        maxConnectionEl.textContent = getConnectionStatusText(status);
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

const getConnectionStatusText = (status: MaxConnectionStatus) => {
    switch (status) {
        case MaxConnectionStatus.Init:
            return "Max: Initialized";
        case MaxConnectionStatus.Connecting:
            return "Max: Connecting";
        case MaxConnectionStatus.Connected:
            return "Max: Connected";
        case MaxConnectionStatus.ConnectionFailed:
            return "Max: Connection Failed";
        case MaxConnectionStatus.Reconnecting:
            return "Max: Reconnecting";
        case MaxConnectionStatus.Disconnected:
            return "Max: Disconnected. Re-open Max and make sure there is a mira.frame object and a mira.channel object with the name 'pgn'";
    }
};
