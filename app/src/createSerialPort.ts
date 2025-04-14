import { kDGTFilter } from "./api";
import { kDGTBaudRate } from "./constants";

export const createSerialPort = async (onDisconnect: () => void): Promise<SerialPort | Error> => {
    if ((navigator.serial as unknown) === undefined) {
        return new Error("This browser does not support the Web Serial API, use Google Chrome.");
    }

    try {
        const serialPort = await navigator.serial.requestPort({ filters: [kDGTFilter] });
        serialPort.addEventListener("disconnect", (_event) => {
            onDisconnect();
        });

        await serialPort.open({ baudRate: kDGTBaudRate });

        return serialPort;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        return new Error(`Could not open serial port: ${errorMessage}`);
    }
};
