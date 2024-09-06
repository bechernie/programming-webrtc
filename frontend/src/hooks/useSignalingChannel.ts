import { useEffect } from "react";
import { io } from "socket.io-client";

function useSignalingChannel(namespace: string) {
  useEffect(() => {
    const socket = io("http://localhost:3000/" + namespace);

    socket.on("connect", function () {
      console.log("Successfully connected to signaling channel");
    });
  }, [namespace]);
}

export default useSignalingChannel;
