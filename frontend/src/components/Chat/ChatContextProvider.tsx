import { ReactNode } from "react";
import useChat from "@hooks/useChat.ts";
import { Peer } from "@utils/types.ts";
import { ChatContext } from "./ChatContext";

export interface ChatContextProviderProps {
  peer: Peer;
  children?: ReactNode;
}

function ChatContextProvider({ peer, children }: ChatContextProviderProps) {
  const {
    message,
    setMessage,
    image,
    setImage,
    messages,
    sendMessage,
    receiveMessage,
    refMessagesList,
  } = useChat(peer);

  return (
    <ChatContext.Provider
      value={{
        message,
        setMessage,
        image,
        setImage,
        messages,
        sendMessage,
        receiveMessage,
        refMessagesList,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContextProvider;
