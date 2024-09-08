import Video from "@components/Video/Video.tsx";
import videoStyles from "@components/Video/Video.module.css";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.tsx";

export interface PeerProps {
  filter: string;
}

function Peer({ filter }: PeerProps) {
  const { peer } = usePeerToPeerContext();

  return (
    <Video
      ref={peer.refHtmlVideoElement}
      muted={false}
      poster={"placeholder.png"}
      className={videoStyles[filter]}
    />
  );
}

export default Peer;
