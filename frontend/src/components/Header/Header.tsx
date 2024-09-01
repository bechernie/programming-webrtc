import { ComponentPropsWithoutRef } from "react";
import styles from "./Header.module.css";

function Header({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"header">) {
  const classes = [styles.header, className].filter(Boolean).join(" ");
  return (
    <header className={classes} {...rest}>
      {children}
    </header>
  );
}

export default Header;
