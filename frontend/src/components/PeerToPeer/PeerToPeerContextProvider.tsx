import { DEFAULT_MEDIA_TRACKS, Peer, Self } from "@utils/types.ts";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PEER_TO_PEER_FEATURES,
  PeerToPeerContext,
  PeerToPeerFeatures,
} from "./PeerToPeerContext";
import displayStream from "@utils/displayStream.ts";

function PeerToPeerContextProvider({ children }: { children?: ReactNode }) {
  const selfVideoElement = useRef<HTMLVideoElement>(null);

  const self = useRef<Self>({
    rtcConfig: undefined,
    isPolite: false,
    isMakingOffer: false,
    isIgnoringOffer: false,
    isSettingRemoteAnswerPending: false,
    mediaConstraints: {
      video: true,
      audio: true,
    },
    mediaTracks: DEFAULT_MEDIA_TRACKS,
    mediaStream: new MediaStream(),
    messageQueue: [],
    refHtmlVideoElement: selfVideoElement,
  });

  const peerVideoElement = useRef<HTMLVideoElement>(null);

  const peer = useRef<Peer>({
    connection: new RTCPeerConnection(self.current.rtcConfig),
    refHtmlVideoElement: peerVideoElement,
  });

  const [selfFeatures, setSelfFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [peerFeatures, _setPeerFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  useEffect(
    () => {
      (async function () {
        const media = await navigator.mediaDevices.getUserMedia(
          self.current.mediaConstraints,
        );

        self.current.mediaTracks.audio = media.getAudioTracks()[0];
        self.current.mediaTracks.video = media.getVideoTracks()[0];

        self.current.mediaTracks.audio.enabled = selfFeatures.audio;
        self.current.mediaTracks.video.enabled = selfFeatures.video;

        self.current.mediaStream.addTrack(self.current.mediaTracks.audio);
        self.current.mediaStream.addTrack(self.current.mediaTracks.video);

        displayStream(
          self.current.refHtmlVideoElement.current,
          self.current.mediaStream,
        );
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <PeerToPeerContext.Provider
      value={{
        self: self.current,
        selfFeatures,
        toggleSelfAudioFeature: () => {
          const audio = self.current.mediaTracks.audio;
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
          const video = self.current.mediaTracks.video;
          const enabledState = !video?.enabled;
          if (video) {
            video.enabled = enabledState;

            if (enabledState) {
              self.current.mediaStream.addTrack(video);
            } else {
              self.current.mediaStream = new MediaStream();
              if (self.current.mediaTracks.audio) {
                self.current.mediaStream.addTrack(
                  self.current.mediaTracks.audio,
                );
              }

              displayStream(
                self.current.refHtmlVideoElement.current,
                self.current.mediaStream,
              );
            }
          }
          setSelfFeatures((prevState) => ({
            ...prevState,
            video: enabledState,
          }));
        },
        resetSelfFeatures: () => setSelfFeatures(DEFAULT_PEER_TO_PEER_FEATURES),
        peer: peer.current,
        peerFeatures,
        resetPeerFeatures: () => setSelfFeatures(DEFAULT_PEER_TO_PEER_FEATURES),
      }}
    >
      {children}
    </PeerToPeerContext.Provider>
  );
}

export default PeerToPeerContextProvider;
