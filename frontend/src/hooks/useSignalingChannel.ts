import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

function useSignalingChannel(
  namespace: string,
  onConnect: () => void,
  onConnectedPeer: () => void,
) {
  const [signalingChannel, setSignalingChannel] = useState<Socket>();

  useEffect(() => {
    const socket = io("http://localhost:3000/" + namespace, {
      autoConnect: false,
    });

    socket.on("connect", onConnect);
    socket.on("connected peer", onConnectedPeer);

    socket.on("disconnected peer", function () {
      console.log("disconnected peer");
    });

    socket.on("signal", function () {
      console.log("signal");
    });

    socket.on("disconnect", function () {
      console.log("disconnect");
    });

    setSignalingChannel(socket);
  }, []);

  return {
    joinCall: () => signalingChannel?.connect(),
    leaveCall: () => signalingChannel?.disconnect(),
    signal: (data: Record<string, unknown>) =>
      signalingChannel?.emit("signal", data),
  };
}

export default useSignalingChannel;
