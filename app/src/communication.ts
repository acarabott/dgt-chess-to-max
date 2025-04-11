import * as Xebra from "xebra.js";
import { Signal } from "./signal";
import { MaxConnectionStatus } from "./api";

export const setupCommunication = () => {
    const xebraState = new Xebra.State({
        hostname: "127.0.0.1",
        port: 8086,
    });

    let connectionStatus = MaxConnectionStatus.Init;
    const statusSignal = new Signal<MaxConnectionStatus>();

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
        statusSignal.notify(status);
    });

    const pgnQueue: string[] = [];
    const sendPGN = (pgn: string) => {
        pgnQueue.push(pgn);

        if (xebraState.connectionState !== Xebra.CONNECTION_STATES.CONNECTED) {
            return;
        }

        while (pgnQueue.length > 0) {
            const pgnMessage = pgnQueue.shift();
            if (pgnMessage !== undefined) {
                const message = {
                    pgn: pgnMessage,
                    timestamp: Date.now(),
                };
                const serialized = JSON.stringify(message);
                xebraState.sendMessageToChannel("pgn", serialized);
            }
        }
    };

    const getStatus = () => {
        return connectionStatus;
    };

    xebraState.connect();

    return {
        sendPGN,
        getStatus,
        statusSignal,
    };
};
