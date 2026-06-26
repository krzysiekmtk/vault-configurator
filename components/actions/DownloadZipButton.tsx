"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generateZip, zipFilename } from "@/lib/generators/generateZip";
import { downloadFile } from "@/lib/utils/downloadFile";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function DownloadZipButton() {
  const { config } = useVaultConfig();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    setBusy(true);
    try {
      const blob = await generateZip(config);
      downloadFile(zipFilename(config), blob, "application/zip");
      toast("Vault ZIP downloaded");
    } catch {
      toast("Failed to generate ZIP", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="primary" size="lg" className="w-full" onClick={onDownload} disabled={busy}>
      {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      Download Vault ZIP
    </Button>
  );
}
