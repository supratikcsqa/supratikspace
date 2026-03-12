export type AgentStatus = 'active' | 'inactive' | 'paused';

export interface AgentPersonality {
    motto: string;
    style: 'social' | 'technical' | 'creative' | 'finance' | 'system' | 'ai';
    traits: string[];
    details: {
        label: string;
        value: string;
    }[];
}

export interface Agent {
    id: string;
    name: string;
    codeName: string;
    description: string;
    category: string;
    status: AgentStatus;
    url: string;
    icon: string;
    accentColor: string;
    tags: string[];
    version: string;
    uptime?: string;
    personality?: AgentPersonality;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    gradient: string;
}

export const categories: Category[] = [
    { id: 'all', name: 'All Agents', icon: '⚡', gradient: 'from-white/20 to-white/5' },
    { id: 'social', name: 'Social Ops', icon: '📡', gradient: 'from-pink-500/20 to-rose-500/5' },
    { id: 'communication', name: 'Comms', icon: '✉️', gradient: 'from-blue-500/20 to-cyan-500/5' },
    { id: 'data', name: 'Data & Infra', icon: '🗄️', gradient: 'from-emerald-500/20 to-green-500/5' },
    { id: 'finance', name: 'Finance', icon: '💰', gradient: 'from-amber-500/20 to-yellow-500/5' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️', gradient: 'from-violet-500/20 to-purple-500/5' },
    { id: 'automation', name: 'Automation', icon: '🤖', gradient: 'from-cyan-500/20 to-teal-500/5' },
];

export const agents: Agent[] = [
    {
        id: 'ig-farmer',
        name: 'IGFarmer',
        codeName: 'PHANTOM-IG',
        description: 'Instagram growth automation. Engagement farming and analytics.',
        category: 'social',
        status: 'active',
        url: 'https://igfarmer.yourdomain.com',
        icon: '📸',
        accentColor: '#E1306C',
        tags: ['growth', 'engagement'],
        version: 'v2.4.1',
        uptime: '99.7%',
        personality: {
            motto: "Aesthetics are everything.",
            style: 'social',
            traits: ['Visual Hunter', 'Trend Forcaster'],
            details: [
                { label: 'Follower Velocity', value: '+142/day' },
                { label: 'Avg Engagement', value: '4.8%' }
            ]
        }
    },
    {
        id: 'reddit-karma',
        name: 'RedditKarma',
        codeName: 'ECHO-RED',
        description: 'Reddit karma optimization and viral detection engine.',
        category: 'social',
        status: 'active',
        url: 'https://redditkarma.yourdomain.com',
        icon: '🔺',
        accentColor: '#FF4500',
        tags: ['reddit', 'karma'],
        version: 'v1.8.0',
        uptime: '98.2%',
        personality: {
            motto: "The front page, optimized.",
            style: 'social',
            traits: ['Viral Alchemist', 'Sentiment Master'],
            details: [
                { label: 'Hot Thread', value: 'r/startup: "How I grew to 1M..."' },
                { label: 'Karma Multiplier', value: 'x12.4' }
            ]
        }
    },
    {
        id: 'mailer-agent',
        name: 'MailerAgent',
        codeName: 'COURIER-01',
        description: 'Intelligent email outreach and template generation.',
        category: 'communication',
        status: 'active',
        url: 'https://maileragent.yourdomain.com',
        icon: '📧',
        accentColor: '#00B4D8',
        tags: ['email', 'outreach'],
        version: 'v4.2.0',
        uptime: '99.9%',
        personality: {
            motto: "Inbox zero is a choice.",
            style: 'system',
            traits: ['Ghostwriter', 'Spam Ninja'],
            details: [
                { label: 'Response Rate', value: '24%' },
                { label: 'Tone Scan', value: 'Professional' }
            ]
        }
    },
    {
        id: 'db-handles',
        name: 'DB Handles',
        codeName: 'VAULT-DB',
        description: 'Database management and schema optimization suite.',
        category: 'data',
        status: 'active',
        url: 'https://dbhandles.yourdomain.com',
        icon: '🗃️',
        accentColor: '#00C853',
        tags: ['database', 'management'],
        version: 'v5.0.1',
        uptime: '99.99%',
        personality: {
            motto: "Integrity is non-negotiable.",
            style: 'technical',
            traits: ['Zero Latency', 'Acid Compliant'],
            details: [
                { label: 'Query Speed', value: '2ms' },
                { label: 'Index Health', value: 'Optimal' }
            ]
        }
    },
    {
        id: 'finance-agent',
        name: 'FinanceAgent',
        codeName: 'TREASURY-01',
        description: 'Financial analytics, expense tracking and tax optimization.',
        category: 'finance',
        status: 'active',
        url: 'https://financeagent.yourdomain.com',
        icon: '💰',
        accentColor: '#FFD700',
        tags: ['finance', 'analytics'],
        version: 'v2.7.0',
        uptime: '99.8%',
        personality: {
            motto: "Watch the pennies, the millions follow.",
            style: 'finance',
            traits: ['Risk Averse', 'Profit Oriented'],
            details: [
                { label: 'Burn Rate', value: '-12%' },
                { label: 'Tax Savings', value: '$840' }
            ]
        }
    },
    {
        id: 'frontend-engineer',
        name: 'Frontend Developer',
        codeName: 'PIXEL-FE',
        description: 'Expert frontend implementation with pixel-perfect precision. Focuses on performance, accessibility, and high-end micro-interactions.',
        category: 'engineering',
        status: 'active',
        url: 'https://feengineer.yourdomain.com',
        icon: '🎨',
        accentColor: '#00D4FF',
        tags: ['react', 'ux', 'performance'],
        version: 'v3.5.0',
        uptime: '99.0%',
        personality: {
            motto: "Pixel-perfect implementation isn't a goal; it's a standard.",
            style: 'creative',
            traits: ['UX Centric', 'Performance Obsessed'],
            details: [
                { label: 'Core Vitals', value: 'Excellent' },
                { label: 'Latency', value: '145ms' }
            ]
        }
    },
    {
        id: 'ai-engineer',
        name: 'AI Engineer',
        codeName: 'COGNITIVE-ML',
        description: 'Machine learning model development and production integration. Specializing in data pipelines and scalable intelligent systems.',
        category: 'engineering',
        status: 'active',
        url: 'https://aiengineer.yourdomain.com',
        icon: '🧠',
        accentColor: '#3B82F6',
        tags: ['ml', 'data', 'llm'],
        version: 'v2.0.0',
        uptime: '98.5%',
        personality: {
            motto: "Accuracy meets scalability. Data-driven by design.",
            style: 'ai',
            traits: ['MLOps Leader', 'Truth Seeker'],
            details: [
                { label: 'Model F1', value: '0.94' },
                { label: 'Inference', value: '45ms' }
            ]
        }
    },
    {
        id: 'ugc-script-engineer',
        name: 'UGC Script Engineer',
        codeName: 'HOOK-SMITH',
        description: 'Converts product webpage summaries into viral 60s UGC scripts. BYOK-enabled with 3 free trial runs.',
        category: 'automation',
        status: 'active',
        url: 'https://ugc-script-engineer-saas-production.up.railway.app',
        icon: '🎬',
        accentColor: '#F43F5E',
        tags: ['ugc', 'viral', 'content'],
        version: 'v1.2.0',
        uptime: '100%',
        personality: {
            motto: "Stop the scroll. Start the sale.",
            style: 'creative',
            traits: ['Hook Architect', 'Viral Engineer'],
            details: [
                { label: 'Crucible Score', value: '9.25/10' },
                { label: 'BYOK', value: '3 Free → Own Key' }
            ]
        }
    },
];
