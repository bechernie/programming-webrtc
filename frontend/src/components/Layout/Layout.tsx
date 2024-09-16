import styles from "./Layout.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import globals from "@src/Globals.module.css";
import Chat from "@components/Chat/Chat.tsx";
import { useState } from "react";
import Self from "@components/Self/Self.tsx";
import Peer from "@components/Peer/Peer.tsx";
import usePeerToPeerCall from "@hooks/useSetupRtcConnection.ts";
import { RTCSignal } from "@hooks/useSignalingChannel.ts";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";
import { useChatContext } from "@components/Chat/ChatContext.ts";
import displayStream from "@utils/displayStream.ts";
import Button from "@components/Button/Button.tsx";

function Layout() {
  const {
    self,
    peer,
    selfFeatures,
    toggleSelfAudioFeature,
    toggleSelfVideoFeature,
  } = usePeerToPeerContext();

  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>();

  const [peerFilter, setPeerFilter] = useState("filter-none");

  function onconnectionstatechange() {
    const connectionState = peer.connection.connectionState;
    console.log(`Connection state is now: ${connectionState}`);
    setConnectionState(connectionState);
  }

  function ondatachannel({ channel }: RTCDataChannelEvent) {
    const label = channel.label;
    if (label.startsWith("filter-")) {
      setPeerFilter(label);
      channel.onopen = function () {
        channel.close();
      };
    } else {
      console.log(
        `Opened ${channel.label} channel with an ID of ${channel.id}`,
      );
    }
  }

  function onnegotiationneeded(
    sendSignal: (signal: RTCSignal) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ((this: RTCPeerConnection, ev: Event) => any) | null {
    return async function () {
      self.isMakingOffer = true;
      console.log("Attempting to make an offer...");
      await peer.connection.setLocalDescription();
      sendSignal({
        type: "session",
        description: peer.connection.localDescription,
      });
      self.isMakingOffer = false;
    };
  }

  function onicecandidate(
    sendSignal: (signal: RTCSignal) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null {
    return function ({ candidate }) {
      console.log("Attempting to handle an ICE candidate...");
      sendSignal({ type: "icecandidate", candidate: candidate });
    };
  }

  function ontrack({ streams: [stream] }: RTCTrackEvent) {
    console.log("Attempting to display media from peer...");
    displayStream(peer.refHtmlVideoElement.current, stream);
  }

  const { addChatChannel } = useChatContext();

  const { joinCall, leaveCall } = usePeerToPeerCall(
    {
      onconnectionstatechange,
      ondatachannel,
      onnegotiationneeded,
      onicecandidate,
      ontrack,
    },
    () => {
      addChatChannel();
    },
  );

  return (
    <main className={styles.main}>
      <Header className={styles.header}>
        <h1>Welcome to room {window.location.hash}</h1>
        <JoinCallButton joinCall={joinCall} leaveCall={leaveCall} />
      </Header>
      <section className={styles.videos}>
        <h2 className={globals.preserveAccessibility}>Streaming Videos</h2>
        <Self connectionState={connectionState} />
        <Peer filter={peerFilter} />
      </section>
      <Chat className={styles.chat} />
      <footer className={styles.footer}>
        <Button
          aria-label={"Toggle microphone"}
          role={"switch"}
          aria-checked={selfFeatures.audio}
          type={"button"}
          onClick={toggleSelfAudioFeature}
        >
          Mic
        </Button>
        <Button
          aria-label={"Toggle camera"}
          role={"switch"}
          aria-checked={selfFeatures.video}
          type={"button"}
          onClick={toggleSelfVideoFeature}
        >
          Cam
        </Button>
      </footer>
    </main>
  );
}

export default Layout;
