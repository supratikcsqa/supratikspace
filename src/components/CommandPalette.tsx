import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import { agents } from '../data/agents';

const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const filtered = agents.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
                        <div className="flex items-center px-6 py-4 border-b border-slate-100">
                            <Search className="text-emerald-500 mr-4" size={20} />
                            <input autoFocus className="bg-transparent border-none outline-none text-slate-800 font-medium w-full placeholder:text-slate-400 placeholder:font-normal" placeholder="Search protocol..." value={query} onChange={(e) => setQuery(e.target.value)} />
                            <span className="text-[10px] text-slate-400 font-mono p-1 border border-slate-200 rounded">ESC</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {filtered.map(agent => (
                                <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-all" onClick={() => { window.open(agent.url, '_blank'); onClose(); }}>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl">{agent.icon}</span>
                                        <span className="text-slate-700 font-bold group-hover:text-emerald-600 transition-colors">{agent.name}</span>
                                    </div>
                                    <Command size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                                </div>
                            ))}
                            {filtered.length === 0 && <div className="text-center py-6 text-xs text-slate-400 font-mono uppercase tracking-widest">No agents found</div>}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
