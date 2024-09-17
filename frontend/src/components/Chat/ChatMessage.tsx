import { Message } from "@hooks/useChat.ts";
import styles from "@components/Chat/ChatMessage.module.css";
import useFileUrl from "@hooks/useFileUrl.ts";

function ChatMessage({ message }: { message: Message }) {
  const classes = [
    message.sender === "self" ? styles.self : styles.peer,
    message.acknowledged ? styles.received : "",
    message.delayed ? styles.delayed : "",
    styles.li,
  ]
    .filter(Boolean)
    .join(" ");

  const url = useFileUrl(message.content.image?.image);

  return (
    <li className={classes}>
      {message.content.image && (
        <img
          src={url}
          className={styles.img}
          alt={message.content.image.metadata.name}
        />
      )}
      <div className={styles.message}>{message.content.message}</div>
    </li>
  );
}

export default ChatMessage;
