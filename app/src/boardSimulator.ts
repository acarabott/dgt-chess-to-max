import { kTestSequence } from "./testSequence";

export const createBoardSimulator = () => {
    let index = 0;

    setInterval(() => {
        index = Math.min(index + 1, kTestSequence.length - 1);
    }, 1000 * 3);

    return {
        getBoardState: (): Promise<Uint8Array> => {
            return new Promise((resolve) => resolve(kTestSequence[index]));
        },
    };
};
