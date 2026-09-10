import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { after, before } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";

import Settings from "./Settings";
import { voiceState } from "./state";

type SocketLike = {
    send?: (op: number, data: any, ...args: any[]) => any;
    __fakeVoiceWrapped?: boolean;
    __fakeVoiceOriginalSend?: Function;
};

const state = voiceState;

let unpatchGetSocket: (() => void) | null = null;
let unpatchMute: (() => void) | null = null;
let unpatchDeaf: (() => void) | null = null;

function wrapSocket(socket: SocketLike | null | undefined) {
    if (!socket?.send || socket.__fakeVoiceWrapped) return;

    const original = socket.send;
    socket.__fakeVoiceOriginalSend = original;
    socket.__fakeVoiceWrapped = true;

    socket.send = function (op: number, data: any, ...args: any[]) {
        if (op === 4 && data && (state.fakeMute || state.fakeDeafen)) {
            data = {
                ...data,
                self_mute: state.fakeMute ? true : data.self_mute,
                self_deaf: state.fakeDeafen ? true : data.self_deaf,
            };
        }
        return original.call(this, op, data, ...args);
    };
}

function patchSocketProvider() {
    const ws = findByProps("getSocket");
    if (!ws?.getSocket) return;

    wrapSocket(ws.getSocket());

    unpatchGetSocket = after("getSocket", ws, (_args: any[], socket: SocketLike) => {
        wrapSocket(socket);
        return socket;
    });
}

/*
 * Discord's local media engine can be found by its mute/deafen methods.
 * When fake mode is enabled, force the local engine to remain unmuted/undeafened.
 * These hooks are intentionally defensive because Discord renames internal modules.
 */
function patchMediaEngine() {
    const media = findByProps("setSelfMute", "setSelfDeaf");
    if (!media) return;

    unpatchMute = before("setSelfMute", media, (args: any[]) => {
        return state.fakeMute ? [false] : args;
    });

    unpatchDeaf = before("setSelfDeaf", media, (args: any[]) => {
        return state.fakeDeafen ? [false] : args;
    });
}

export default {
    onLoad: () => {
        patchSocketProvider();
        patchMediaEngine();
        logger.log("[Fake Voice Controls] loaded");
    },

    onUnload: () => {
        unpatchGetSocket?.();
        unpatchMute?.();
        unpatchDeaf?.();
        unpatchGetSocket = null;
        unpatchMute = null;
        unpatchDeaf = null;
        logger.log("[Fake Voice Controls] unloaded");
    },

    settings: Settings,
};
