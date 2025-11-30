import * as React from "react";

import { cn } from "./utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("form-input", className)}
      {...props}
    />
  );
}

export { Input };
