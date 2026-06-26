"use client";

import { Share2 } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { buildShareUrl } from "@/lib/share/shareConfig";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ShareConfigButton() {
  const { config } = useVaultConfig();
  const { toast } = useToast();

  const onShare = async () => {
    const url = buildShareUrl(config, window.location.href);
    // Reflect the config in the address bar too.
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      toast("Share link copied");
    } catch {
      toast("Link set in address bar — copy it manually", "error");
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={onShare}>
      <Share2 size={14} />
      Share config
    </Button>
  );
}
