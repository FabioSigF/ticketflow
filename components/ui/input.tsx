import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
        flex w-full min-w-0
        h-10
        rounded-md
        bg-transparent

        px-3 py-2
        text-sm text-foreground
        placeholder:text-muted-foreground

        border border-input
        transition-colors duration-200

        focus:border-primary
        focus:outline-none
        focus:ring-0

        disabled:cursor-not-allowed
        disabled:opacity-50
        `,
        className
      )}
      {...props}
    />
  )
}

export { Input }
