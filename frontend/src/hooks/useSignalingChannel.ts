import { useEffect } from "react";
import { prepareNamespace } from "@utils/prepareNamespace.ts";
import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000/";

const namespace = prepareNamespace(window.location.hash, true);

const socket = io(URL + namespace, {
  autoConnect: false,
});

export interface RTCSessionDescriptionSignal {
  type: "session";
  description: RTCSessionDescription | null;
}

export interface RTCIceCandidateSignal {
  type: "icecandidate";
  candidate: RTCIceCandidate | null;
}

export type RTCSignal = RTCSessionDescriptionSignal | RTCIceCandidateSignal;

function useSignalingChannel(
  onConnect: () => unknown,
  onDisconnect: () => unknown,
  onConnectedPeer: () => unknown,
  onDisconnectedPeer: () => unknown,
  onSignal: (signal: RTCSignal) => unknown,
) {
  useEffect(
    () => {
      socket.on("connect", onConnect);
      socket.on("connected peer", onConnectedPeer);
      socket.on("disconnect", onDisconnect);
      socket.on("disconnected peer", onDisconnectedPeer);
      socket.on("signal", onSignal);

      return () => {
        socket.off("connect", onConnect);
        socket.off("connected peer", onConnectedPeer);
        socket.off("disconnect", onDisconnect);
        socket.off("disconnected peer", onDisconnectedPeer);
        socket.off("signal", onSignal);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    joinCall: () => {
      socket.connect();
    },
    leaveCall: () => {
      socket.disconnect();
    },
    sendSignal: (signal: RTCSignal) => {
      socket.emit("signal", signal);
    },
  };
}

export default useSignalingChannel;
