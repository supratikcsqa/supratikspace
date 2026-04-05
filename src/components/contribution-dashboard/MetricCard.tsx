import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: 'ember' | 'teal' | 'amber' | 'slate';
}

const toneMap = {
  ember: 'from-orange-500/25 to-rose-500/10 text-orange-100 ring-orange-400/25',
  teal: 'from-cyan-500/25 to-emerald-500/10 text-cyan-100 ring-cyan-400/25',
  amber: 'from-amber-500/25 to-orange-500/10 text-amber-100 ring-amber-400/25',
  slate: 'from-slate-500/25 to-slate-800/10 text-slate-100 ring-slate-400/25',
};

const MetricCard = ({ icon: Icon, label, value, detail, tone = 'ember' }: MetricCardProps) => (
  <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${toneMap[tone]} p-5 shadow-[0_24px_80px_-48px_rgba(251,146,60,0.65)] ring-1`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/55">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white/80">
        <Icon size={22} strokeWidth={1.8} />
      </div>
    </div>
    <p className="mt-4 text-sm text-white/62">{detail}</p>
  </div>
);

export default MetricCard;
