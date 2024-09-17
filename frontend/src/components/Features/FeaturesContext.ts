import { createContext, useContext } from "react";

export interface PeerToPeerFeatures {
  audio: boolean;
  video: boolean;
}

export const DEFAULT_PEER_TO_PEER_FEATURES: PeerToPeerFeatures = {
  audio: false,
  video: true,
};

export interface FeaturesContext {
  selfFeatures: PeerToPeerFeatures;
  toggleSelfAudioFeature: () => void;
  toggleSelfVideoFeature: () => void;
  peerFeatures: PeerToPeerFeatures;
  resetPeerFeatures: () => void;
  addFeaturesChannel: () => void;
}

export const FeaturesContext = createContext<FeaturesContext>(
  {} as FeaturesContext,
);

export function useFeaturesContext() {
  return useContext(FeaturesContext);
}
