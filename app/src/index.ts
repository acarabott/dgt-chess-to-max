import { kTestSequence } from "./testSequence";
import { parseBoardMessage } from "./parseBoardMessage";
import { createPGN } from "./createPGN";

/* 
TODO might need to handle messages from board coming in fragmented
TODO take moves one at a time
TODO buffering values until message is complete (or use DGT library)
TODO sending messages to MAX
*/

const fens = kTestSequence.map(parseBoardMessage);

createPGN(fens);
