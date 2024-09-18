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
import displayStream from "@utils/displayStream.ts";
import Features from "@components/Features/Features.tsx";
import { useFeaturesContext } from "@components/Features/FeaturesContext.ts";
import { useChatContext } from "@components/Chat/ChatContext.ts";

function Layout() {
  const { self, peer } = usePeerToPeerContext();

  const [status, setStatus] = useState<"connected" | "disconnected">(
    "disconnected",
  );

  const { receiveMessage } = useChatContext();

  const [peerFilter, setPeerFilter] = useState("filter-none");

  function onconnectionstatechange() {
    const connectionState = peer.connection.connectionState;
    console.log(`Connection state is now: ${connectionState}`);
    if (connectionState !== "connected") {
      setStatus("disconnected");
    } else {
      setStatus("connected");
    }
  }

  function ondatachannel({ channel }: RTCDataChannelEvent) {
    const label = channel.label;
    if (label.startsWith("filter-")) {
      setPeerFilter(label);
      channel.onopen = function () {
        channel.close();
      };
    } else if (label.startsWith("chat-")) {
      receiveMessage(channel);
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

  const { addFeaturesChannel } = useFeaturesContext();

  const { joinCall, leaveCall } = usePeerToPeerCall(
    {
      onconnectionstatechange,
      ondatachannel,
      onnegotiationneeded,
      onicecandidate,
      ontrack,
    },
    () => {
      addFeaturesChannel();
    },
    () => {
      setStatus("disconnected");
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
        <Self status={status} />
        <Peer filter={peerFilter} status={status} />
      </section>
      <Chat className={styles.chat} />
      <Features className={styles.features} />
    </main>
  );
}

export default Layout;
