import * as Xebra from "xebra.js";
import { Signal } from "./signal";
import type { Max, MaxMessage } from "./api";
import { MaxConnectionStatus } from "./api";

export const setupMax = (): Max => {
    const xebraState = new Xebra.State({
        hostname: "127.0.0.1",
        port: 8086,
    });

    let connectionStatus = MaxConnectionStatus.Init;
    const connectionStatusSignal = new Signal<MaxConnectionStatus>();

    xebraState.on("connection_changed", (newState) => {
        const status: MaxConnectionStatus = (() => {
            switch (newState) {
                case Xebra.CONNECTION_STATES.INIT: {
                    return MaxConnectionStatus.Init;
                }
                case Xebra.CONNECTION_STATES.CONNECTING: {
                    return MaxConnectionStatus.Connecting;
                }
                case Xebra.CONNECTION_STATES.CONNECTED: {
                    return MaxConnectionStatus.Connected;
                }
                case Xebra.CONNECTION_STATES.CONNECTION_FAIL: {
                    return MaxConnectionStatus.ConnectionFailed;
                }
                case Xebra.CONNECTION_STATES.RECONNECTING: {
                    return MaxConnectionStatus.Reconnecting;
                }
                case Xebra.CONNECTION_STATES.DISCONNECTED: {
                    setTimeout(() => {
                        xebraState.connect();
                    }, 1000 * 3);
                    return MaxConnectionStatus.Disconnected;
                }
                default: {
                    throw new TypeError("default case");
                }
            }
        })();
        connectionStatus = status;
        connectionStatusSignal.notify(status);
    });

    const messageQueue: Readonly<MaxMessage>[] = [];
    const sendMessage = (message: MaxMessage) => {
        messageQueue.push(message);

        if (xebraState.connectionState !== Xebra.CONNECTION_STATES.CONNECTED) {
            return;
        }

        while (messageQueue.length > 0) {
            const queueMessage = messageQueue.shift();
            if (queueMessage !== undefined) {
                const serialized = JSON.stringify(message);
                xebraState.sendMessageToChannel("pgn", serialized);
            }
        }
    };

    const getConnectionStatus = () => {
        return connectionStatus;
    };

    xebraState.connect();

    return {
        sendMessage,
        getConnectionStatus,
        connectionStatusSignal,
    };
};
