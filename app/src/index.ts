// {
//     path: '/dev/tty.usbmodem1101',
//     manufacturer: 'DGT',
//     serialNumber: undefined,
//     pnpId: undefined,
//     locationId: '00110000',
//     vendorId: '04d8',
//     productId: '000a'
//   }

import { SerialPort } from "serialport";

const path = "/dev/tty.usbmodem1101";
const port = new SerialPort(path);

port.pause();
port.on("data", (data) => {
    console.log("data:", data);
});
