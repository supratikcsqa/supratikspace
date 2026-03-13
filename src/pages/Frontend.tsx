import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '../contexts/AgentContext';
import { Agent } from '../data/agents';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import CategoryFilter from '../components/CategoryFilter';
import AgentGrid from '../components/AgentGrid';
import AgentCard from '../components/AgentCard';
import CommandPalette from '../components/CommandPalette';
import Footer from '../components/Footer';

const FeaturedAgent: React.FC<{ agent: Agent; onLaunch: (a: Agent) => void }> = ({ agent, onLaunch }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-16 relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] group"
        >
            <div className="absolute top-0 right-0 w-[50%] h-full bg-slate-50 border-l border-slate-100 hidden lg:block" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 lg:p-16 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-mono font-bold uppercase tracking-widest border border-emerald-100">
                            Featured Intel
                        </span>
                        {agent.personality && (
                            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                                {agent.personality.style} Protocol
                            </span>
                        )}
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-display font-black text-slate-900 mb-6 leading-tight">
                        Meet the <span className="text-gradient">{agent.name}.</span>
                    </h2>

                    <p className="text-lg text-slate-500 font-light leading-relaxed mb-10 max-w-md">
                        {agent.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-10">
                        {agent.personality?.traits.map((trait, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600">
                                {trait}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => onLaunch(agent)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold tracking-[0.2em] text-xs uppercase shadow-xl shadow-slate-900/10 hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all mr-auto"
                        style={{ backgroundColor: agent.accentColor }}
                    >
                        Engage Protocol
                    </button>
                </div>

                <div className="p-10 lg:p-16 flex items-center justify-center bg-slate-50/50">
                    <div className="relative">
                        <div className="text-[12rem] filter drop-shadow-2xl animate-float">{agent.icon}</div>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-full scale-150 -z-10" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const OperationalPulse: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    const [currentThought, setCurrentThought] = useState("");

    useEffect(() => {
        const thoughts = [
            "RedditKarma: Detecting high-velocity sentiment in r/tech...",
            "AI Engineer: Model F1 performance optimized to 0.94.",
            "Frontend Developer: Refactoring kernel components for 145ms latency...",
            "IGFarmer: Aesthetic sync complete with trend forecasting.",
            "MailerAgent: Neutralizing high-risk spam signatures.",
            "DB Handles: Query integrity verified across global nodes.",
            "FinanceAgent: Risk-aversion protocol engaged for Q3 projections."
        ];
        let i = 0;
        const interval = setInterval(() => {
            setCurrentThought(thoughts[i % thoughts.length]);
            i++;
        }, 4000);
        setCurrentThought(thoughts[0]);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm mb-12 max-w-2xl mx-auto overflow-hidden">
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest whitespace-nowrap">Pulse:</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentThought}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[11px] font-medium text-slate-700 truncate"
                >
                    {currentThought}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

const Frontend: React.FC = () => {
    const { agents } = useAgents();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredAgents = useMemo(() => {
        return agents.filter((agent) =>
            agent.status !== 'inactive' &&
            (activeCategory === 'all' || agent.category === activeCategory)
        );
    }, [activeCategory, agents]);

    const handleLaunchAgent = (agent: typeof agents[0]) => {
        if (agent.status === 'paused') return;
        // External agents redirect to their URL, native agents use internal workspace
        if (agent.type === 'native') {
            navigate(`/agent/${agent.id}`);
        } else {
            window.open(agent.url, '_blank');
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 text-slate-600 selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden">
            <div className="mesh-bg" />

            <Navbar onSearchRequest={() => setIsCommandPaletteOpen(true)} />

            <main className="relative z-10 pt-10">
                <HeroSection />

                <div id="fleet" className="pb-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-center gap-4 mb-4"
                            >
                                <div className="h-px w-10 bg-slate-200" />
                                <span className="text-[10px] font-mono tracking-[0.4em] text-emerald-500 font-bold uppercase">Emergent Intelligence</span>
                                <div className="h-px w-10 bg-slate-200" />
                            </motion.div>

                            <CategoryFilter
                                activeCategory={activeCategory}
                                setActiveCategory={setActiveCategory}
                            />
                        </div>

                        <OperationalPulse agents={agents} />

                        {filteredAgents.length > 0 && (
                            <div className="space-y-12">
                                <FeaturedAgent
                                    agent={filteredAgents[0]}
                                    onLaunch={handleLaunchAgent}
                                />

                                {filteredAgents.length > 1 && (
                                    <div className="pt-12 border-t border-slate-200">
                                        <motion.h3
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.4em] mb-12 text-center"
                                        >
                                            Supplementary Systems
                                        </motion.h3>
                                        <AgentGrid
                                            agents={filteredAgents.slice(1)}
                                            onLaunch={handleLaunchAgent}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
        </div>
    );
};

export default Frontend;
