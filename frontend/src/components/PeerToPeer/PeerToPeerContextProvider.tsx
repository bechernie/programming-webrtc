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
  const [peerFeatures, setPeerFeatures] = useState<PeerToPeerFeatures>(
    DEFAULT_PEER_TO_PEER_FEATURES,
  );

  useEffect(() => {
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
  }, []);

  return (
    <PeerToPeerContext.Provider
      value={{
        self: self.current,
        selfFeatures,
        enableSelfAudioFeature: (enable: boolean) =>
          setSelfFeatures((prevState) => ({ ...prevState, audio: enable })),
        enableSelfVideoFeature: (enable: boolean) =>
          setSelfFeatures((prevState) => ({ ...prevState, video: enable })),
        resetSelfFeatures: () => setSelfFeatures(DEFAULT_PEER_TO_PEER_FEATURES),
        peer: peer.current,
        peerFeatures,
        enablePeerAudioFeature: (enable: boolean) =>
          setPeerFeatures((prevState) => ({ ...prevState, audio: enable })),
        enablePeerVideoFeature: (enable: boolean) =>
          setPeerFeatures((prevState) => ({ ...prevState, video: enable })),
        resetPeerFeatures: () => setSelfFeatures(DEFAULT_PEER_TO_PEER_FEATURES),
      }}
    >
      {children}
    </PeerToPeerContext.Provider>
  );
}

export default PeerToPeerContextProvider;
