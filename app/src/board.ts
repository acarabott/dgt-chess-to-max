/* eslint-disable no-console */
export enum MessageCode {
    SendReset = 0x40,
    SendUpdateBoard = 0x44,
    GetBoardState = 0x42,
    GetSerialNumber = 0x45,
    GetVersion = 0x4d,
}

const kMessageHeaderLength = 3;
const kBoardMessageLength = kMessageHeaderLength + 64;
const kMessageLengthSerialNumber = kMessageHeaderLength + 5;
const kMessageLengthVersion = kMessageHeaderLength + 2;

const createTransformer = () => {
    const inputBuffer = new Uint8Array(5);
    let inputBufferIndex = 0;

    const transformer = new TransformStream<Uint8Array, Uint8Array>({
        transform: (chunk, controller) => {
            let remaining = chunk.length;
            while (remaining > 0) {
                const sliceLength = inputBuffer.length - inputBufferIndex;
                remaining -= sliceLength;

                const slice = chunk.slice(0, sliceLength);
                inputBuffer.set(slice, inputBufferIndex);
                inputBufferIndex += sliceLength;

                const haveFullBuffer = inputBufferIndex === inputBuffer.length;
                if (haveFullBuffer) {
                    controller.enqueue(new Uint8Array(inputBuffer));
                    inputBufferIndex = 0;
                    inputBuffer.fill(0);
                }
            }
        },
    });

    return transformer;
};

export class BoardBrowser {
    port: SerialPort;
    msgFieldUpdateTransformer = createTransformer();

    constructor(port: SerialPort) {
        this.port = port;
    }

    async reset() {
        return this.write(MessageCode.SendReset);
    }

    async getBoardState(): Promise<Uint8Array | undefined> {
        const didWrite = await this.write(MessageCode.GetBoardState);
        if (!didWrite) {
            return;
        }

        const boardState = await this.read(kBoardMessageLength);
        return boardState;
    }

    async getSerialNumber(): Promise<string | undefined> {
        const didWrite = await this.write(MessageCode.GetSerialNumber);
        if (!didWrite) {
            return;
        }

        const message = await this.read(kMessageLengthSerialNumber);
        if (message === undefined) {
            return;
        }

        const decoder = new TextDecoder("utf-8");
        return decoder.decode(message.slice(kMessageHeaderLength));
    }

    async getVersion() {
        const didWrite = await this.write(MessageCode.GetVersion);
        if (!didWrite) {
            return;
        }

        const message = await this.read(kMessageLengthVersion);
        if (message === undefined) {
            return;
        }
        const major = message[3];
        const minor = message[4];
        const version = `${major}.${minor}`;
        return version;
    }

    async write(messageCode: MessageCode): Promise<boolean> {
        if (this.port.writable === null) {
            console.error("port is not writable");
            return false;
        }

        try {
            await this.port.writable.getWriter().write(new Uint8Array([messageCode]));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async read(messageLength: number): Promise<Uint8Array | undefined> {
        if (this.port.readable === null) {
            console.error("port is not readable");
            return undefined;
        }

        const didWrite = await this.write(MessageCode.SendUpdateBoard);
        if (!didWrite) {
            console.error("Failed to write update message to port");
            return undefined;
        }

        let reader;
        try {
            reader = this.port.readable.pipeThrough(this.msgFieldUpdateTransformer).getReader();
        } catch (error) {
            console.error(error);
            return;
        }

        const message = new Uint8Array(messageLength);
        let index = 0;
        let isReading = true;

        while (isReading) {
            let result: ReadableStreamReadResult<Uint8Array>;

            try {
                result = await reader.read();
            } catch (error) {
                console.error(error);
                continue;
            }

            const { value, done } = result;

            if (value !== undefined) {
                message.set(value, index);
                index += value.length;
            }

            if (done || index === messageLength) {
                isReading = false;
            }
        }

        try {
            reader.releaseLock();
        } catch (error: unknown) {
            console.error("Reader is not a ReadableStreamDefaultReader.", error);
        }

        return message;
    }
}
