import { cn } from "@/app/utils/lib"
import * as React from "react"


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    default:
      "bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] text-white shadow-md hover:opacity-90",
    outline:
      "border border-[#E76A6A] text-[#E76A6A] hover:bg-[#E76A6A]/10",
    ghost: "text-gray-700 hover:bg-gray-100",
  }

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
