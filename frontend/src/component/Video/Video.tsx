import { ComponentPropsWithoutRef } from "react";
import styles from "./Video.module.css";

export interface VideoProps extends ComponentPropsWithoutRef<"video"> {
  poster: string;
}

function Video({
  autoPlay = true,
  muted = true,
  playsInline = true,
  children,
  className,
  ...rest
}: VideoProps) {
  const classes = [styles.video, className].filter(Boolean).join(" ");
  return (
    <video
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      className={classes}
      {...rest}
    >
      {children}
    </video>
  );
}

export default Video;
