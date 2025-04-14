import type { Listener, Signal } from "./Signal";

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

export enum DGTMessageCode {
    SendReset = 0x40,
    SendUpdateBoard = 0x44,
    GetBoardState = 0x42,
    GetSerialNumber = 0x45,
    GetVersion = 0x4d,
}

export const kDGTMessageHeaderLength = 3;
export const kDGTMessageLengthBoard = kDGTMessageHeaderLength + 64;
export const kDGTMessageLengthSerialNumber = kDGTMessageHeaderLength + 5;
export const kDGTMessageLengthVersion = kDGTMessageHeaderLength + 2;

export const kDGTMessageBufferLength = 5;

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

export interface LiveBoardState {
    boardEncoded: Uint8Array;
    isGameLegal: boolean;
}

export interface BoardMessage {
    fullPgn: string;
    newMovePgn: string;
    fen: string;
    boardEncoded: Uint8Array;
    boardAscii: string;
    gameAscii: string;
    message: string;
    isGameLegal: boolean;
    ok: boolean;
}

export interface BoardUpdate {
    message: BoardMessage | undefined;
    liveState: LiveBoardState | undefined;
}

export interface Max {
    getConnectionStatus: () => MaxConnectionStatus;
    connectionStatusSignal: Signal<MaxConnectionStatus>;
    sendMessage: (message: BoardMessage) => void;
}

export interface DGT {
    signal: Signal<BoardMessage>;
}

export interface AppContext {
    max: Max;
    dgt: DGT;
}

export const kDGTFilter: SerialPortFilter = {
    usbVendorId: 1240,
    usbProductId: 10,
};

export type StartAction = () => void | Promise<void>;
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
