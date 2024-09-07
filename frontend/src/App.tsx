import styles from "./App.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import Video from "@components/Video/Video.tsx";
import useSignalingChannel, { RTCSignal } from "@hooks/useSignalingChannel.ts";
import { useEffect, useRef } from "react";
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
  });

  const selfVideoElement = useRef<HTMLVideoElement>(null);

  const peer = useRef<Peer>({
    connection: new RTCPeerConnection(self.current.rtcConfig),
  });

  const peerVideoElement = useRef<HTMLVideoElement>(null);

  function onConnect() {
    establishCallFeature();
  }

  function onDisconnect() {
    console.log("onDisconnect");
  }

  function onConnectedPeer() {
    self.current.isPolite = true;
  }

  function onDisconnectedPeer() {
    resetPeer();
    establishCallFeature();
  }

  async function onSignal(signal: RTCSignal) {
    switch (signal.type) {
      case "session": {
        const readyForOffer =
          !self.current.isMakingOffer &&
          (peer.current.connection.signalingState === "stable" ||
            self.current.isSettingRemoteAnswerPending);
        const offerCollision =
          signal.description?.type === "offer" && !readyForOffer;
        self.current.isIgnoringOffer = !self.current.isPolite && offerCollision;

        if (self.current.isIgnoringOffer) {
          return;
        }

        self.current.isSettingRemoteAnswerPending =
          signal.description?.type === "answer";
        if (signal.description) {
          await peer.current.connection.setRemoteDescription(
            signal.description,
          );
        }
        self.current.isSettingRemoteAnswerPending = false;

        if (signal.description?.type === "offer") {
          await peer.current.connection.setLocalDescription();
          sendSignal({
            type: "session",
            description: peer.current.connection.localDescription,
          });
        }
        break;
      }
      case "icecandidate": {
        try {
          if (signal.candidate) {
            await peer.current.connection.addIceCandidate(signal.candidate);
          }
        } catch (e) {
          if (
            !self.current.isIgnoringOffer &&
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
        self.current.mediaConstraints,
      );
      stream.addTrack(media.getTracks()[0]);
      if (selfVideoElement.current) {
        selfVideoElement.current.srcObject = stream;
      }
      self.current.mediaStream = stream;
    })();
  }, []);

  function registerRtcCallbacks() {
    peer.current.connection.onnegotiationneeded = async function () {
      self.current.isMakingOffer = true;
      console.log("Attempting to make an offer...");
      await peer.current.connection.setLocalDescription();
      sendSignal({
        type: "session",
        description: peer.current.connection.localDescription,
      });
      self.current.isMakingOffer = false;
    };
    peer.current.connection.onicecandidate = function ({ candidate }) {
      console.log("Attempting to handle an ICE candidate...");
      sendSignal({ type: "icecandidate", candidate: candidate });
    };
    peer.current.connection.ontrack = function ({ streams: [stream] }) {
      console.log("Attempting to display media from peer...");
      if (peerVideoElement.current) {
        peerVideoElement.current.srcObject = stream;
      }
    };
  }

  function establishCallFeature() {
    registerRtcCallbacks();

    if (self.current.mediaStream) {
      addStreamingMedia(self.current.mediaStream);
    }
  }

  function addStreamingMedia(stream: MediaStream) {
    if (stream) {
      for (const track of stream.getTracks()) {
        peer.current.connection.addTrack(track, stream);
      }
    }
  }

  function resetPeer() {
    if (peerVideoElement.current) {
      peerVideoElement.current.srcObject = null;
    }
    peer.current.connection.close();
    peer.current.connection = new RTCPeerConnection(self.current.rtcConfig);
  }

  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome to room {window.location.hash}</h1>
        <JoinCallButton
          joinCall={joinCall}
          leaveCall={() => {
            leaveCall();
            resetPeer();
          }}
        />
      </Header>
      <section>
        <h2 className={styles.preserveAccessibility}>Streaming Videos</h2>
        <Video
          ref={selfVideoElement}
          poster={"placeholder.png"}
          className={styles.self}
        />
        <Video
          ref={peerVideoElement}
          muted={false}
          poster={"placeholder.png"}
        />
      </section>
    </main>
  );
}

export default App;
