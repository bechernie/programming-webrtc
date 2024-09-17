import displayStream from "@utils/displayStream.ts";
import { useState } from "react";
import {
  DEFAULT_PEER_TO_PEER_FEATURES,
  PeerToPeerFeatures,
} from "@components/Features/FeaturesContext.ts";
import { Peer, Self } from "@utils/types.ts";

function useFeatures(self: Self, peer: Peer) {
  const [selfFeatures, setSelfFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  const [peerFeatures, setPeerFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  function addFeaturesChannel() {
    peer.featuresChannel = peer.connection.createDataChannel("features", {
      negotiated: true,
      id: 110,
    });
    peer.featuresChannel.onopen = function () {
      console.log("Features channel opened");
      shareFeatures(selfFeatures);
    };
    peer.featuresChannel.onmessage = function (event) {
      const features = JSON.parse(event.data) as PeerToPeerFeatures;
      setPeerFeatures(features);
    };
    peer.featuresChannel.onclose = function () {
      console.log("Features channel closed");
    };
  }

  function shareFeatures(features: PeerToPeerFeatures) {
    peer.featuresChannel?.send(JSON.stringify(features));
  }

  return {
    selfFeatures,
    toggleSelfAudioFeature: () => {
      const audio = self.mediaTracks.audio;
      const enabledState = !audio?.enabled;
      if (audio) {
        audio.enabled = enabledState;
      }
      setSelfFeatures((prevState) => {
        const newFeatures = {
          ...prevState,
          audio: enabledState,
        };
        shareFeatures(newFeatures);
        return newFeatures;
      });
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
      setSelfFeatures((prevState) => {
        const newFeatures = {
          ...prevState,
          video: enabledState,
        };
        shareFeatures(newFeatures);
        return newFeatures;
      });
    },
    resetSelfFeatures: () => {
      if (self.mediaTracks.audio) {
        self.mediaTracks.audio.enabled = false;
      }
      if (self.mediaTracks.video) {
        self.mediaTracks.video.enabled = true;
        self.mediaStream.addTrack(self.mediaTracks.video);
      }
      setSelfFeatures(DEFAULT_PEER_TO_PEER_FEATURES);
    },
    peerFeatures,
    resetPeerFeatures: () => setPeerFeatures(DEFAULT_PEER_TO_PEER_FEATURES),
    addFeaturesChannel,
  };
}

export default useFeatures;
