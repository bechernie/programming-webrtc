import { ComponentPropsWithoutRef } from "react";
import styles from "./Header.module.css";

export interface HeaderProps extends ComponentPropsWithoutRef<"header"> {}

function Header({ className, children, ...rest }: HeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(" ");
  return (
    <header className={classes} {...rest}>
      {children}
    </header>
  );
}

export default Header;
