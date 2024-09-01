import Button from "../Button/Button.tsx";
import styles from "./JoinCallButton.module.css";
import { useState } from "react";

function JoinCallButton() {
  const [joined, setJoined] = useState(false);
  const classes = [styles.button, joined ? styles.leave : styles.join]
    .filter(Boolean)
    .join(" ");
  return (
    <Button
      className={classes}
      onClick={() => setJoined((prevJoined) => !prevJoined)}
    >
      {joined ? "Leave Call" : "Join Call"}
    </Button>
  );
}

export default JoinCallButton;
