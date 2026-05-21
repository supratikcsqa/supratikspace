/* Ticker — lime band on white page = striking brand moment, kept intentionally */
const ITEMS = [
  "AI-NATIVE GTM", "★", "SHIPPING IN PUBLIC", "★",
  "$500K ARR · RMG", "★", "PRODUCT × MARKETING × ENGINEERING", "★",
  "FRONTIER AI", "★", "ZERO-TO-ONE", "★", "DISTRIBUTION IS THE MOAT", "★",
  "SUPRATIK KUNDU", "★",
];

export function Ticker() {
  return (
    <div className="overflow-hidden border-y border-[#b8d93a] bg-[#C6F54A] text-[#111827]">
      <div className="flex animate-ticker whitespace-nowrap py-3 text-[12px] font-semibold uppercase tracking-[0.28em] font-mono">
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="px-8">{t}</span>
        ))}
      </div>
    </div>
  );
}
