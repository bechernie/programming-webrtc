import { DEFAULT_MEDIA_TRACKS, Peer, Self } from "@utils/types.ts";
import { ReactNode, useEffect, useRef } from "react";
import { PeerToPeerContext } from "./PeerToPeerContext";
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

  useEffect(() => {
    (async function () {
      const media = await navigator.mediaDevices.getUserMedia(
        self.current.mediaConstraints,
      );

      self.current.mediaTracks.audio = media.getAudioTracks()[0];
      self.current.mediaTracks.video = media.getVideoTracks()[0];

      self.current.mediaTracks.audio.enabled = false;
      self.current.mediaTracks.video.enabled = true;

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
        peer: peer.current,
      }}
    >
      {children}
    </PeerToPeerContext.Provider>
  );
}

export default PeerToPeerContextProvider;
