import { Peer, Self } from "@utils/types.ts";
import { createContext, useContext } from "react";

export interface PeerToPeerFeatures {
  audio: boolean;
  video: boolean;
}

export interface PeerToPeerContext {
  self: Self;
  selfFeatures: PeerToPeerFeatures;
  enableSelfAudioFeature: (enable: boolean) => void;
  enableSelfVideoFeature: (enable: boolean) => void;
  resetSelfFeatures: () => void;
  peer: Peer;
  peerFeatures: PeerToPeerFeatures;
  enablePeerAudioFeature: (enable: boolean) => void;
  enablePeerVideoFeature: (enable: boolean) => void;
  resetPeerFeatures: () => void;
}

export const DEFAULT_PEER_TO_PEER_FEATURES: PeerToPeerFeatures = {
  audio: false,
  video: true,
};

export const PeerToPeerContext = createContext<PeerToPeerContext>(
  {} as PeerToPeerContext,
);

export function usePeerToPeerContext() {
  return useContext(PeerToPeerContext);
}
