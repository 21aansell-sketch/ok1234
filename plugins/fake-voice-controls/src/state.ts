import { storage } from "@vendetta/plugin";

export const voiceState = {
    fakeMute: !!storage.fakeMute,
    fakeDeafen: !!storage.fakeDeafen,
};

export function setFakeMute(value: boolean) {
    voiceState.fakeMute = value;
    storage.fakeMute = value;
}

export function setFakeDeafen(value: boolean) {
    voiceState.fakeDeafen = value;
    storage.fakeDeafen = value;
}
