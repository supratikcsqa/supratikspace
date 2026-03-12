import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgents } from '../contexts/AgentContext';
import { ArrowLeft, Key, Send, Loader2, Zap, Shield, Copy, Check } from 'lucide-react';

const AgentWorkspace: React.FC = () => {
    const { agentId } = useParams<{ agentId: string }>();
    const { agents } = useAgents();
    const navigate = useNavigate();

    const agent = agents.find(a => a.id === agentId);

    const [apiKey, setApiKey] = useState('');
    const [taskInput, setTaskInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [runsUsed, setRunsUsed] = useState(0);

    if (!agent) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 mb-2">Agent Not Found</p>
                    <button onClick={() => navigate('/')} className="text-emerald-500 text-sm font-mono">← Return to Fleet</button>
                </div>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!taskInput.trim()) return;
        setLoading(true);
        setError('');
        setResult('');

        try {
            const userId = apiKey
                ? `byok-${btoa(apiKey).slice(0, 12)}`
                : `anon-${Math.random().toString(36).slice(2, 10)}`;

            const res = await fetch(`${agent.url}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                    ...(apiKey ? { 'x-api-key': apiKey } : {}),
                },
                body: JSON.stringify({ product_url_summary: taskInput }),
            });

            if (res.status === 402) {
                setError('Free trial exhausted. Please add your OpenAI API key above to continue.');
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error: ${res.status}`);
            }

            const data = await res.json();
            setResult(data.script || JSON.stringify(data, null, 2));
            setRunsUsed(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to connect to agent. Check if the service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mesh-bg" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass-heavy">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Back to Fleet
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <Zap size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                                {agent.version}
                            </span>
                        </div>
                        {agent.personality?.details?.find(d => d.label === 'Crucible Score') && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                                <Shield size={12} className="text-amber-500" />
                                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest">
                                    Score: {agent.personality.details.find(d => d.label === 'Crucible Score')?.value}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                {/* Agent Identity */}
                <div className="text-center mb-12">
                    <div className="text-7xl mb-4">{agent.icon}</div>
                    <h1 className="text-3xl font-display font-black text-slate-900 mb-2">{agent.name}</h1>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em] mb-4">{agent.codeName}</p>
                    <p className="text-base text-slate-500 font-light max-w-lg mx-auto leading-relaxed">{agent.description}</p>
                    {agent.personality?.motto && (
                        <p className="text-sm italic text-slate-400 mt-3">"{agent.personality.motto}"</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Input Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* BYOK Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Key size={16} className="text-slate-400" />
                                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                                    API Key (Optional — BYOK)
                                </h3>
                            </div>
                            <input
                                type="password"
                                placeholder="sk-proj-... (Leave blank for 3 free trial runs)"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 mt-2 font-mono">
                                {apiKey
                                    ? '🔐 Using your own key — unlimited runs.'
                                    : `⚡ ${3 - runsUsed} free trial run${3 - runsUsed !== 1 ? 's' : ''} remaining.`}
                            </p>
                        </div>

                        {/* Task Input */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Send size={16} className="text-slate-400" />
                                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                                    Your Task
                                </h3>
                            </div>
                            <textarea
                                placeholder="Describe what you want the agent to do..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[140px] resize-none"
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !taskInput.trim()}
                                className="mt-4 w-full py-3.5 rounded-xl font-bold tracking-[0.2em] text-xs uppercase text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: loading ? '#94a3b8' : agent.accentColor,
                                    boxShadow: `0 10px 30px -10px ${agent.accentColor}40`,
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={14} />
                                        Execute Agent
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Info Panel */}
                    <div className="space-y-6">
                        {/* Traits & Details */}
                        {agent.personality && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Agent Intel</h3>
                                <div className="space-y-3">
                                    {agent.personality.traits.map((trait, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.accentColor }} />
                                            {trait}
                                        </div>
                                    ))}
                                </div>
                                {agent.personality.details && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                        {agent.personality.details.map((d, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{d.label}</span>
                                                <span className="text-xs font-bold text-slate-700">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                            <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {agent.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result Area */}
                <AnimatePresence>
                    {(result || error) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-10"
                        >
                            {error ? (
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-600 text-sm font-mono">
                                    ⚠️ {error}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                                            ✅ Agent Output
                                        </h3>
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                        >
                                            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-light leading-relaxed">
                                        {result}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AgentWorkspace;
