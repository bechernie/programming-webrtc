import styles from "@components/Chat/ChatLog.module.css";
import { useChatContext } from "@components/Chat/ChatContext.ts";
import ChatMessage from "@components/Chat/ChatMessage.tsx";

function ChatLog() {
  const { messages, refMessagesList } = useChatContext();

  return (
    <ol ref={refMessagesList} className={styles.chatLog}>
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
    </ol>
  );
}

export default ChatLog;
