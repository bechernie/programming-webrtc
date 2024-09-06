import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

function useSignalingChannel(namespace: string) {
  const [signalingChannel, setSignalingChannel] = useState<Socket>();

  useEffect(() => {
    const socket = io("http://localhost:3000/" + namespace, {
      autoConnect: false,
    });

    socket.on("connect", function () {
      console.log("connect");
    });

    socket.on("connected peer", function () {
      console.log("connected peer");
    });

    socket.on("disconnected peer", function () {
      console.log("connected peer");
    });

    socket.on("signal", function () {
      console.log("signal");
    });

    socket.on("disconnect", function () {
      console.log("disconnect");
    });

    setSignalingChannel(socket);
  }, [namespace]);

  return {
    joinCall: () => signalingChannel?.connect(),
    leaveCall: () => signalingChannel?.disconnect(),
  };
}

export default useSignalingChannel;
