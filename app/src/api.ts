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
