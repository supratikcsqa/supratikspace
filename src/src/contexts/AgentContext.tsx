import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, agents as defaultAgents } from '../data/agents';

interface AgentContextType {
    agents: Agent[];
    addAgent: (agent: Agent) => void;
    updateAgent: (id: string, updates: Partial<Agent>) => void;
    removeAgent: (id: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [agents, setAgents] = useState<Agent[]>([]);

    // Load from local storage or fallback to default data
    useEffect(() => {
        const savedAgents = localStorage.getItem('agentic_fleet_data');
        if (savedAgents) {
            setAgents(JSON.parse(savedAgents));
        } else {
            setAgents(defaultAgents);
            localStorage.setItem('agentic_fleet_data', JSON.stringify(defaultAgents));
        }
    }, []);

    const addAgent = (agent: Agent) => {
        const newAgents = [...agents, agent];
        setAgents(newAgents);
        localStorage.setItem('agentic_fleet_data', JSON.stringify(newAgents));
    };

    const updateAgent = (id: string, updates: Partial<Agent>) => {
        const newAgents = agents.map(a => a.id === id ? { ...a, ...updates } : a);
        setAgents(newAgents);
        localStorage.setItem('agentic_fleet_data', JSON.stringify(newAgents));
    };

    const removeAgent = (id: string) => {
        const newAgents = agents.filter(a => a.id !== id);
        setAgents(newAgents);
        localStorage.setItem('agentic_fleet_data', JSON.stringify(newAgents));
    };

    return (
        <AgentContext.Provider value={{ agents, addAgent, updateAgent, removeAgent }}>
            {children}
        </AgentContext.Provider>
    );
};

export const useAgents = () => {
    const context = useContext(AgentContext);
    if (!context) throw new Error('useAgents must be used within AgentProvider');
    return context;
};
