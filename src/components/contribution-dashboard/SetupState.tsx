interface SetupStateProps {
  configPath: string;
  localOverridePath: string;
  hasGitHubToken: boolean;
}

const SetupState = ({ configPath, localOverridePath, hasGitHubToken }: SetupStateProps) => (
  <div className="rounded-[32px] border border-dashed border-orange-400/25 bg-orange-500/6 p-6">
    <p className="text-xs uppercase tracking-[0.22em] text-orange-100/70">Setup required</p>
    <h2 className="mt-3 text-2xl font-semibold text-white">Configure the repos, then let the system score meaningful work.</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
      This dashboard is ready, but it needs your cohort repositories before it can rank contributors. Add repo definitions in the tracked JSON config or a local override, then supply a GitHub token if you need higher rate limits or private repo access.
    </p>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Tracked config</p>
        <p className="mt-3 break-all font-mono text-sm text-white/80">{configPath}</p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Local override</p>
        <p className="mt-3 break-all font-mono text-sm text-white/80">{localOverridePath}</p>
      </div>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <ChecklistItem label="Add owner/repo pairs" complete={false} />
      <ChecklistItem label="Set GITHUB_TOKEN for higher limits" complete={hasGitHubToken} />
      <ChecklistItem label="Call POST /api/contribution-intelligence/sync once" complete={false} />
    </div>
  </div>
);

const ChecklistItem = ({ label, complete }: { label: string; complete: boolean }) => (
  <div className={`rounded-2xl border px-4 py-4 text-sm ${complete ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/[0.03] text-white/60'}`}>
    {label}
  </div>
);

export default SetupState;
