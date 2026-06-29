"use client";

import { Library } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { TEMPLATE_LIBRARY_DEFS } from "@/lib/config/catalog";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import type { TemplateLibraryId } from "@/lib/config/types";

export function TemplateLibraryConfig() {
  const { config, update } = useVaultConfig();

  function toggle(id: TemplateLibraryId, checked: boolean) {
    update((d) => {
      if (checked) {
        if (!d.templateLibrary.includes(id)) d.templateLibrary.push(id);
      } else {
        d.templateLibrary = d.templateLibrary.filter((t) => t !== id);
      }
    });
  }

  return (
    <Card>
      <CardHeader
        icon={<Library size={18} />}
        title="Template Library"
        description="Add individual templates not covered by your workflow packs."
      />
      <CardBody>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TEMPLATE_LIBRARY_DEFS.map((def) => (
            <Checkbox
              key={def.key}
              label={def.label}
              description={def.description}
              checked={config.templateLibrary.includes(def.key)}
              onChange={(v) => toggle(def.key, v)}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
