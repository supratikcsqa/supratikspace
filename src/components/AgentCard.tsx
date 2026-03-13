import { motion } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { ArrowUpRight, CheckCircle2, Clock, Zap, MessageSquare, Shield, Terminal, Code2, Cpu, ExternalLink, Layers } from 'lucide-react';
import type { Agent } from '../data/agents';

interface AgentCardProps {
    agent: Agent;
    index: number;
    onLaunch?: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, index, onLaunch }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const isPaused = agent.status === 'paused';
    const p = agent.personality;

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const el = cardRef.current; if (!el) return;
        const rect = el.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const cx = rect.width / 2; const cy = rect.height / 2;
        el.style.transform = `perspective(1000px) rotateX(${((y - cy) / cy) * -2}deg) rotateY(${((x - cx) / cx) * 2}deg)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        const el = cardRef.current; if (el) el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        setIsHovered(false);
    }, []);

    // Personality-specific decorative element
    const renderPersonalityDecorator = () => {
        if (!p) return null;
        switch (p.style) {
            case 'social':
                return (
                    <div className="absolute top-24 right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <MessageSquare size={120} strokeWidth={1} />
                    </div>
                );
            case 'technical':
                return (
                    <div className="absolute bottom-32 -left-4 opacity-[0.05] font-mono text-[8px] leading-tight rotate-90 origin-top-left pointer-events-none uppercase tracking-tighter">
                        {`[LOG] Initializing_${agent.codeName}...OK\n[SYS] Memory_Check...PASS\n[NET] Ping_Stable...12ms`}
                    </div>
                );
            case 'creative':
                return (
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                        <div className="w-full h-full border-l border-b border-slate-900 grid grid-cols-4 grid-rows-4">
                            {[...Array(16)].map((_, i) => <div key={i} className="border border-slate-900/10" />)}
                        </div>
                    </div>
                );
            case 'ai':
                return (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] z-10" />
                        <div className="text-[6px] font-mono break-all animate-pulse px-2">
                            {Array(20).fill(0).map(() => Math.random().toString(16).substring(2)).join('')}
                        </div>
                    </div>
                );
            case 'system':
                return (
                    <div className="absolute top-2 right-6 opacity-[0.05] flex flex-col items-end pointer-events-none">
                        <div className="w-12 h-1 bg-slate-900 mb-1" />
                        <div className="w-8 h-1 bg-slate-900 mb-1" />
                        <div className="w-10 h-1 bg-slate-900" />
                        <span className="text-[7px] font-mono mt-2 tracking-widest uppercase">Protocol_Locked</span>
                    </div>
                );
            case 'finance':
                return (
                    <div className="absolute bottom-8 right-8 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none rotate-12 group-hover:rotate-0 group-hover:scale-110">
                        <Shield size={140} strokeWidth={0.5} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
            className={isPaused ? "opacity-60 saturate-50" : ""}
        >
            <div
                ref={cardRef}
                className={`relative transition-all duration-700 ease-out h-full ${!isPaused ? 'group cursor-pointer' : 'cursor-not-allowed'}`}
                onMouseMove={!isPaused ? handleMouseMove : undefined}
                onMouseEnter={() => !isPaused && setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                    if (isPaused) return;
                    onLaunch ? onLaunch(agent) : window.open(agent.url, '_blank');
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div
                    className={`relative rounded-3xl bg-white p-7 border transition-all duration-500 overflow-hidden h-full flex flex-col ${!isPaused
                        ? 'border-slate-200 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]'
                        : 'border-slate-100 shadow-none'
                        }`}
                    style={{
                        borderColor: isHovered && !isPaused ? `${agent.accentColor}40` : '',
                        boxShadow: isHovered && !isPaused ? `0 20px 60px -12px ${agent.accentColor}15` : ''
                    }}
                >
                    {/* Personality Background Element */}
                    {renderPersonalityDecorator()}

                    <div className="absolute -top-10 -right-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                        style={{ backgroundColor: `${agent.accentColor}10` }} />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="relative">
                            <div
                                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-transform duration-500 group-hover:scale-110"
                                style={{ color: agent.accentColor }}
                            >
                                <span className="text-3xl leading-none">{agent.icon}</span>
                            </div>
                            {/* Floating trait badge for personality */}
                            {!isPaused && p?.traits[0] && (
                                <div className="absolute -right-2 -bottom-2 bg-emerald-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-white">
                                    {p.traits[0]}
                                </div>
                            )}
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${isPaused ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ backgroundColor: !isPaused ? agent.accentColor : '' }} />
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isPaused ? 'text-amber-700' : 'text-slate-700'}`}>
                                {isPaused ? 'Paused' : 'Online'}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-xl font-display font-bold text-slate-900 transition-colors ${!isPaused ? 'group-hover:text-slate-800' : ''}`}>
                                {agent.name}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-300">/</span>
                            <span className="text-[10px] font-mono text-slate-400 tracking-[0.1em] uppercase">{agent.codeName}</span>
                        </div>
                        {p && (
                            <p className="text-[11px] italic text-slate-400 font-serif leading-tight">
                                "{p.motto}"
                            </p>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed font-light mb-8 line-clamp-2">
                        {agent.description}
                    </p>

                    <div className="mt-auto">
                        {/* Personality-specific metrics */}
                        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100 mb-8">
                            {p?.details.map((detail, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                                        {detail.label}
                                    </div>
                                    <div className="text-[12px] font-bold text-slate-700 tracking-tight">
                                        {detail.value}
                                    </div>
                                </div>
                            )) || (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Efficiency</div>
                                            <div className="text-[12px] font-bold text-slate-700">99.2%</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Status</div>
                                            <div className="text-[12px] font-bold text-slate-700">Nominal</div>
                                        </div>
                                    </>
                                )}
                        </div>

                        {/* Trigger Button */}
                        <div className={`relative px-6 py-3.5 rounded-2xl flex items-center justify-between group/btn transition-all duration-500 ${isPaused
                            ? 'bg-slate-50 text-slate-300 border border-slate-100'
                            : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 group-hover:shadow-emerald-500/20 group-hover:-translate-y-1'
                            }`}
                            style={{
                                backgroundColor: isHovered && !isPaused ? agent.accentColor : undefined,
                                boxShadow: isHovered && !isPaused ? `0 10px 30px -5px ${agent.accentColor}40` : undefined
                            }}
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase leading-none mb-1">
                                    {isPaused ? 'Protocol Locked' : agent.type === 'native' ? 'Launch Agent' : 'Open External'}
                                </span>
                                <span className={`text-[8px] font-mono opacity-50 uppercase tracking-widest ${isPaused ? 'hidden' : 'block'}`}>
                                    {agent.type === 'native' ? 'Internal Workspace' : 'Redirection Active'}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover/btn:bg-white/20 transition-colors">
                                {isPaused ? <Shield size={14} /> : agent.type === 'native' ? <Layers size={16} /> : <ExternalLink size={16} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AgentCard;
