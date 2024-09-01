import styles from "./Button.module.css";
import { ComponentPropsWithoutRef } from "react";

function Button({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"button">) {
  const classes = [styles.button, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
