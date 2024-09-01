import styles from "./App.module.css";
import Video from "./component/Video/Video.tsx";
import Header from "./component/Header/Header.tsx";
import JoinCallButton from "./component/JoinCallButton/JoinCallButton.tsx";

function App() {
  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome</h1>
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
