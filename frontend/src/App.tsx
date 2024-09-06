import styles from "./App.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import Video from "@components/Video/Video.tsx";
import useNamespace from "@hooks/useNamespace.ts";
import useSignalingChannel from "@hooks/useSignalingChannel.ts";
import { useEffect, useRef } from "react";

function App() {
  const namespace = useNamespace();
  const { joinCall, leaveCall } = useSignalingChannel(namespace);

  const self = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async function () {
      const stream = new MediaStream();
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      stream.addTrack(media.getTracks()[0]);
      if (self.current) {
        self.current.srcObject = stream;
      }
    })();
  }, []);

  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome to room #{namespace}</h1>
        <JoinCallButton joinCall={joinCall} leaveCall={leaveCall} />
      </Header>
      <section>
        <h2 className={styles.preserveAccessibility}>Streaming Videos</h2>
        <Video ref={self} poster={"placeholder.png"} className={styles.self} />
        <Video muted={false} poster={"placeholder.png"} />
      </section>
    </main>
  );
}

export default App;
