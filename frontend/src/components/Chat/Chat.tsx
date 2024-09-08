import { FormEvent, RefObject } from "react";
import styles from "./Chat.module.css";
import globals from "@src/Globals.module.css";
import { Message } from "@hooks/useChatChannel.ts";

export interface ChatProps {
  message: string;
  handleChangeMessage: (message: string) => void;
  messages: Message[];
  handleSendMessage: () => void;
  chatLogRef: RefObject<HTMLOListElement>;
}

function Chat({
  message,
  handleChangeMessage,
  messages,
  handleSendMessage,
  chatLogRef,
}: ChatProps) {
  function handleMessageForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSendMessage();
  }

  return (
    <aside className={styles.chat}>
      <h2 className={globals.preserveAccessibility}>Text Chat</h2>
      <ol ref={chatLogRef} className={styles.chatLog}>
        {messages.map((message, index) => (
          <li
            key={index}
            className={message.sender === "self" ? styles.self : styles.peer}
          >
            {message.content}
          </li>
        ))}
      </ol>
      <form
        className={styles.chatForm}
        action={"#null"}
        onSubmit={handleMessageForm}
      >
        <label
          htmlFor={"chat-message"}
          className={globals.preserveAccessibility}
        >
          Compose Message
        </label>
        <input
          type={"text"}
          id={"chat-message"}
          name={"chat-message"}
          autoComplete={"off"}
          value={message}
          onChange={(event) => handleChangeMessage(event.target.value)}
        />
        <button type={"submit"} id={"chat-button"}>
          Send
        </button>
      </form>
    </aside>
  );
}

export default Chat;
