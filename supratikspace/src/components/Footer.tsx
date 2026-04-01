import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer: React.FC = () => (
    <footer className="relative z-10 py-12 border-t border-slate-200 bg-slate-50 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-900 font-display font-bold">
                    <Sparkles size={18} className="text-emerald-500" />
                    SUPRATIK SPACE
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-widest uppercase">&copy; 2026 Repo Launch Pages. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                <a href="#top" className="hover:text-emerald-600 transition-colors">Generate</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">GitHub</a>
                <a href="https://supratik.space" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">Supratik</a>
            </div>
        </div>
    </footer>
);

export default Footer;
