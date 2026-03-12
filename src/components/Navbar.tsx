import React, { useState, useEffect } from 'react';
import { LayoutGrid, Fingerprint, Search, Bell } from 'lucide-react';

const Navbar: React.FC<{ onSearchRequest: () => void }> = ({ onSearchRequest }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out border-b ${scrolled ? 'py-4 glass-heavy bg-white/95' : 'py-6 bg-transparent border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-all duration-500 shadow-sm">
                            <LayoutGrid size={20} className="text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-xl tracking-tight text-slate-800 leading-none">SUPRATIK.</span>
                            <span className="text-[9px] font-mono text-slate-400 tracking-[0.2em] font-medium uppercase mt-0.5">Control Center</span>
                        </div>
                    </div>

                    {/* System Readout */}
                    <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500">
                                <div className="status-dot-pulse text-emerald-500" />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Network_Live</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Global Pings: Stable</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-xl border border-transparent bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-200 transition-all shadow-sm">
                        <Bell size={18} />
                    </button>
                    <button onClick={onSearchRequest} className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-[11px] tracking-widest hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm">
                        <Search size={14} /> COMMAND <span className="opacity-40">K</span>
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block" />
                    <div className="p-1 rounded-full border border-emerald-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Fingerprint size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
