import Board from "../dgt/Board.node.js";

const board = new Board("/dev/tty.usbmodem1101");

await board.reset();

setInterval(() => {
    void board.getPosition().then((position) => {
        console.log(position);
    });
}, 1000);
