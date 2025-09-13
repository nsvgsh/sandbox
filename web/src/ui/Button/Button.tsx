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

  const clearPressed = (el: HTMLButtonElement | null) => {
    try { el?.removeAttribute('data-pressed') } catch {}
  }
  const handlePointerDown: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {}
    rest.onPointerDown?.(e as any)
  }
  const handlePointerUp: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    clearPressed(e.currentTarget)
    rest.onPointerUp?.(e as any)
  }
  const handlePointerCancel: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    clearPressed(e.currentTarget)
    rest.onPointerCancel?.(e as any)
  }
  const handlePointerLeave: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    clearPressed(e.currentTarget)
    rest.onPointerLeave?.(e as any)
  }

  return (
    <button
      className={`${classes}${className ? ` ${className}` : ""}`}
      style={inlineStyle}
      disabled={disabled || isLoading}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {isLoading ? "…" : children}
    </button>
  );
};


