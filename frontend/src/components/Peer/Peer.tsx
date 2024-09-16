import Video from "@components/Video/Video.tsx";
import videoStyles from "@components/Video/Video.module.css";
import styles from "./Peer.module.css";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";

export interface PeerProps {
  filter: string;
}

function Peer({ filter }: PeerProps) {
  const { peer } = usePeerToPeerContext();

  return (
    <>
      <Video
        ref={peer.refHtmlVideoElement}
        muted={false}
        poster={"placeholder.png"}
        className={videoStyles[filter]}
      />
      <p className={styles.micStatus} aria-hidden={true}>
        Remote peer is muted.
      </p>
    </>
  );
}

export default Peer;
