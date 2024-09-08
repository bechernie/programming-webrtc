import { RefObject } from "react";

export interface Self {
  rtcConfig?: RTCConfiguration;
  isPolite: boolean;
  isMakingOffer: boolean;
  isIgnoringOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  mediaConstraints: MediaStreamConstraints;
  mediaStream?: MediaStream;
  messageQueue: string[];
  refHtmlVideoElement: RefObject<HTMLVideoElement>;
}

export interface Peer {
  connection: RTCPeerConnection;
  chatChannel?: RTCDataChannel;
  refHtmlVideoElement: RefObject<HTMLVideoElement>;
}
