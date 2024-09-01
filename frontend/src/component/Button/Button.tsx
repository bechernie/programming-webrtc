import styles from "./Button.module.css";
import { ComponentPropsWithoutRef } from "react";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {}

function Button({ className, children, ...rest }: ButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
