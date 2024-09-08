import styles from "./App.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import Video from "@components/Video/Video.tsx";
import useSignalingChannel, { RTCSignal } from "@hooks/useSignalingChannel.ts";
import { FormEvent, useEffect, useRef, useState } from "react";
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
  const filters = [
    "filter-none",
    "filter-grayscale",
    "filter-sepia",
    "filter-noir",
    "filter-psychedelic",
  ];
  const [filterIndex, setFilterIndex] = useState(0);

  function onSelfVideoClick() {
    if (peer.current.connection.connectionState !== "connected") {
      return;
    }
    setFilterIndex((prevState) => (prevState + 1) % filters.length);
  }

  const selfFilter = filters[filterIndex];

  const [peerFilter, setPeerFilter] = useState("filter-none");

  useEffect(() => {
    if (peer.current.connection.connectionState !== "connected") {
      return;
    }
    const filterDataChannel =
      peer.current.connection.createDataChannel(selfFilter);
    filterDataChannel.onclose = function () {
      console.log(`Remote peer has closed the ${selfFilter}`);
    };
  }, [selfFilter]);

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

  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>();

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
        const description = signal.description;

        const readyForOffer =
          !self.current.isMakingOffer &&
          (peer.current.connection.signalingState === "stable" ||
            self.current.isSettingRemoteAnswerPending);
        const offerCollision = description?.type === "offer" && !readyForOffer;
        self.current.isIgnoringOffer = !self.current.isPolite && offerCollision;

        if (self.current.isIgnoringOffer) {
          return;
        }

        self.current.isSettingRemoteAnswerPending =
          description?.type === "answer";
        if (description) {
          await peer.current.connection.setRemoteDescription(description);
        }
        self.current.isSettingRemoteAnswerPending = false;

        if (description?.type === "offer") {
          await peer.current.connection.setLocalDescription();
          sendSignal({
            type: "session",
            description: peer.current.connection.localDescription,
          });
        }
        break;
      }
      case "icecandidate": {
        const candidate = signal.candidate;

        try {
          if (candidate) {
            await peer.current.connection.addIceCandidate(candidate);
          }
        } catch (e) {
          if (
            !self.current.isIgnoringOffer &&
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
    peer.current.connection.onconnectionstatechange = function () {
      const connectionState = peer.current.connection.connectionState;
      console.log(`Connection state is now: ${connectionState}`);
      setConnectionState(connectionState);
    };
    peer.current.connection.ondatachannel = function ({ channel }) {
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
    };
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

  interface Message {
    sender: "self" | "peer";
    content: string;
  }

  const chatLogRef = useRef<HTMLOListElement>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  function appendMessage(sender: "self" | "peer", message: string) {
    setMessages((prevState) => [
      ...prevState,
      {
        sender: sender,
        content: message,
      },
    ]);
  }

  function handleMessageForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    appendMessage("self", message);
    setMessage("");
  }

  useEffect(() => {
    chatLogRef.current?.scrollTo({
      top: chatLogRef.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <main className={styles.main}>
      <Header className={styles.header}>
        <h1>Welcome to room {window.location.hash}</h1>
        <JoinCallButton
          joinCall={joinCall}
          leaveCall={() => {
            leaveCall();
            resetPeer();
          }}
        />
      </Header>
      <section className={styles.videos}>
        <h2 className={styles.preserveAccessibility}>Streaming Videos</h2>
        <Video
          ref={selfVideoElement}
          poster={"placeholder.png"}
          className={[
            styles.self,
            styles[selfFilter],
            connectionState === "connected" && styles.connected,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onSelfVideoClick}
        />
        <Video
          ref={peerVideoElement}
          muted={false}
          poster={"placeholder.png"}
          className={styles[peerFilter]}
        />
      </section>
      <aside className={styles.chat}>
        <h2 className={styles.preserveAccessibility}>Text Chat</h2>
        <ol ref={chatLogRef} className={styles.chatLog}>
          {messages.map((message, index) => (
            <li
              key={index}
              className={message.sender === "self" ? styles.self : styles.peer}
            >
              {message.content}
            </li>
          ))}
        </ol>
        <form
          className={styles.chatForm}
          action={"#null"}
          onSubmit={handleMessageForm}
        >
          <label
            htmlFor={"chat-message"}
            className={styles.preserveAccessibility}
          >
            Compose Message
          </label>
          <input
            type={"text"}
            id={"chat-message"}
            name={"chat-message"}
            autoComplete={"off"}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type={"submit"} id={"chat-button"}>
            Send
          </button>
        </form>
      </aside>
    </main>
  );
}

export default App;
