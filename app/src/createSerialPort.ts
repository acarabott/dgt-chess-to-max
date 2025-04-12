import type { ErrorHandler } from "./api";
import { kDGTFilter } from "./api";
import { kDGTBaudRate } from "./constants";

export const createSerialPort = async (onError: ErrorHandler): Promise<SerialPort | undefined> => {
    if ((navigator.serial as unknown) === undefined) {
        onError("This browser does not support the Web Serial API, use Google Chrome.");
        return;
    }

    try {
        const serialPort = await navigator.serial.requestPort({ filters: [kDGTFilter] });
        serialPort.addEventListener("disconnect", (_event) => {
            onError("Board was disconnected!");
        });

        await serialPort.open({ baudRate: kDGTBaudRate });

        return serialPort;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        onError(`Could not open serial port: ${errorMessage}`);
        return undefined;
    }
};
