import styles from "./App.module.css";
import Header from "@components/Header/Header.tsx";
import JoinCallButton from "@components/JoinCallButton/JoinCallButton.tsx";
import Video from "@components/Video/Video.tsx";
import useNamespace from "@hooks/useNamespace.ts";
import useSignalingChannel from "@hooks/useSignalingChannel.ts";

function App() {
  const namespace = useNamespace();

  useSignalingChannel(namespace);

  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome to room #{namespace}</h1>
        <JoinCallButton />
      </Header>
      <section>
        <h2 className={styles.preserveAccessibility}>Streaming Videos</h2>
        <Video poster={"placeholder.png"} className={styles.self} />
        <Video muted={false} poster={"placeholder.png"} />
      </section>
    </main>
  );
}

export default App;
