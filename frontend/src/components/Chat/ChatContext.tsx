import { createContext, ReactNode, RefObject, useContext } from "react";
import useChat, { Message } from "@hooks/useChat.ts";
import { Peer, Self } from "@utils/types.ts";

export interface ChatContext {
  message: string;
  setMessage: (message: string) => void;
  messages: Message[];
  addChatChannel: () => void;
  sendMessage: () => void;
  refMessagesList: RefObject<HTMLOListElement>;
}

const ChatContext = createContext<ChatContext>({} as ChatContext);

export function useChatContext() {
  return useContext(ChatContext);
}

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
    messages,
    addChatChannel,
    sendMessage,
    refMessagesList,
  } = useChat(self, peer);

  return (
    <ChatContext.Provider
      value={{
        message,
        setMessage,
        messages,
        addChatChannel,
        sendMessage,
        refMessagesList,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContextProvider;
