import type { AppContext } from "./api";
import { MaxConnectionStatus } from "./api";
import { prettyPrint } from "./prettyPrint";

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

export const createUI = (context: AppContext) => {
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

    context.dgt.asciiSignal.listen((ascii) => {
        boardEl.value = prettyPrint(ascii);
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
