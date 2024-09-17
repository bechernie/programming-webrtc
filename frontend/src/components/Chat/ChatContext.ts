import { createContext, RefObject, useContext } from "react";
import { Message } from "@hooks/useChat.ts";

export interface ChatContext {
  message: string;
  setMessage: (message: string) => void;
  image?: File;
  setImage: (image?: File) => void;
  messages: Message[];
  addChatChannel: () => void;
  sendMessage: () => void;
  refMessagesList: RefObject<HTMLOListElement>;
}

export const ChatContext = createContext<ChatContext>({} as ChatContext);

export function useChatContext() {
  return useContext(ChatContext);
}
