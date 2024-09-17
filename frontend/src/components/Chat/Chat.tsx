import styles from "./Chat.module.css";
import globals from "@src/Globals.module.css";
import ChatLog from "@components/Chat/ChatLog.tsx";
import ChatForm from "@components/Chat/ChatForm.tsx";

function Chat({ className }: { className?: string }) {
  return (
    <aside className={[styles.chat, className].filter(Boolean).join(" ")}>
      <h2 className={globals.preserveAccessibility}>Text Chat</h2>
      <ChatLog />
      <ChatForm />
    </aside>
  );
}

export default Chat;
