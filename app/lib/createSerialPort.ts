export const isWebSerialSupport = (): boolean => {
    return (navigator.serial as unknown) !== undefined;
};

export const createSerialPort = async (
    baudRate: number,
    filters: SerialPortFilter[],
    onDisconnect: () => void,
): Promise<SerialPort | Error> => {
    if (!isWebSerialSupport()) {
        return new Error("This browser does not support the Web Serial API, use Google Chrome.");
    }

    try {
        const serialPort = await navigator.serial.requestPort({ filters });
        serialPort.addEventListener("disconnect", (_event) => {
            onDisconnect();
        });

        await serialPort.open({ baudRate });

        return serialPort;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        return new Error(`Could not open serial port. Check no other browser tabs or applications are connected to it. ${errorMessage}`);
    }
};
