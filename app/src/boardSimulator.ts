import type { DGTBoard } from "./api";
import { kTestSequence } from "./testSequence";

export const createBoardSimulator = (): DGTBoard => {
    let index = 0;

    setInterval(() => {
        index = Math.min(index + 1, kTestSequence.length - 1);
    }, 1000 * 3);

    return {
        getBoardData: (): Promise<Uint8Array> => {
            return new Promise((resolve) => resolve(kTestSequence[index]));
        },
        reset(): Promise<boolean> {
            return new Promise((resolve) => resolve(true));
        },
        getSerialNumber(): Promise<string | undefined> {
            return new Promise((resolve) => resolve("mock"));
        },
        getVersion(): Promise<string | undefined> {
            return new Promise((resolve) => resolve("1.0"));
        },
        close(): Promise<void> {
            return new Promise((resolve) => resolve());
        },
    };
};
