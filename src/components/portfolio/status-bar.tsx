import { useEffect, useState } from "react";

export function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:px-6 font-mono">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 rounded-full pulse-dot" />
          </span>
          <span className="text-foreground font-semibold tracking-widest">SUPRATIK_OS</span>
          <span className="hidden md:inline opacity-50">v1.0.0</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex font-mono">
          {[["#index","/index"],["#stack","/stack"],["#shipping","/shipping"],["#log","/log"],["#book","/book"]].map(([href, label]) => (
            <a key={href} href={href} className="hover:text-foreground transition-colors">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline">UTC {time}</span>
          <span className="hidden md:inline text-highlight font-medium">● AVAILABLE</span>
        </div>
      </div>
    </div>
  );
}
