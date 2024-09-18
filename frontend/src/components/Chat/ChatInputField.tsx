import styles from "@components/Chat/ChatInputField.module.css";
import globals from "@src/Globals.module.css";
import { useChatContext } from "@components/Chat/ChatContext.ts";
import { forwardRef } from "react";
import useImageContentUrl from "@hooks/useImageContentUrl.ts";

const ChatInputField = forwardRef<HTMLInputElement>((_props, ref) => {
  const { message, setMessage, image, setImage } = useChatContext();

  const url = useImageContentUrl(image);

  return (
    <div className={styles.inputWrapper}>
      {image && (
        <div className={styles.imgWrapper}>
          <img src={url} className={styles.img} alt={image.name} />
          <button
            className={styles.removeImg}
            type={"button"}
            onClick={() => setImage(undefined)}
          >
            ×
          </button>
        </div>
      )}
      <label htmlFor={"chat-message"} className={globals.preserveAccessibility}>
        Compose Message
      </label>
      <input
        ref={ref}
        className={styles.input}
        type={"text"}
        id={"chat-message"}
        name={"chat-message"}
        autoComplete={"off"}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Backspace" && message.length === 0) {
            setImage(undefined);
          }
        }}
      />
    </div>
  );
});

export default ChatInputField;
