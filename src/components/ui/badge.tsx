import * as React from "react";

import { cn } from "./utils";

type BadgeVariant = "default" | "outline" | "muted";

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "badge--default",
  outline: "badge--outline",
  muted: "badge--muted",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = variantClasses[variant] ?? variantClasses.default;

  return (
    <span
      data-slot="badge"
      className={cn("badge", variantClass, className)}
      {...props}
    />
  );
}

export { Badge };
