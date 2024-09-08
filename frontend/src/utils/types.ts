export interface Self {
  rtcConfig?: RTCConfiguration;
  isPolite: boolean;
  isMakingOffer: boolean;
  isIgnoringOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  mediaConstraints: MediaStreamConstraints;
  mediaStream?: MediaStream;
  messageQueue: string[];
}

export interface Peer {
  connection: RTCPeerConnection;
  chatChannel?: RTCDataChannel;
}
