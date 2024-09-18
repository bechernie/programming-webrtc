import { useEffect, useRef, useState } from "react";
import { Peer, Self } from "@utils/types.ts";
import exhaustiveSwitch from "@utils/exhaustiveSwitch.ts";

type Sender = "self" | "peer";

interface MessageContent {
  id: number;
  message: string;
  image?: ImageContent;
}

export interface ImageContent {
  image: ArrayBuffer;
  name: string;
}

interface MessagePayload {
  id: number;
  message: string;
  image?: {
    buffer: string;
    name: string;
  };
}

export interface Message {
  sender: Sender;
  content: MessageContent;
  acknowledged: boolean;
  delayed: boolean;
}

export interface MessageEnvelope {
  payload: Uint8Array;
  metadata: Metadata;
}

interface MessageChunk {
  chunk: Uint8Array;
  metadata: Metadata;
}

interface MessageChunks {
  rawData: number[];
  bytesReceived: number;
}

interface Metadata {
  id: number;
  kind: "response" | "message";
  timestamp: number;
  totalSize: number;
}

function useChat(self: Self, peer: Peer) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<ImageContent>();
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
        image: image,
        acknowledged: false,
        delayed: false,
      },
    ]);
  }

  async function sendMessage() {
    const timestamp = Date.now();

    if (!message && !image) {
      return;
    }

    appendMessage("self", {
      id: timestamp,
      message: message,
      image: image,
    });

    const imagePayload = image?.image
      ? {
          buffer: btoa(String.fromCharCode(...new Uint8Array(image.image))),
          name: image.name,
        }
      : undefined;

    sendOrQueueMessage({
      id: timestamp,
      message: message,
      image: imagePayload,
    });

    setMessage("");
    setImage(undefined);
  }

  function sendOrQueueMessage(payload: MessagePayload, push = true) {
    const timestamp = Date.now();

    const messagePayload = new TextEncoder().encode(JSON.stringify(payload));

    sendOrQueueMessageEnvelope(
      {
        payload: messagePayload,
        metadata: {
          id: payload.id,
          kind: "message",
          timestamp: timestamp,
          totalSize: messagePayload.byteLength,
        },
      },
      push,
    );
  }

  function sendOrQueueResponse(id: number, push = true) {
    const timestamp = Date.now();

    const responsePayload = new TextEncoder().encode(
      JSON.stringify({
        id: timestamp,
      }),
    );

    sendOrQueueMessageEnvelope(
      {
        payload: responsePayload,
        metadata: {
          id: id,
          kind: "response",
          timestamp: timestamp,
          totalSize: responsePayload.byteLength,
        },
      },
      push,
    );
  }

  function sendOrQueueMessageEnvelope(
    messageEnvelope: MessageEnvelope,
    push = true,
  ) {
    if (!peer.chatChannel || peer.chatChannel.readyState !== "open") {
      queueMessageEnvelope(messageEnvelope, push);
      return;
    }

    const chunkSize = 16 * 1024;

    try {
      for (let i = 0; i < messageEnvelope.payload.length; i += chunkSize) {
        const chunk: MessageChunk = {
          chunk: messageEnvelope.payload.slice(i, i + chunkSize),
          metadata: messageEnvelope.metadata,
        };

        peer.chatChannel.send(JSON.stringify(chunk));
      }
    } catch (e) {
      console.log("Error sending message:", e);
      queueMessageEnvelope(messageEnvelope, push);
    }
  }

  function addChatChannel() {
    const messageChunksByIds = new Map<number, MessageChunks>();

    peer.chatChannel = peer.connection.createDataChannel("text-chat", {
      negotiated: true,
      id: 100,
    });

    peer.chatChannel.onmessage = async function ({ data }) {
      const messageChunk = JSON.parse(data) as MessageChunk;

      if (!messageChunksByIds.has(messageChunk.metadata.id)) {
        messageChunksByIds.set(messageChunk.metadata.id, {
          rawData: [],
          bytesReceived: 0,
        });
      }

      const messageChunks = messageChunksByIds.get(
        messageChunk.metadata.id,
      ) as MessageChunks;

      const rawData = new Uint8Array(Object.values(messageChunk.chunk));

      for (const byte of rawData) {
        messageChunks.rawData.push(byte);
        messageChunks.bytesReceived++;
      }

      if (messageChunks.bytesReceived !== messageChunk.metadata.totalSize) {
        return;
      }

      const messagePayload = JSON.parse(
        new TextDecoder().decode(new Uint8Array(messageChunks.rawData)),
      ) as MessagePayload;

      switch (messageChunk.metadata.kind) {
        case "response":
          handleResponse(messageChunk.metadata);
          break;
        case "message":
          {
            let image: ImageContent | undefined;

            if (messagePayload.image) {
              const imageInput =
                "data:application/octet-stream;base64," +
                messagePayload.image.buffer;
              const arraybuffer = await (await fetch(imageInput)).arrayBuffer();
              image = {
                image: arraybuffer,
                name: messagePayload.image.name,
              };
            }

            appendMessage("peer", {
              id: messageChunk.metadata.id,
              message: messagePayload.message,
              image: image,
            });

            sendOrQueueResponse(messageChunk.metadata.id);
          }
          break;
        default:
          exhaustiveSwitch(messageChunk.metadata.kind);
      }
    };
    peer.chatChannel.onclose = function () {
      console.log("Chat channel closed");
    };
    peer.chatChannel.onopen = function () {
      console.log("Chat channel opened");
      while (
        self.messageEnvelopeQueue.length > 0 &&
        peer.chatChannel?.readyState === "open"
      ) {
        const message = self.messageEnvelopeQueue.shift();

        if (message) {
          sendOrQueueMessageEnvelope(message, false);
        }
      }
    };
  }

  function queueMessageEnvelope(messageEnvelope: MessageEnvelope, push = true) {
    if (push) {
      self.messageEnvelopeQueue.push(messageEnvelope);
    } else {
      self.messageEnvelopeQueue.unshift(messageEnvelope);
    }
  }

  function handleResponse(response: Metadata) {
    setMessages((prevState) => {
      const newMessages = [...prevState];
      const messageIndex = prevState.findIndex(
        (message) => message.content.id === response.id,
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
    image,
    setImage,
    messages,
    sendMessage,
    addChatChannel,
    refMessagesList,
  };
}

export default useChat;
