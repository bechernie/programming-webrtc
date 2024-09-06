import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

function useSignalingChannel(namespace: string) {
  const [signalingChannel, setSignalingChannel] = useState<Socket>();

  useEffect(() => {
    const socket = io("http://localhost:3000/" + namespace, {
      autoConnect: false,
    });

    socket.on("connect", function () {
      console.log("Successfully connected to signaling channel");
    });

    socket.on("disconnect", function () {
      console.log("Successfully disconnected from signaling channel");
    });

    setSignalingChannel(socket);
  }, [namespace]);

  return {
    joinCall: () => signalingChannel?.connect(),
    leaveCall: () => signalingChannel?.disconnect(),
  };
}

export default useSignalingChannel;
