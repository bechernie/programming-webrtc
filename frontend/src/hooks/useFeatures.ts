import displayStream from "@utils/displayStream.ts";
import { useState } from "react";
import {
  DEFAULT_PEER_TO_PEER_FEATURES,
  PeerToPeerFeatures,
} from "@components/Features/FeaturesContext.ts";
import { Self } from "@utils/types.ts";

function useFeatures(self: Self) {
  const [selfFeatures, setSelfFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [peerFeatures, _setPeerFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  return {
    selfFeatures,
    toggleSelfAudioFeature: () => {
      const audio = self.mediaTracks.audio;
      const enabledState = !audio?.enabled;
      if (audio) {
        audio.enabled = enabledState;
      }
      setSelfFeatures((prevState) => ({
        ...prevState,
        audio: enabledState,
      }));
    },
    toggleSelfVideoFeature: () => {
      const video = self.mediaTracks.video;
      const enabledState = !video?.enabled;
      if (video) {
        video.enabled = enabledState;

        if (enabledState) {
          self.mediaStream.addTrack(video);
        } else {
          self.mediaStream = new MediaStream();
          if (self.mediaTracks.audio) {
            self.mediaStream.addTrack(self.mediaTracks.audio);
          }

          displayStream(self.refHtmlVideoElement.current, self.mediaStream);
        }
      }
      setSelfFeatures((prevState) => ({
        ...prevState,
        video: enabledState,
      }));
    },
    peerFeatures,
    resetPeerFeatures: () => setSelfFeatures(DEFAULT_PEER_TO_PEER_FEATURES),
  };
}

export default useFeatures;
