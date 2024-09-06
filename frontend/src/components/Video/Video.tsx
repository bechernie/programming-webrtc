import { ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./Video.module.css";

export interface VideoProps extends ComponentPropsWithoutRef<"video"> {
  poster: string;
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(function Video(
  {
    autoPlay = true,
    muted = true,
    playsInline = true,
    children,
    className,
    ...rest
  }: VideoProps,
  ref,
) {
  const classes = [styles.video, className].filter(Boolean).join(" ");
  return (
    <video
      ref={ref}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      className={classes}
      {...rest}
    >
      {children}
    </video>
  );
});

export default Video;
