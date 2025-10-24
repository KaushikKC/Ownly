import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close
export const DialogOverlay = DialogPrimitive.Overlay
export const DialogContent = DialogPrimitive.Content
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ""}`}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"
