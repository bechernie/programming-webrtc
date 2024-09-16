import { FormEvent } from "react";
import styles from "./Chat.module.css";
import globals from "@src/Globals.module.css";
import { useChatContext } from "@components/Chat/ChatContext.ts";

function Chat({ className }: { className?: string }) {
  const { message, setMessage, messages, sendMessage, refMessagesList } =
    useChatContext();

  function handleMessageForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <aside className={[styles.chat, className].filter(Boolean).join(" ")}>
      <h2 className={globals.preserveAccessibility}>Text Chat</h2>
      <ol ref={refMessagesList} className={styles.chatLog}>
        {messages.map((message, index) => {
          const classes = [
            message.sender === "self" ? styles.self : styles.peer,
            message.acknowledged ? styles.received : "",
            message.delayed ? styles.delayed : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={index} className={classes}>
              {message.content.text}
            </li>
          );
        })}
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
