"use client";

import { useRef } from "react";
import { Upload, FileDown, RotateCcw } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { serializeConfig, parseConfigJson, CONFIG_EXPORT_FILENAME } from "@/lib/config/io";
import { downloadFile } from "@/lib/utils/downloadFile";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ShareConfigButton } from "./ShareConfigButton";

export function ExportImportPanel() {
  const { config, setConfig, reset } = useVaultConfig();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    downloadFile(CONFIG_EXPORT_FILENAME, serializeConfig(config), "application/json");
    toast("Config exported");
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const result = parseConfigJson(text);
    if (result.ok) {
      setConfig(result.config);
      toast("Config imported");
    } else {
      toast(result.error, "error");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onExport}>
        <FileDown size={14} />
        Export JSON
      </Button>

      <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
        <Upload size={14} />
        Import JSON
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onImportFile(file);
        }}
      />

      <ShareConfigButton />

      <Button variant="danger" size="sm" onClick={reset}>
        <RotateCcw size={14} />
        Reset
      </Button>
    </div>
  );
}
