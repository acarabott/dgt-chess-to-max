import type { AppContext, ErrorHandler } from "./api";
import { MaxConnectionStatus } from "./api";
import { prettyPrint } from "./prettyPrint";

export const createSetupUI = (onStart: (onError: ErrorHandler) => void) => {
    const el = document.createElement("div");

    let addError: ErrorHandler;

    const startEl = document.createElement("button");
    {
        el.appendChild(startEl);
        startEl.textContent = "Start";
        startEl.addEventListener("click", () => {
            onStart(addError);
        });
    }

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
        };
    }

    return {
        el,
        addError,
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

export const createChessUI = (context: AppContext) => {
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

    context.dgt.signal.listen((message) => {
        boardEl.value = prettyPrint(message.ascii);
    });

    const connectionEl = document.createElement("div");
    containerEl.appendChild(connectionEl);
    const updateConnectionEl = (status: MaxConnectionStatus) => {
        connectionEl.textContent = getConnectionStatusText(status);
    };
    updateConnectionEl(context.max.getConnectionStatus());

    context.max.connectionStatusSignal.listen((status) => {
        updateConnectionEl(status);
    });

    return {
        el: containerEl,
    };
};
