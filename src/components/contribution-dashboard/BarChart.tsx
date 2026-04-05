interface BarChartItem {
  label: string;
  value: number;
  footnote?: string;
}

interface BarChartProps {
  title: string;
  subtitle: string;
  items: BarChartItem[];
  accent?: string;
  emptyLabel?: string;
}

const BarChart = ({
  title,
  subtitle,
  items,
  accent = 'from-orange-400 to-amber-300',
  emptyLabel = 'No contribution history yet.',
}: BarChartProps) => {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/45">
          {items.length} bins
        </span>
      </div>

      {items.length === 0 || maxValue === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-white/45">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {items.map((item) => {
            const height = Math.max((item.value / maxValue) * 100, item.value > 0 ? 12 : 0);

            return (
              <div key={`${item.label}-${item.footnote || ''}`} className="flex min-h-[170px] flex-col justify-end gap-3">
                <div className="relative flex-1 rounded-[20px] border border-white/6 bg-black/15 p-2">
                  <div
                    className={`absolute inset-x-2 bottom-2 rounded-[14px] bg-gradient-to-t ${accent} shadow-[0_12px_30px_-18px_rgba(251,146,60,0.9)]`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.value.toFixed(item.value % 1 === 0 ? 0 : 1)}</p>
                  <p className="text-xs text-white/45">{item.label}</p>
                  {item.footnote ? <p className="text-[11px] text-white/30">{item.footnote}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BarChart;
