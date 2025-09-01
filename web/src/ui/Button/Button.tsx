"use client";

import React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "confirm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  width?: number | string;
  height?: number;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  width,
  height,
  className,
  disabled,
  ...rest
}) => {
  const inlineStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: height ? `${height}px` : undefined,
  } as React.CSSProperties;

  const classes = [
    styles.buttonBase,
    variant === "confirm" ? styles.confirm : styles.primary,
    disabled ? styles.disabled : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={`${classes}${className ? ` ${className}` : ""}`} style={inlineStyle} disabled={disabled || isLoading} {...rest}>
      {isLoading ? "…" : children}
    </button>
  );
};


