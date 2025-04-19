import type { Color } from "chess.js";
import type { Listener, Signal } from "../lib/Signal";

export interface DGTBoard {
    reset(): Promise<boolean>;
    getBoardData(): Promise<Uint8Array | undefined>;
    getSerialNumber(): Promise<string | undefined>;
    getVersion(): Promise<string | undefined>;
    close(): Promise<void>;
}

export enum DGTChessPiece {
    None = 0x0,
    WhitePawn = 0x1,
    WhiteRook = 0x2,
    WhiteKnight = 0x3,
    WhiteBishop = 0x4,
    WhiteKing = 0x5,
    WhiteQueen = 0x6,
    BlackPawn = 0x7,
    BlackRook = 0x8,
    BlackKnight = 0x9,
    BlackBishop = 0xa,
    BlackKing = 0xb,
    BlackQueen = 0xc,
}

export enum MaxConnectionStatus {
    Init = "Init",
    Connecting = "Connecting",
    Connected = "Connected",
    ConnectionFailed = "ConnectionFailed",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected",
}

export interface BoardState {
    encoded: Uint8Array;
    fen: string;
    ascii: string;
}

export interface BoardMessage {
    boardAscii: string;
    boardEncoded: Uint8Array;
    boardFen: string;
    gameFullPgn: string;
    gameAscii: string;
    gameFen: string;
    isGameLegal: boolean;
    message: string;
    newMovePgn: string;
    ok: boolean;
    turn: Color;
}

export interface Max {
    getConnectionStatus: () => MaxConnectionStatus;
    connectionStatusSignal: Signal<MaxConnectionStatus>;
    sendMessage: (message: BoardMessage) => void;
}

export interface BoardSignals {
    boardSignal: Signal<BoardMessage>;
    disconnectSignal: Signal<void>;
}

export interface AppContext {
    max: Max;
    dgt: BoardSignals;
}

export const kDGTFilter: SerialPortFilter = {
    usbVendorId: 1240,
    usbProductId: 10,
};

export type StartAction = (simulate: boolean) => void | Promise<void>;
export interface Colors {
    bg: string;
    fg: string;
}

export type AddError = (message: string, html?: HTMLElement) => void;

export interface UI {
    el: HTMLElement;
    addError: AddError;
    hideStartButton: () => void;
    boardListener: Listener<BoardMessage>;
    maxConnectionListener: Listener<MaxConnectionStatus>;
}
