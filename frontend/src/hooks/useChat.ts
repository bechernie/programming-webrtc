import { useEffect, useRef, useState } from "react";
import { Peer, Self } from "@utils/types.ts";

type Sender = "self" | "peer";

export interface Message {
  sender: Sender;
  content: string;
}

function useChat(self: Self, peer: Peer) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const refMessagesList = useRef<HTMLOListElement>(null);

  useEffect(() => {
    refMessagesList.current?.scrollTo({
      top: refMessagesList.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function appendMessage(sender: Sender, message: string) {
    setMessages((prevState) => [
      ...prevState,
      {
        sender: sender,
        content: message,
      },
    ]);
  }

  function sendMessage() {
    appendMessage("self", message);
    sendOrQueueMessage(message);
    setMessage("");
  }

  function queueMessage(message: string, push = true) {
    if (push) {
      self.messageQueue.push(message);
    } else {
      self.messageQueue.unshift(message);
    }
  }

  function sendOrQueueMessage(message: string, push = true) {
    const chatChannel = peer.chatChannel;
    if (!chatChannel || chatChannel.readyState !== "open") {
      queueMessage(message, push);
      return;
    }
    try {
      peer.chatChannel?.send(message);
    } catch (e) {
      console.log("Error sending message:", e);
      queueMessage(message, push);
    }
  }

  function addChatChannel() {
    peer.chatChannel = peer.connection.createDataChannel("text-chat", {
      negotiated: true,
      id: 100,
    });
    peer.chatChannel.onmessage = function (event) {
      appendMessage("peer", event.data);
    };
    peer.chatChannel.onclose = function () {
      console.log("Chat channel closed");
    };
    peer.chatChannel.onopen = function () {
      console.log("Chat channel opened");
      while (
        self.messageQueue.length > 0 &&
        peer.chatChannel?.readyState === "open"
      ) {
        const message = self.messageQueue.shift();
        if (message) {
          sendOrQueueMessage(message, false);
        }
      }
    };
  }

  return {
    message,
    setMessage,
    messages,
    addChatChannel,
    sendMessage,
    refMessagesList,
  };
}

export default useChat;
