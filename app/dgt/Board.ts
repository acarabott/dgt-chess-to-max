/* eslint-disable eslint-comments/no-use */
/* eslint no-labels: ["error", { "allowLoop": true }] */
/* global TransformStream */

import { ReturnSerialNr, ReturnVersion, SendBoard, SendReset, SendUpdateBoard } from "./Command";
import type { Command } from "./Command";

export class Board {
    #port: SerialPort;
    #writer;
    #readable: ReadableStream<Uint8Array>;
    #msgFieldUpdateTransformer;

    #serialNr?: string;
    #version?: string;

    #write = async (...args: unknown[]) => {
        await this.#writer.write(...args);
    };

    constructor(port: SerialPort) {
        this.#port = port;
        this.#writer = this.#port.writable.getWriter();
        this.#readable = this.#port.readable as ReadableStream<Uint8Array>;

        let buf = new Uint8Array(5);
        let pos = 0;
        this.#msgFieldUpdateTransformer = new TransformStream<Uint8Array, unknown>({
            transform(chunk, controller) {
                buf.set(chunk, pos);
                pos += chunk.length;
                if (pos === 5) {
                    controller.enqueue(new SendUpdateBoard().process(buf));
                    pos = 0;
                    buf = new Uint8Array(5);
                }
            },
        });
    }

    async reset() {
        await this.message(new SendReset());
        this.#serialNr = await this.message(new ReturnSerialNr());
        this.#version = await this.message(new ReturnVersion());

        return {
            serialNr: this.#serialNr,
            version: this.#version,
        };
    }

    async message<T>(cmd: Command<T>) {
        await this.#write(new Uint8Array([cmd.code]));

        if (cmd.length === 0) {
            return;
        }

        const reader = this.#readable.getReader();
        const message = new Uint8Array(cmd.length);
        let pos = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { value, done } = await reader.read();
            if (value === undefined) {
                continue;
            }
            message.set(value, pos);
            pos += value.length;

            if (done || pos === cmd.length) {
                reader.releaseLock();
                return cmd.process?.(message);
            }
        }
    }

    async getBoardState() {
        return await this.message(new SendBoard());
    }

    getReader() {
        void this.message(new SendUpdateBoard());
        const transform = this.#msgFieldUpdateTransformer;
        const stream = this.#port.readable.pipeThrough(transform);
        return stream.getReader();
    }

    get serialNr() {
        return this.#serialNr;
    }

    get version() {
        return this.#version;
    }

    static FILTERS = [{ usbVendorId: 0x0403, usbProductId: 0x6001 }];
}
