import React, { useState, useEffect } from 'react';
import { Github, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-500 ease-out border-b ${
        scrolled ? 'py-4 glass-heavy bg-white/95' : 'py-6 bg-transparent border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-12">
          <div className="flex cursor-pointer items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm transition-all duration-500">
              <Sparkles size={20} className="text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold leading-none tracking-tight text-slate-800">SUPRATIK.</span>
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400 font-mono">
                Repo Launch Pages
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-4 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm lg:flex">
            <div className="flex items-center gap-2">
              <div className="relative h-1.5 w-1.5 rounded-full bg-emerald-500">
                <div className="status-dot-pulse text-emerald-500" />
              </div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">Preview Engine Live</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Public GitHub repos only</span>
          </div>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-600 md:inline-flex"
        >
          <Github size={14} />
          PUBLIC REPOS
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
