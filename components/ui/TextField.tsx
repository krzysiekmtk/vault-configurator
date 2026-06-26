"use client";

import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const base =
  "w-full rounded-lg border border-border bg-bg-soft px-3 py-2 text-sm text-white placeholder:text-muted/60 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-[80px] resize-y font-mono", className)} {...props} />;
}
