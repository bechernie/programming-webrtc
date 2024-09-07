import styles from "./App.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import Video from "@components/Video/Video.tsx";
import useSignalingChannel, { RTCSignal } from "@hooks/useSignalingChannel.ts";
import { useEffect, useMemo, useRef, useState } from "react";
import exhaustiveSwitch from "@utils/exhaustiveSwitch.ts";

export interface Self {
  rtcConfig?: RTCConfiguration;
  isPolite: boolean;
  isMakingOffer: boolean;
  isIgnoringOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  mediaConstraints: MediaStreamConstraints;
  mediaStream?: MediaStream;
}

export interface Peer {
  connection: RTCPeerConnection;
}

function App() {
  const [self, setSelf] = useState<Self>({
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
  });

  const selfRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<HTMLVideoElement>(null);

  const peer: Peer = useMemo(
    () => ({
      connection: new RTCPeerConnection(self.rtcConfig),
    }),
    [self.rtcConfig],
  );

  function onConnect() {
    console.log("onConnect");
    establishCallFeature(self, peer);
  }

  function onDisconnect() {
    console.log("onDisconnect");
  }

  function onConnectedPeer() {
    console.log("onConnectedPeer");
    setSelf((prevState) => ({ ...prevState, isPolite: true }));
  }

  function onDisconnectedPeer() {
    console.log("onDisconnectedPeer");
  }

  async function onSignal(signal: RTCSignal) {
    switch (signal.type) {
      case "session": {
        const readyForOffer =
          !self.isMakingOffer &&
          (peer.connection.signalingState === "stable" ||
            self.isSettingRemoteAnswerPending);
        const offerCollision =
          signal.description?.type === "offer" && !readyForOffer;
        const isIgnoringOffer = !self.isPolite && offerCollision;
        setSelf((prevState) => {
          return {
            ...prevState,
            isIgnoringOffer: isIgnoringOffer,
          };
        });
        if (isIgnoringOffer) {
          return;
        }
        setSelf((prevState) => ({
          ...prevState,
          isSettingRemoteAnswerPending: signal.description?.type === "answer",
        }));
        await peer.connection.setRemoteDescription(signal.description!);
        setSelf((prevState) => ({
          ...prevState,
          isSettingRemoteAnswerPending: false,
        }));
        if (signal.description?.type === "offer") {
          await peer.connection.setLocalDescription();
          sendSignal({
            type: "session",
            description: peer.connection.localDescription,
          });
        }
        break;
      }
      case "icecandidate": {
        try {
          await peer.connection.addIceCandidate(signal.candidate!);
        } catch (e) {
          if (
            !self.isIgnoringOffer &&
            signal.candidate?.candidate.length &&
            signal.candidate?.candidate.length > 1
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

  useEffect(() => {
    (async function () {
      const stream = new MediaStream();
      const media = await navigator.mediaDevices.getUserMedia(
        self.mediaConstraints,
      );
      stream.addTrack(media.getTracks()[0]);
      if (selfRef.current) {
        selfRef.current.srcObject = stream;
      }
      setSelf((prevState) => ({ ...prevState, mediaStream: stream }));
    })();
  }, [self.mediaConstraints]);

  function registerRtcCallbacks(self: Self, peer: Peer) {
    peer.connection.onnegotiationneeded = async function () {
      setSelf({ ...self, isMakingOffer: true });
      console.log("Attempting to make an offer...");
      await peer.connection.setLocalDescription();
      sendSignal({
        type: "session",
        description: peer.connection.localDescription,
      });
      setSelf({ ...self, isMakingOffer: false });
    };
    peer.connection.onicecandidate = function ({ candidate }) {
      console.log("Attempting to handle an ICE candidate...");
      sendSignal({ type: "icecandidate", candidate: candidate });
    };
    peer.connection.ontrack = function ({ streams: [stream] }) {
      console.log("Attempting to display media from peer...");
      if (peerRef.current) {
        peerRef.current.srcObject = stream;
      }
    };
  }

  function establishCallFeature(self: Self, peer: Peer) {
    registerRtcCallbacks(self, peer);

    if (self.mediaStream) {
      addStreamingMedia(self.mediaStream, peer);
    }
  }

  function addStreamingMedia(stream: MediaStream, peer: Peer) {
    if (stream) {
      for (const track of stream.getTracks()) {
        peer.connection.addTrack(track);
      }
    }
  }

  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome to room #{window.location.hash}</h1>
        <JoinCallButton joinCall={joinCall} leaveCall={leaveCall} />
      </Header>
      <section>
        <h2 className={styles.preserveAccessibility}>Streaming Videos</h2>
        <Video
          ref={selfRef}
          poster={"placeholder.png"}
          className={styles.self}
        />
        <Video ref={peerRef} muted={false} poster={"placeholder.png"} />
      </section>
    </main>
  );
}

export default App;
