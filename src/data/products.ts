export type ProductCategory =
    | 'Sales & Outreach'
    | 'Agentic Systems & Workflows'
    | 'Content & SEO'
    | 'Generative AI'
    | 'Platforms & SaaS';

export interface Product {
    id: number;
    title: string;
    subtitle: string;
    category: ProductCategory;
    status: 'Live' | 'Beta' | 'Idea' | 'Investor Backed';
    tags: string[];
    link?: string;
}

export const products: Product[] = [
    // A. Sales, Growth & Outreach Automation
    {
        id: 6,
        title: 'AutomateLinkedInOutbound',
        subtitle: 'Automate your Linkedin to find credible B2B clients with automated outreach capacities and high conversion ratio',
        category: 'Sales & Outreach',
        status: 'Live',
        tags: ['B2B Sales', 'High ROI'],
    },
    {
        id: 10,
        title: 'LinkedInOptimizer',
        subtitle: 'A 10 step agentic prompt that helps you optimize your own linkedin profile and become a recruiter magnet profile',
        category: 'Sales & Outreach',
        status: 'Live',
        tags: ['Recruiting', 'Personal Branding'],
    },
    {
        id: 11,
        title: 'NaukriOptimizer',
        subtitle: 'Update Naukri Updates on a consistent basis to get inbound recruiter calls',
        category: 'Sales & Outreach',
        status: 'Live',
        tags: ['Job Hunt', 'Automation'],
    },
    {
        id: 12,
        title: 'XSocialHunter',
        subtitle: 'A Social Worker Engine - based on X - which helps early stage founders find invite based closed communities of their choice.',
        category: 'Sales & Outreach',
        status: 'Live',
        tags: ['Founders', 'Community'],
    },
    {
        id: 7,
        title: 'InstagramCommentEngine',
        subtitle: 'Hack Early Growth by finding relevant Instagram Reels where your ICP are spending time, to put in a credible comment and increase profile views hence increase followers',
        category: 'Sales & Outreach',
        status: 'Live',
        tags: ['Growth Hacking', 'Social Media'],
    },
    {
        id: 1,
        title: 'GitMe',
        subtitle: 'Converts any github repo into a Landing Page - Provides the Repo Owner with GTM Strategies across Social Media with a 1 month GTM Plan',
        category: 'Sales & Outreach',
        status: 'Live',
        tags: ['GTM Ready', 'Developer Tools'],
        link: '/gitme',
    },

    // B. Agentic Systems, Development & Workflows
    {
        id: 3,
        title: 'GenerateAgent',
        subtitle: "Allows anyone to Generate an Agent Prompt - with skills, set by devil's advocate and other proactive capacities",
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['Agentic', 'Prompt Engineering'],
    },
    {
        id: 2,
        title: 'StepStack',
        subtitle: 'Converts a "How to" style video into a executable workflow',
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['Video to Workflow', 'Productivity'],
        link: 'https://stepstack.live?utm_campaign=supratikspace',
    },
    {
        id: 21,
        title: 'Agentic Mermaid Workflow Executor',
        subtitle: '(like n8n/make.com) - can do more than n8n - but never commercialized',
        category: 'Agentic Systems & Workflows',
        status: 'Idea',
        tags: ['Complex Architecture', 'No-Code'],
    },
    {
        id: 29,
        title: 'PRD Context Agent',
        subtitle: 'One of the pioneering PRD Agents - avg cost is almost 85rs per Prd generation - due to latest LLM Model usage.',
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['Product Management', 'Cost-Effective'],
    },
    {
        id: 34,
        title: 'Reverse Engineer Agent',
        subtitle: 'Given Admin Credentials - this Agent can reverse engineer any website, extract its DB Schema and can overcome RLS security - and extract customer data. Very powerful hacking Agent.',
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['Cybersecurity', 'High Scale Potential'],
    },
    {
        id: 36,
        title: 'IdeaValidatorAgent',
        subtitle: 'A unique multi agentic system that allows a founder to actually validate an Idea even before thinking of building it - with an appropriate build or fake score.',
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['Founders', 'Validation'],
    },
    {
        id: 35,
        title: "A teacher's Copy Checking Agent",
        subtitle: 'Which aids teachers to check student copies online',
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['EdTech', 'Automation'],
    },
    {
        id: 20,
        title: 'CohortTracker',
        subtitle: 'A Github based automated tracking system useful for remote tech teams to track the progress and auto accept and correct PRs',
        category: 'Agentic Systems & Workflows',
        status: 'Live',
        tags: ['DevOps', 'Management'],
    },

    // C. Content Intelligence, SEO & Marketing Tech
    {
        id: 8,
        title: 'ContinuousDesignIntegration',
        subtitle: 'A state of the art - hyperframe based product video generator- Very high in demand right now',
        category: 'Content & SEO',
        status: 'Live',
        tags: ['High Demand', 'Video Generation'],
    },
    {
        id: 9,
        title: 'LandingPageGenerator',
        subtitle: 'State of the Art - Google Stitch / Figma generated Landing Page - which are conversion optimized as per product and ICP',
        category: 'Content & SEO',
        status: 'Live',
        tags: ['UI/UX', 'Conversion'],
    },
    {
        id: 30,
        title: 'SEO Sentinel',
        subtitle: 'Ingests an entire Website - and creates a 10 page report on their SEO gaps and potential',
        category: 'Content & SEO',
        status: 'Live',
        tags: ['SEO Review', 'Analytics'],
    },
    {
        id: 31,
        title: 'GEO Generator',
        subtitle: 'A Widget that any website owner can apply and generate 4 GEO based strip - plug and play - high demand - easy product to grow',
        category: 'Content & SEO',
        status: 'Live',
        tags: ['High Demand', 'Plug & Play'],
        link: 'https://citescale.com?utm_campaign=supratikspace',
    },
    {
        id: 32,
        title: 'YoutubeManager',
        subtitle: 'This is a WhatsApp Bot - currently building',
        category: 'Content & SEO',
        status: 'Beta',
        tags: ['WhatsApp Automation', 'Video'],
    },
    {
        id: 33,
        title: 'Youtube Niche Research Newsletter',
        subtitle: 'Basically ingests a niche and after thorough research shares top 3 video titles that would be the next eyeballer no one has made yet in that niche to get outlier (at least 5X) performance.',
        category: 'Content & SEO',
        status: 'Live',
        tags: ['Outlier Growth', 'Analytics'],
    },

    // D. Specialized Generative AI Applications
    {
        id: 22,
        title: 'GrokImageGenerator via Openclaw',
        status: 'Live',
        subtitle: 'Frontend Browser based automation - currently requires the grok basic plan - but can work wonders at scale',
        category: 'Generative AI',
        tags: ['Images', 'Automation'],
    },
    {
        id: 23,
        title: 'GrokVideoGenerator via Openclaw',
        subtitle: 'Frontend Browser based automation for generation of top-tier video outputs directly leveraging Grok capabilities via Openclaw.',
        category: 'Generative AI',
        status: 'Live',
        tags: ['Video', 'Scale'],
    },
    {
        id: 24,
        title: 'AIPoemWriter',
        subtitle: "Replicate a Poet's writing Style - Ingest 10-15 poems and life history of a poet to start writing poems like the Poet.",
        category: 'Generative AI',
        status: 'Live',
        tags: ['Creative Writing', 'Zero-Shot'],
    },
    {
        id: 25,
        title: 'FounderLens',
        subtitle: 'A Book Turned into a single Webpage - exactly how a founder would summarize a book - initial idea wwas a Chatgpt agent',
        category: 'Generative AI',
        status: 'Live',
        tags: ['Founders', 'Summarization'],
    },
    {
        id: 26,
        title: 'AtomicSkills',
        subtitle: 'Turns book knowledge into Claude Skills - Already public',
        category: 'Generative AI',
        status: 'Live',
        tags: ['Agent Skills', 'Public'],
    },
    {
        id: 27,
        title: 'SkillAnalyer',
        subtitle: 'Turns Claude Skills into NFT Cards - just an idea (created but never tested)',
        category: 'Generative AI',
        status: 'Idea',
        tags: ['Web3', 'Experimental'],
    },
    {
        id: 28,
        title: 'PPT Generator',
        subtitle: 'Converts Docx/PDFs into PPTs with template -  (already using - although product hallucinates with investor decks)',
        category: 'Generative AI',
        status: 'Beta',
        tags: ['Productivity', 'Generative'],
    },
    {
        id: 15,
        title: 'VoiceNavigator',
        subtitle: "Based on Rajat's original idea of a voice based web navigation system (symantic search inbuilt but requires latest LLM optimization)",
        category: 'Generative AI',
        status: 'Idea',
        tags: ['Accessibility', 'Voice UI'],
    },

    // E. Platforms, Vertical SaaS & Operations
    {
        id: 37,
        title: 'EV Aggregator Platform',
        subtitle: 'A first-of-its-kind EV aggregator — discover, compare, and buy electric vehicles across brands, price ranges, and use cases. Built for India\'s accelerating EV transition.',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['EV', 'CleanTech', 'Marketplace'],
        link: 'https://onroadev.com?utm_campaign=supratikspace',
    },
    {
        id: 4,
        title: 'MockInterview',
        subtitle: 'A Self Serve Interview platform based on any Role or JD',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['HR Tech', 'B2B'],
    },
    {
        id: 5,
        title: 'ResumeBoard',
        subtitle: 'A Job Board to aid during JobHunt',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['HR Tech', 'Consumer'],
    },
    {
        id: 13,
        title: 'CofounderSearch',
        subtitle: 'A Simple Platform that connects founders to cofounders - hwereas the platform takes care of the paperwork',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['Founders', 'Marketplace'],
    },
    {
        id: 19,
        title: 'Resume to Profile Generator',
        subtitle: 'MartianCrown core product - just upload resume to get a portfolio',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['Core Product', 'HR Tech'],
    },
    {
        id: 14,
        title: 'GoIbibo for Schools',
        subtitle: 'Just a Concept - But investor backed idea - has great business potential but might require a 5lacs Rs Investment',
        category: 'Platforms & SaaS',
        status: 'Investor Backed',
        tags: ['EdTech', 'Enterprise Potential'],
    },
    {
        id: 16,
        title: 'HospitalManagementSystem',
        subtitle: 'State of the art Hospital Management System',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['HealthTech', 'Enterprise'],
        link: 'https://medikunj.com?utm_campaign=supratikspace',
    },
    {
        id: 17,
        title: 'ClinicManagementSystem',
        subtitle: 'Clinic Management System tailored to single-doctor or small-chain clinics, equipped with smart scheduling and patient history.',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['HealthTech', 'SaaS'],
    },
    {
        id: 18,
        title: 'PharmacyManagementSystem',
        subtitle: 'Comprehensive inventory and sale management for pharmacies, integrating batch tracking and auto-ordering capabilities.',
        category: 'Platforms & SaaS',
        status: 'Live',
        tags: ['HealthTech', 'Operations'],
    },
];
