import type { Chess, Color } from "chess.js";
import type { DGTBoard } from "./api";
import { kTestSequence } from "./testSequence";
import type { Signal } from "../lib/Signal";

export const createBoardSimulator = (
    game: Chess,
    moveKeyPressedSignal: Signal<Color>,
): DGTBoard => {
    let index = 0;

    const moveTime_s = 5;

    const tick = () => {
        index = Math.min(index + 1, kTestSequence.length - 1);
        setTimeout(
            () => {
                moveKeyPressedSignal.notify(game.turn());
            },
            1000 * moveTime_s * 0.5,
        );
        setTimeout(() => {
            tick();
        }, 1000 * moveTime_s);
    };
    tick();

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
