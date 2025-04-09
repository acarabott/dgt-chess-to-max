import { kDGTMessageHeaderLength } from "./api";

export const parseSerialNumberMessage = (message: Readonly<Uint8Array>) => {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(message.slice(kDGTMessageHeaderLength));
};

export const parseVersionMessage = (message: Readonly<Uint8Array>) => {
    const [major, minor] = message.slice(kDGTMessageHeaderLength);
    const version = `${major}.${minor}`;
    return version;
};
