import React, { useState } from 'react';
import { useAgents } from '../contexts/AgentContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit2, Trash2, ShieldCheck, Activity, PauseCircle, ExternalLink, Layers } from 'lucide-react';
import { Agent, AgentStatus, AgentType, categories } from '../data/agents';

const AdminDashboard: React.FC = () => {
    const { agents, updateAgent, addAgent, removeAgent } = useAgents();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Agent>>({});

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleEdit = (agent: Agent) => {
        setEditingId(agent.id);
        setFormData({ ...agent });
    };

    const handleSave = () => {
        if (editingId && formData) {
            updateAgent(editingId, formData);
            setEditingId(null);
            setFormData({});
        }
    };

    const handleAdd = () => {
        const newId = `agent-${Date.now()}`;
        const newAgent: Agent = {
            id: newId,
            name: 'New Agent',
            codeName: 'UNKNOWN-00',
            description: 'Describe new agent capabilities here.',
            category: 'social',
            status: 'inactive',
            type: 'external',
            url: 'https://example.com',
            icon: '🤖',
            accentColor: '#10b981',
            tags: ['new'],
            version: 'v1.0.0',
            uptime: '100%',
        };
        addAgent(newAgent);
        handleEdit(newAgent);
    };

    const getStatusIcon = (status: AgentStatus) => {
        switch (status) {
            case 'active': return <ShieldCheck size={14} className="text-emerald-500" />;
            case 'paused': return <PauseCircle size={14} className="text-amber-500" />;
            case 'inactive': return <Activity size={14} className="text-slate-400" />;
        }
    };

    const getAgentType = (agent: Agent): AgentType => {
        return (editingId === agent.id && formData.type) ? formData.type : (agent.type || 'external');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-8">
            <div className="mesh-bg opacity-50" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                            <ShieldCheck size={24} className="text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">Admin Control</h1>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mt-1">Direct Fleet Modification</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold tracking-widest text-[10px] uppercase shadow-sm transition-all">
                            <Plus size={14} /> Add Agent
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold tracking-widest text-[10px] uppercase shadow-sm transition-all">
                            <LogOut size={14} /> Exit Admin
                        </button>
                    </div>
                </header>

                <div className="grid gap-6">
                    {agents.map((agent) => (
                        <div key={agent.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-8 items-start md:items-center">
                            {/* Info Section */}
                            <div className="flex items-center gap-4 min-w-[300px]">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-3xl">{agent.icon}</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 leading-none">{agent.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-2">{agent.codeName}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg max-w-max">
                                            {getStatusIcon(agent.status)}
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{agent.status}</span>
                                        </div>
                                        {/* Type Badge (always visible) */}
                                        {editingId === agent.id ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const currentType = getAgentType(agent);
                                                    const newType: AgentType = currentType === 'native' ? 'external' : 'native';
                                                    setFormData({ ...formData, type: newType });
                                                }}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${getAgentType(agent) === 'native'
                                                        ? 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100'
                                                        : 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100'
                                                    }`}
                                            >
                                                {getAgentType(agent) === 'native' ? <Layers size={11} /> : <ExternalLink size={11} />}
                                                {getAgentType(agent) === 'native' ? 'Native' : 'External'}
                                                <span className="text-[7px] opacity-50 ml-0.5">(flip)</span>
                                            </button>
                                        ) : (
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${(agent.type || 'external') === 'native'
                                                    ? 'bg-violet-50 border-violet-100 text-violet-600'
                                                    : 'bg-sky-50 border-sky-100 text-sky-600'
                                                }`}>
                                                {(agent.type || 'external') === 'native' ? <Layers size={11} /> : <ExternalLink size={11} />}
                                                {(agent.type || 'external') === 'native' ? 'Native' : 'External'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Editing Form */}
                            {editingId === agent.id ? (
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full md:col-span-2">
                                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Description / Mission Brief</label>
                                        <textarea
                                            className="w-full text-sm font-light text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 min-h-[80px]"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                                            {getAgentType(agent) === 'native' ? 'Backend API URL' : 'Target URL Redirect'}
                                        </label>
                                        <input
                                            className="w-full text-sm font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                                            value={formData.url || ''}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Operational Status</label>
                                        <select
                                            className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 uppercase tracking-widest appearance-none"
                                            value={formData.status || 'inactive'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as AgentStatus })}
                                        >
                                            <option value="active">Active (Full Prod)</option>
                                            <option value="paused">Paused (Disarmed)</option>
                                            <option value="inactive">Inactive (Hidden)</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 space-y-4">
                                    <div className="text-sm text-slate-500 font-light leading-relaxed max-w-xl">{agent.description}</div>
                                    <div className="text-xs font-mono text-blue-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100 max-w-max truncate">{agent.url}</div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-2 min-w-[120px] justify-end">
                                {editingId === agent.id ? (
                                    <button onClick={handleSave} className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                                        Save Changes
                                    </button>
                                ) : (
                                    <button onClick={() => handleEdit(agent)} className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 font-bold tracking-widest uppercase text-[10px] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                        <Edit2 size={12} /> Edit Detail
                                    </button>
                                )}

                                <button onClick={() => removeAgent(agent.id)} className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold tracking-widest uppercase text-[10px] hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
                                    <Trash2 size={12} /> Terminate
                                </button>
                            </div>

                        </div>
                    ))}
                    {agents.length === 0 && (
                        <div className="text-center py-20 text-slate-400 font-mono text-sm tracking-widest uppercase border-2 border-dashed border-slate-200 rounded-3xl">
                            No agents in local fleet. Base state memory wiped.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
