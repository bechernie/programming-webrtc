import { FormEvent } from "react";
import styles from "./Chat.module.css";
import globals from "@src/Globals.module.css";
import { useChatContext } from "@components/Chat/ChatContext.tsx";

function Chat() {
  const { message, setMessage, messages, sendMessage, refMessagesList } =
    useChatContext();

  function handleMessageForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <aside className={styles.chat}>
      <h2 className={globals.preserveAccessibility}>Text Chat</h2>
      <ol ref={refMessagesList} className={styles.chatLog}>
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
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type={"submit"} id={"chat-button"}>
          Send
        </button>
      </form>
    </aside>
  );
}

export default Chat;
