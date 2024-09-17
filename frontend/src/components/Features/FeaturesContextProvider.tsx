import { ReactNode } from "react";
import { FeaturesContext } from "@components/Features/FeaturesContext.ts";
import useFeatures from "@hooks/useFeatures.ts";
import { Peer, Self } from "@utils/types.ts";

export interface FeaturesContextProviderProps {
  self: Self;
  peer: Peer;
  children?: ReactNode;
}

function FeaturesContextProvider({
  self,
  peer,
  children,
}: FeaturesContextProviderProps) {
  const {
    selfFeatures,
    toggleSelfAudioFeature,
    toggleSelfVideoFeature,
    peerFeatures,
    resetPeerFeatures,
    addFeaturesChannel,
  } = useFeatures(self, peer);

  return (
    <FeaturesContext.Provider
      value={{
        selfFeatures,
        toggleSelfAudioFeature,
        toggleSelfVideoFeature,
        peerFeatures,
        resetPeerFeatures,
        addFeaturesChannel,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
}

export default FeaturesContextProvider;
