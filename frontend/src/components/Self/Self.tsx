import Video from "@components/Video/Video.tsx";
import styles from "./Self.module.css";
import videoStyles from "@src/components/Video/Video.module.css";
import useFilter from "@hooks/useFilter.ts";
import { useEffect } from "react";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.tsx";

export interface SelfProps {
  connectionState?: RTCPeerConnectionState;
}
function Self({ connectionState }: SelfProps) {
  const { self, peer } = usePeerToPeerContext();
  const { filter: selfFilter, cycleFilter } = useFilter();

  function onSelfVideoClick() {
    if (peer.connection.connectionState !== "connected") {
      return;
    }

    cycleFilter();
  }

  useEffect(
    () => {
      if (peer.connection.connectionState !== "connected") {
        return;
      }
      const filterDataChannel = peer.connection.createDataChannel(selfFilter);
      filterDataChannel.onclose = function () {
        console.log(`Remote peer has closed the ${selfFilter}`);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selfFilter],
  );

  return (
    <Video
      ref={self.refHtmlVideoElement}
      poster={"placeholder.png"}
      className={[
        styles.self,
        videoStyles[selfFilter],
        connectionState === "connected" && styles.connected,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelfVideoClick}
    />
  );
}

export default Self;
