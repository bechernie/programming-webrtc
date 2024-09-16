import useSignalingChannel, { RTCSignal } from "@hooks/useSignalingChannel.ts";
import exhaustiveSwitch from "@utils/exhaustiveSwitch.ts";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";

export interface RtcCallbacks {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
  ondatachannel: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => any) | null;
  onnegotiationneeded: (
    sendSignal: (signal: RTCSignal) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => ((this: RTCPeerConnection, ev: Event) => any) | null;
  onicecandidate: (
    sendSignal: (signal: RTCSignal) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
}

function useSetupRtcConnection(
  {
    onconnectionstatechange,
    ondatachannel,
    onnegotiationneeded,
    onicecandidate,
    ontrack,
  }: RtcCallbacks,
  onEstablishCall: () => void,
) {
  const { self, peer } = usePeerToPeerContext();

  function onConnect() {
    establishCallFeature();
  }

  function onDisconnect() {
    console.log("onDisconnect");
  }

  function onConnectedPeer() {
    self.isPolite = true;
  }

  function onDisconnectedPeer() {
    resetPeer();
    establishCallFeature();
  }

  async function onSignal(signal: RTCSignal) {
    switch (signal.type) {
      case "session": {
        const description = signal.description;

        const readyForOffer =
          !self.isMakingOffer &&
          (peer.connection.signalingState === "stable" ||
            self.isSettingRemoteAnswerPending);
        const offerCollision = description?.type === "offer" && !readyForOffer;
        self.isIgnoringOffer = !self.isPolite && offerCollision;

        if (self.isIgnoringOffer) {
          return;
        }

        self.isSettingRemoteAnswerPending = description?.type === "answer";
        if (description) {
          await peer.connection.setRemoteDescription(description);
        }
        self.isSettingRemoteAnswerPending = false;

        if (description?.type === "offer") {
          await peer.connection.setLocalDescription();
          sendSignal({
            type: "session",
            description: peer.connection.localDescription,
          });
        }
        break;
      }
      case "icecandidate": {
        const candidate = signal.candidate;

        try {
          if (candidate) {
            await peer.connection.addIceCandidate(candidate);
          }
        } catch (e) {
          if (
            !self.isIgnoringOffer &&
            candidate?.candidate.length &&
            candidate?.candidate.length > 1
          ) {
            console.error("Unable to add ICE candidate for peer:", e);
          }
        }
        break;
      }
      default:
        exhaustiveSwitch(signal);
    }
  }

  const { joinCall, leaveCall, sendSignal } = useSignalingChannel(
    onConnect,
    onDisconnect,
    onConnectedPeer,
    onDisconnectedPeer,
    onSignal,
  );

  function registerRtcCallbacks() {
    peer.connection.onconnectionstatechange = onconnectionstatechange;
    peer.connection.ondatachannel = ondatachannel;
    peer.connection.onnegotiationneeded = onnegotiationneeded(sendSignal);
    peer.connection.onicecandidate = onicecandidate(sendSignal);
    peer.connection.ontrack = ontrack;
  }

  function establishCallFeature() {
    registerRtcCallbacks();
    onEstablishCall();

    if (self.mediaStream) {
      addStreamingMedia(self.mediaStream);
    }
  }

  function addStreamingMedia(stream: MediaStream) {
    if (stream) {
      for (const track of stream.getTracks()) {
        peer.connection.addTrack(track, stream);
      }
    }
  }

  function resetPeer() {
    if (peer.refHtmlVideoElement.current) {
      peer.refHtmlVideoElement.current.srcObject = null;
    }
    peer.connection.close();
    peer.connection = new RTCPeerConnection(self.rtcConfig);
  }

  return {
    joinCall,
    leaveCall: () => {
      leaveCall();
      resetPeer();
    },
  };
}

export default useSetupRtcConnection;
