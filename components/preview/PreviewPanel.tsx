"use client";

import { useState } from "react";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Card, CardBody } from "@/components/ui/Card";
import { FolderTreePreview } from "./FolderTreePreview";
import { DailyNotePreview } from "./DailyNotePreview";
import { GraphPreview } from "./GraphPreview";
import { PromptPreview } from "./PromptPreview";

const TABS: TabItem[] = [
  { id: "tree", label: "Folder Tree" },
  { id: "daily", label: "Daily Note" },
  { id: "graph", label: "Graph" },
  { id: "prompt", label: "Claude Prompt" },
];

export function PreviewPanel() {
  const [active, setActive] = useState("tree");

  return (
    <div className="space-y-3">
      <Tabs items={TABS} active={active} onChange={setActive} />
      <Card>
        <CardBody className="max-h-[calc(100vh-280px)] overflow-auto">
          {active === "tree" && <FolderTreePreview />}
          {active === "daily" && <DailyNotePreview />}
          {active === "graph" && <GraphPreview />}
          {active === "prompt" && <PromptPreview />}
        </CardBody>
      </Card>
    </div>
  );
}
