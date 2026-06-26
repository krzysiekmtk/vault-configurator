"use client";

import { Tags } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { TAG_GROUPS, TAG_GROUP_ORDER } from "@/lib/config/catalog";
import { getCustomDisplayTags } from "@/lib/config/activeTags";
import { normalizeTags } from "@/lib/utils/normalizeTags";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/TextField";

export function TagConfig() {
  const { config, update } = useVaultConfig();
  const customTags = getCustomDisplayTags(config);

  return (
    <Card>
      <CardHeader
        icon={<Tags size={18} />}
        title="Tag system"
        description="Toggle built-in tag groups and add your own."
      />
      <CardBody className="space-y-4">
        <div className="divide-y divide-border-soft">
          {TAG_GROUP_ORDER.map((key) => (
            <div key={key} className="py-2 first:pt-0 last:pb-0">
              <Toggle
                label={TAG_GROUPS[key].label}
                checked={config.tags[key]}
                onChange={(v) => update((d) => { d.tags[key] = v; })}
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TAG_GROUPS[key].tags.map((t) => (
                  <Badge key={t} tone={config.tags[key] ? "brand" : "muted"}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 border-t border-border-soft pt-3">
          <label className="text-xs font-medium text-muted">Custom tags (comma-separated)</label>
          <TextInput
            placeholder="writing, ideas, health"
            defaultValue={config.tags.custom.join(", ")}
            onBlur={(e) =>
              update((d) => {
                d.tags.custom = normalizeTags(e.target.value);
              })
            }
          />
          {customTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customTags.map((t) => (
                <Badge key={t} tone="accent">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
