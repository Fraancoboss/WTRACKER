import * as React from "react";
import { cn } from "./utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "blue" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "btn btn--default",
  blue: "btn btn--blue",
  outline: "btn btn--outline",
  ghost: "btn btn--ghost",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "btn--default-size",
  sm: "btn--sm",
  lg: "btn--lg",
  icon: "btn--icon",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClass = variantClasses[variant] || variantClasses.default;
    const sizeClass = sizeClasses[size] || sizeClasses.default;

    return (
      <button
        ref={ref}
        className={cn(variantClass, sizeClass, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
