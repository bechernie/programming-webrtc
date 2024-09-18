import { useEffect, useRef, useState } from "react";
import { Peer } from "@utils/types.ts";

type Sender = "self" | "peer";

export interface MessageContent {
  id: number;
  message: string;
  image?: ImageContent;
}

export interface ImageContent {
  image: ArrayBuffer;
  name: string;
}

export type MessagePayload = {
  id: number;
  message: string;
  image?: {
    buffer: string;
    name: string;
  };
};

export interface Message {
  sender: Sender;
  content: MessageContent;
  acknowledged: boolean;
  delayed: boolean;
}

export type Envelope = {
  payload: Uint8Array;
  metadata: Metadata;
};

export type Metadata = {
  id: number;
  kind: "response" | "message";
  timestamp: number;
  size: number;
};

function useChat(peer: Peer) {
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

  function sendOrQueueMessage(payload: MessagePayload) {
    const timestamp = Date.now();

    const messagePayload = new TextEncoder().encode(JSON.stringify(payload));

    sendOrQueueEnvelope({
      payload: messagePayload,
      metadata: {
        id: timestamp,
        kind: "message",
        timestamp: timestamp,
        size: messagePayload.byteLength,
      },
    });
  }

  function sendOrQueueResponse(id: number) {
    const timestamp = Date.now();

    const responsePayload = new TextEncoder().encode(JSON.stringify({}));

    sendOrQueueEnvelope({
      payload: responsePayload,
      metadata: {
        id: id,
        kind: "response",
        timestamp: timestamp,
        size: responsePayload.byteLength,
      },
    });
  }

  function sendOrQueueEnvelope(envelope: Envelope) {
    const chatChannel = peer.connection.createDataChannel(
      `chat-${envelope.metadata.kind}-${envelope.metadata.id}`,
    );
    const chunk = 16 * 1024;
    chatChannel.onopen = function () {
      chatChannel.send(JSON.stringify(envelope.metadata));
      chatChannel.binaryType = "arraybuffer";
      try {
        for (let i = 0; i < envelope.payload.length; i += chunk) {
          chatChannel.send(envelope.payload.slice(i, i + chunk));
        }
      } catch (e) {
        console.log("Error sending message:", e);
      }
    };
  }

  function receiveMessage(channel: RTCDataChannel) {
    const chunks: BlobPart[] = [];
    let metadata: Metadata;
    let bytesReceived = 0;

    channel.onmessage = async function ({ data }) {
      if (typeof data === "string" && data.startsWith("{")) {
        metadata = JSON.parse(data) as Metadata;
      } else {
        bytesReceived += data.size ? data.size : data.byteLength;
        chunks.push(data);

        if (bytesReceived !== metadata.size) {
          return;
        }

        const payload = new Blob(chunks);
        const message = JSON.parse(
          new TextDecoder().decode(new Uint8Array(await payload.arrayBuffer())),
        ) as MessagePayload;

        if (metadata.kind === "response") {
          handleResponse(metadata);
        } else {
          let image: ImageContent | undefined;

          if (message.image) {
            const imageInput =
              "data:application/octet-stream;base64," + message.image.buffer;
            const arraybuffer = await (await fetch(imageInput)).arrayBuffer();
            image = {
              image: arraybuffer,
              name: message.image.name,
            };
          }

          appendMessage("peer", {
            id: message.id,
            message: message.message,
            image: image,
          });

          sendOrQueueResponse(message.id);
        }
      }
    };
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
    receiveMessage,
    refMessagesList,
  };
}

export default useChat;
