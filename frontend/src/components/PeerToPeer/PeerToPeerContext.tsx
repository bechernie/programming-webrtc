import { Peer, Self } from "@utils/types.ts";
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

export interface PeerToPeerContext {
  self: Self;
  peer: Peer;
}

const PeerToPeerContext = createContext<PeerToPeerContext>(
  {} as PeerToPeerContext,
);

export function usePeerToPeerContext() {
  return useContext(PeerToPeerContext);
}

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
      audio: false,
    },
    mediaStream: undefined,
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
      const stream = new MediaStream();
      const media = await navigator.mediaDevices.getUserMedia(
        self.current.mediaConstraints,
      );
      stream.addTrack(media.getTracks()[0]);
      if (self.current.refHtmlVideoElement.current) {
        self.current.refHtmlVideoElement.current.srcObject = stream;
      }
      self.current.mediaStream = stream;
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
