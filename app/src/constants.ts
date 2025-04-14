/**
 * How often to read the state of the DGT board
 * Empirically it takes about 500ms for the board to update
 * Very low intervals (20ms) cause serial port errors
 */
export const kDGTPollInterval_ms = 100;

/**
 * Baud rate to use for the Serial connection to the DGT board
 */
export const kDGTBaudRate = 9600;

/**
 * Name of the mira.channel in Max, for communication
 */
export const kMaxMiraChannel = "chess";

/**
 * If Max disconnects, the amount of time to wait before trying to reconnect
 */
export const kMaxReconnectionInterval_ms = 3000;
