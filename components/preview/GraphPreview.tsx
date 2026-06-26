"use client";

import { useMemo } from "react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";

interface GraphNode {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  Daily: "#7c5cff",
  Project: "#3dd9b0",
  Area: "#f59e0b",
  Resource: "#38bdf8",
  Meeting: "#f472b6",
  Idea: "#a78bfa",
};

/**
 * Aesthetic, deterministic mock of Obsidian's Graph View.
 * Not a real graph — node visibility reacts to the current config.
 */
export function GraphPreview() {
  const { config } = useVaultConfig();

  const satellites = useMemo<GraphNode[]>(() => {
    return [
      { id: "project", label: "Project", color: TYPE_COLORS.Project, enabled: config.tags.type || config.folderPreset !== "minimal" },
      { id: "area", label: "Area", color: TYPE_COLORS.Area, enabled: config.tags.area || config.folderPreset !== "minimal" },
      { id: "resource", label: "Resource", color: TYPE_COLORS.Resource, enabled: config.folderPreset !== "minimal" },
      { id: "meeting", label: "Meeting", color: TYPE_COLORS.Meeting, enabled: config.tags.type },
      { id: "idea", label: "Idea", color: TYPE_COLORS.Idea, enabled: config.dailyNoteSections.ideas },
    ].filter((n) => n.enabled);
  }, [config]);

  const W = 460;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  const R = 105;

  const positions = satellites.map((n, i) => {
    const angle = (i / satellites.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  });

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-lg border border-border-soft bg-bg-soft/40"
        role="img"
        aria-label="Mock graph view of the vault"
      >
        {/* edges from center */}
        {positions.map((p) => (
          <line
            key={`e-${p.id}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#2a2a3a"
            strokeWidth={1.5}
          />
        ))}
        {/* a few cross edges for realism */}
        {positions.length > 2 && (
          <>
            <line
              x1={positions[0].x}
              y1={positions[0].y}
              x2={positions[1].x}
              y2={positions[1].y}
              stroke="#23232f"
              strokeWidth={1}
            />
            <line
              x1={positions[1].x}
              y1={positions[1].y}
              x2={positions[positions.length - 1].x}
              y2={positions[positions.length - 1].y}
              stroke="#23232f"
              strokeWidth={1}
            />
          </>
        )}

        {/* satellites */}
        {positions.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={11} fill={p.color} opacity={0.9} />
            <text
              x={p.x}
              y={p.y + 26}
              textAnchor="middle"
              fontSize={11}
              fill="#c7c7d6"
              fontFamily="ui-sans-serif, system-ui"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* center / daily node */}
        <circle cx={cx} cy={cy} r={16} fill={TYPE_COLORS.Daily} />
        <text
          x={cx}
          y={cy + 34}
          textAnchor="middle"
          fontSize={12}
          fill="#ffffff"
          fontFamily="ui-sans-serif, system-ui"
          fontWeight={600}
        >
          {config.corePlugins.dailyNotes ? "Daily Note" : config.vaultName}
        </text>
      </svg>
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        {Object.entries(TYPE_COLORS).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted">
        A stylized preview — your real graph fills in as you create and link notes.
      </p>
    </div>
  );
}
