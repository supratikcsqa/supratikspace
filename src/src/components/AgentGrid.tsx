import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCard from './AgentCard';
import type { Agent } from '../data/agents';

const AgentGrid: React.FC<{ agents: Agent[]; onLaunch?: (agent: Agent) => void }> = ({ agents, onLaunch }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 pb-20 max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
            {agents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} onLaunch={onLaunch} />
            ))}
        </AnimatePresence>
    </div>
);

export default AgentGrid;
