import { RefObject } from "react";
import { MessageEnvelope } from "@hooks/useChat.ts";

export interface MediaTracks {
  audio?: MediaStreamTrack;
  video?: MediaStreamTrack;
}

export const DEFAULT_MEDIA_TRACKS: MediaTracks = {};

export interface Self {
  rtcConfig?: RTCConfiguration;
  isPolite: boolean;
  isMakingOffer: boolean;
  isIgnoringOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  mediaConstraints: MediaStreamConstraints;
  mediaTracks: MediaTracks;
  mediaStream: MediaStream;
  messageEnvelopeQueue: MessageEnvelope[];
  refHtmlVideoElement: RefObject<HTMLVideoElement>;
}

export interface Peer {
  connection: RTCPeerConnection;
  chatChannel: RTCDataChannel;
  featuresChannel?: RTCDataChannel;
  refHtmlVideoElement: RefObject<HTMLVideoElement>;
}
