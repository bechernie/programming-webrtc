import styles from "./App.module.css";
import Button from "./component/Button/Button.tsx";
import Video from "./component/Video/Video.tsx";
import Header from "./component/Header/Header.tsx";

function App() {
  return (
    <main className={styles.main}>
      <Header>
        <h1>Welcome</h1>
        <Button className={styles.callButton}>Join Call</Button>
      </Header>
      <section>
        <h2 className={styles.preserveAccess}>Streaming Videos</h2>
        <Video poster={"placeholder.png"} className={styles.self} />
        <Video muted={false} poster={"placeholder.png"} />
      </section>
    </main>
  );
}

export default App;
