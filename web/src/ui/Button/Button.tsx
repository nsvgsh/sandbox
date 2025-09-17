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
    if (typeof rest.onPointerDown === 'function') rest.onPointerDown(e)
  }
  const handlePointerUp: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    clearPressed(e.currentTarget)
    if (typeof rest.onPointerUp === 'function') rest.onPointerUp(e)
  }
  const handlePointerCancel: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    clearPressed(e.currentTarget)
    if (typeof rest.onPointerCancel === 'function') rest.onPointerCancel(e)
  }
  const handlePointerLeave: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    clearPressed(e.currentTarget)
    if (typeof rest.onPointerLeave === 'function') rest.onPointerLeave(e)
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


