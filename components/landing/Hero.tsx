export function Hero() {
  return (
    <section className="mb-8 rounded-xl border border-border bg-bg-card/50 px-6 py-8 text-center">
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Stop tweaking Obsidian.
        <br />
        <span className="text-brand">Generate a working system.</span>
      </h2>
      <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-muted">
        Pick your workflows. Configure once. Download a complete vault — folders, templates,
        dashboard, onboarding docs and Claude Code instructions included.
      </p>
      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
        {[
          { step: "1", label: "Configure", desc: "Pick your profile and workflows" },
          { step: "2", label: "Preview", desc: "See your vault live on the right" },
          { step: "3", label: "Download", desc: "Get the ZIP and open in Obsidian" },
        ].map(({ step, label, desc }) => (
          <div key={step} className="flex flex-col items-center gap-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {step}
            </span>
            <span className="text-sm font-semibold text-white">{label}</span>
            <span className="text-xs text-muted">{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
