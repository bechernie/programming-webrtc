import styles from "@components/Chat/ChatForm.module.css";
import globals from "@src/Globals.module.css";
import Button from "@components/Button/Button.tsx";
import { useChatContext } from "@components/Chat/ChatContext.ts";
import { ChangeEvent, FormEvent, useRef } from "react";
import ChatInputField from "@components/Chat/ChatInputField.tsx";

function ChatForm() {
  const { setImage, sendMessage } = useChatContext();

  function handleMessageForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleImageButton() {
    fileRef.current?.click();
  }

  function handleImageInput(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const image = event.target.files?.[0];
    if (!image) {
      return;
    }
    setImage(image);
    inputRef.current?.focus();
  }

  return (
    <form
      className={styles.chatForm}
      action={"#null"}
      onSubmit={handleMessageForm}
    >
      <ChatInputField ref={inputRef} />
      <label htmlFor={"image-button"} className={globals.preserveAccessibility}>
        Send Image
      </label>
      <Button
        className={styles.imageButton}
        type={"button"}
        onClick={handleImageButton}
      >
        Image
      </Button>
      <input
        ref={fileRef}
        type={"file"}
        hidden={true}
        aria-hidden={true}
        accept={".gif, .jpg, .jpeg, .png"}
        onChange={handleImageInput}
      />
      <Button className={styles.sendButton} type={"submit"} id={"chat-button"}>
        Send
      </Button>
    </form>
  );
}

export default ChatForm;
