import { ReactNode } from "react";
import useChat from "@hooks/useChat.ts";
import { Peer, Self } from "@utils/types.ts";
import { ChatContext } from "./ChatContext";

export interface ChatContextProviderProps {
  self: Self;
  peer: Peer;
  children?: ReactNode;
}

function ChatContextProvider({
  self,
  peer,
  children,
}: ChatContextProviderProps) {
  const {
    message,
    setMessage,
    image,
    setImage,
    messages,
    sendMessage,
    addChatChannel,
    refMessagesList,
  } = useChat(self, peer);

  return (
    <ChatContext.Provider
      value={{
        message,
        setMessage,
        image,
        setImage,
        messages,
        sendMessage,
        addChatChannel,
        refMessagesList,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContextProvider;
