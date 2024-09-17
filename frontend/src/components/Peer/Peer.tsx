import Video from "@components/Video/Video.tsx";
import videoStyles from "@components/Video/Video.module.css";
import styles from "./Peer.module.css";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";
import { useFeaturesContext } from "@components/Features/FeaturesContext.ts";

export interface PeerProps {
  filter: string;
  connectionState?: RTCPeerConnectionState;
}

function Peer({ filter, connectionState }: PeerProps) {
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
      <p
        className={styles.micStatus}
        aria-hidden={peerFeatures.audio || connectionState !== "connected"}
      >
        Remote peer is muted.
      </p>
    </>
  );
}

export default Peer;
