import React from 'react';
import { Terminal } from 'lucide-react';

const Footer: React.FC = () => (
    <footer className="relative z-10 py-12 border-t border-slate-200 bg-slate-50 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-900 font-display font-bold">
                    <Terminal size={18} className="text-emerald-500" />
                    AGENTIC ARMY
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-widest uppercase">&copy; 2024 SYSTEM_CORE. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex gap-6 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                <a href="#" className="hover:text-emerald-600 transition-colors">TERMINAL</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">PROTOCOLS</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">SECURITY</a>
            </div>
        </div>
    </footer>
);

export default Footer;
