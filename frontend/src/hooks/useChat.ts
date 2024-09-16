import { useEffect, useRef, useState } from "react";
import { Peer, Self } from "@utils/types.ts";

type Sender = "self" | "peer";

export interface MessageContent {
  text: string;
  timestamp: number;
}

export interface MessageResponse {
  id: number;
  timestamp: number;
}

export interface Message {
  sender: Sender;
  content: MessageContent;
  acknowledged: boolean;
  delayed: boolean;
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

  function appendMessage(sender: Sender, message: MessageContent) {
    setMessages((prevState) => [
      ...prevState,
      {
        sender: sender,
        content: message,
        acknowledged: false,
        delayed: false,
      },
    ]);
  }

  function sendMessage() {
    const messageContent = {
      text: message,
      timestamp: Date.now(),
    };
    appendMessage("self", messageContent);
    sendOrQueueMessage(messageContent);
    setMessage("");
  }

  function queueMessage(
    message: MessageContent | MessageResponse,
    push = true,
  ) {
    if (push) {
      self.messageQueue.push(message);
    } else {
      self.messageQueue.unshift(message);
    }
  }

  function sendOrQueueMessage(
    message: MessageContent | MessageResponse,
    push = true,
  ) {
    const chatChannel = peer.chatChannel;
    if (!chatChannel || chatChannel.readyState !== "open") {
      queueMessage(message, push);
      return;
    }
    try {
      peer.chatChannel?.send(JSON.stringify(message));
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
      const message = JSON.parse(event.data) as
        | MessageContent
        | MessageResponse;
      if ("id" in message) {
        handleResponse(message);
      } else {
        sendOrQueueMessage({ id: message.timestamp, timestamp: Date.now() });
        appendMessage("peer", message);
      }
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

  function handleResponse(response: MessageResponse) {
    setMessages((prevState) => {
      const newMessages = [...prevState];
      const messageIndex = prevState.findIndex(
        (message) => message.content.timestamp === response.id,
      );
      if (messageIndex < 0) {
        return newMessages;
      }
      newMessages.splice(messageIndex, 1, {
        ...newMessages[messageIndex],
        acknowledged: true,
        delayed: response.timestamp - response.id > 1_000,
      });
      return newMessages;
    });
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
