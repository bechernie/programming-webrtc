import { ReactNode } from "react";
import { FeaturesContext } from "@components/Features/FeaturesContext.ts";
import useFeatures from "@hooks/useFeatures.ts";
import { Self } from "@utils/types.ts";

export interface FeaturesContextProviderProps {
  self: Self;
  children?: ReactNode;
}

function FeaturesContextProvider({
  self,
  children,
}: FeaturesContextProviderProps) {
  const {
    selfFeatures,
    toggleSelfAudioFeature,
    toggleSelfVideoFeature,
    resetPeerFeatures,
  } = useFeatures(self);

  return (
    <FeaturesContext.Provider
      value={{
        selfFeatures,
        toggleSelfAudioFeature,
        toggleSelfVideoFeature,
        resetPeerFeatures,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
}

export default FeaturesContextProvider;
