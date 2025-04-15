// /* eslint-disable no-console */
// import { SerialPort } from "serialport";
// import type { DGTBoard } from "./api";
// import { DGTMessageCode, kDGTMessageLengthVersion } from "./api";
// import { parseVersionMessage } from "./board-shared";

// // TODO SerialPortMock exists....

// export class BoardNode implements DGTBoard {
//     serialPort: SerialPort;

//     constructor(path: string) {
//         this.serialPort = new SerialPort({ path, baudRate: 9600 }, (err) => {
//             if (err !== null) {
//                 console.error("Error opening port: ", err);
//             }
//         });
//     }

//     async reset(): Promise<boolean> {
//         await this.write(DGTMessageCode.SendReset);
//         return true;
//     }

//     async getBoardState(): Promise<Uint8Array | undefined> {
//         await this.write(DGTMessageCode.GetBoardState);
//         const message = await this.read(kDGTMessageLengthVersion);
//         return message;
//     }

//     async getSerialNumber(): Promise<string | undefined> {
//         await this.write(DGTMessageCode.GetSerialNumber);
//         const message = await this.read(kDGTMessageLengthVersion);
//         if (message === undefined) {
//             return undefined;
//         }
//         const parsed = parseVersionMessage(message);
//         return parsed;
//     }

//     async getVersion(): Promise<string | undefined> {
//         await this.write(DGTMessageCode.GetVersion);

//         const message = await this.read(kDGTMessageLengthVersion);
//         if (message === undefined) {
//             return;
//         }
//         const parsed = parseVersionMessage(message);
//         return parsed;
//     }

//     async write(messageCode: DGTMessageCode): Promise<void> {
//         return new Promise((resolve, reject) => {
//             this.serialPort.write(new Uint8Array([messageCode]), undefined, (err) => {
//                 if (err !== null && err !== undefined) {
//                     reject(err);
//                 }
//             });
//             this.serialPort.drain((err) => {
//                 if (err !== null) {
//                     reject(err);
//                     console.error("Error draining port: ", err);
//                 }
//             });
//             resolve();
//         });
//     }

//     async read(messageLength: number): Promise<Uint8Array | undefined> {
//         if (this.serialPort.port === undefined) {
//             console.error("Serial port is not open");
//             return undefined;
//         }

//         await this.write(DGTMessageCode.SendUpdateBoard);

//         let offset = 0;
//         const buffer = new Uint8Array(messageLength);
//         while (offset < messageLength) {
//             const numBytesToRead = messageLength - offset;
//             const result = await this.serialPort.port.read(buffer, offset, numBytesToRead);
//             offset += result.bytesRead;
//         }
//         return buffer;
//     }

//     async close(): Promise<void> {
//         return new Promise((resolve, reject) => {
//             this.serialPort.close((err) => {
//                 if (err === null) {
//                     resolve();
//                 } else {
//                     reject(err);
//                 }
//             });
//         });
//     }
// }
