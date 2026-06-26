"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function CopyPromptButton({ prompt }: { prompt: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast("Prompt copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Copy failed — select and copy manually", "error");
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={onCopy}>
      {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
      Copy Claude Prompt
    </Button>
  );
}
