import styles from "./App.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import Video from "@components/Video/Video.tsx";
import useNamespace from "@hooks/useNamespace.ts";
import useSignalingChannel from "@hooks/useSignalingChannel.ts";
import { useEffect, useRef, useState } from "react";

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
  const namespace = useNamespace();

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

  const peer: Peer = {
    connection: new RTCPeerConnection(self.rtcConfig),
  };

  const { joinCall, leaveCall, signal } = useSignalingChannel(
    namespace,
    function () {
      console.log("onConnect");
      establishCallFeature(self, peer);
    },
    function () {
      console.log("onConnectedPeer");
      setSelf({ ...self, isPolite: true });
    },
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
  }, []);

  function registerRtcCallbacks(self: Self, peer: Peer) {
    peer.connection.onnegotiationneeded = async function () {
      self.isMakingOffer = true;
      console.log("Attempting to make an offer...");
      await peer.connection.setLocalDescription();
      signal({
        description: peer.connection.localDescription,
      });
      self.isMakingOffer = false;
    };
    peer.connection.onicecandidate = function ({ candidate }) {
      console.log("Attempting to handle an ICE candidate...");
      signal({ candidate: candidate });
    };
    peer.connection.ontrack = function () {};
  }

  function addStreamingMedia(stream: MediaStream, peer: Peer) {
    if (stream) {
      for (const track of stream.getTracks()) {
        peer.connection.addTrack(track);
      }
    }
  }

  function establishCallFeature(self: Self, peer: Peer) {
    registerRtcCallbacks(self, peer);

    if (self.mediaStream) {
      addStreamingMedia(self.mediaStream, peer);
    }
  }

  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome to room #{namespace}</h1>
        <JoinCallButton joinCall={joinCall} leaveCall={leaveCall} />
      </Header>
      <section>
        <h2 className={styles.preserveAccessibility}>Streaming Videos</h2>
        <Video
          ref={selfRef}
          poster={"placeholder.png"}
          className={styles.self}
        />
        <Video muted={false} poster={"placeholder.png"} />
      </section>
    </main>
  );
}

export default App;
