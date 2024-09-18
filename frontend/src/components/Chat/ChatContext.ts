import { createContext, RefObject, useContext } from "react";
import { ImageContent, Message } from "@hooks/useChat.ts";

export interface ChatContext {
  message: string;
  setMessage: (message: string) => void;
  image?: ImageContent;
  setImage: (image?: ImageContent) => void;
  messages: Message[];
  sendMessage: () => void;
  addChatChannel: () => void;
  refMessagesList: RefObject<HTMLOListElement>;
}

export const ChatContext = createContext<ChatContext>({} as ChatContext);

export function useChatContext() {
  return useContext(ChatContext);
}
