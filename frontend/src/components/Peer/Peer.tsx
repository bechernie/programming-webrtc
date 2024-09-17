import Video from "@components/Video/Video.tsx";
import videoStyles from "@components/Video/Video.module.css";
import styles from "./Peer.module.css";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";
import { useFeaturesContext } from "@components/Features/FeaturesContext.ts";

export interface PeerProps {
  filter: string;
  status: "connected" | "disconnected";
}

function Peer({ filter, status }: PeerProps) {
  const { peer } = usePeerToPeerContext();
  const { peerFeatures } = useFeaturesContext();

  return (
    <>
      <Video
        ref={peer.refHtmlVideoElement}
        muted={false}
        poster={"placeholder.png"}
        className={videoStyles[filter]}
      />
      {status === "connected" && !peerFeatures.audio && (
        <p className={styles.micStatus}>Remote peer is muted.</p>
      )}
    </>
  );
}

export default Peer;
