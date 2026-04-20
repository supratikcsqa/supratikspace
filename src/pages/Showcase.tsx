import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Rocket, Code, PenTool, LayoutTemplate, Briefcase, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products, ProductCategory } from '../data/products';

const categories: { name: ProductCategory | 'All'; icon: React.ReactNode }[] = [
    { name: 'All', icon: <Briefcase className="w-4 h-4 mr-2" /> },
    { name: 'Sales & Outreach', icon: <Rocket className="w-4 h-4 mr-2" /> },
    { name: 'Agentic Systems & Workflows', icon: <Code className="w-4 h-4 mr-2" /> },
    { name: 'Content & SEO', icon: <PenTool className="w-4 h-4 mr-2" /> },
    { name: 'Generative AI', icon: <Zap className="w-4 h-4 mr-2" /> },
    { name: 'Platforms & SaaS', icon: <LayoutTemplate className="w-4 h-4 mr-2" /> },
];

const categoryColors: Record<ProductCategory, string> = {
    'Sales & Outreach': 'from-cyan-500 to-blue-500',
    'Agentic Systems & Workflows': 'from-purple-500 to-indigo-500',
    'Content & SEO': 'from-pink-500 to-rose-500',
    'Generative AI': 'from-amber-400 to-orange-500',
    'Platforms & SaaS': 'from-emerald-400 to-teal-500'
};

const Showcase: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>('All');

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter((p) => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-cyan-500/30">
            {/* Background ambient light */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[150px] rounded-full"></div>
            </div>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 sm:px-12 lg:px-24 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 mt-4">
                        Shipping the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Future.</span> <br className="hidden sm:block" />
                        One Product at a Time.
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        I build autonomous agentic systems, hyper-converting vertical SaaS, and high ROI growth engines.
                        Welcome to the vault of 35+ products crafted to disrupt.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => document.getElementById('vault')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white text-[#0B0F19] font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:-translate-y-1 transition-all"
                        >
                            Explore the Vault
                        </button>
                        <button
                            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
                        >
                            Partner with Me
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* Stats Banner */}
            <div className="border-y border-white/10 bg-white/5 backdrop-blur-md py-6 mb-20 overflow-hidden">
                <div className="flex justify-center flex-wrap gap-8 sm:gap-24 px-6 text-sm sm:text-base font-semibold tracking-wider text-gray-300">
                    <div className="flex items-center gap-3"><span className="text-cyan-400 text-xl">36</span> Products Shipped</div>
                    <div className="flex items-center gap-3"><span className="text-purple-400 text-xl">5</span> Domains Mastered</div>
                    <div className="flex items-center gap-3"><span className="text-amber-400 text-xl">100%</span> Builder Mentality</div>
                </div>
            </div>

            {/* Main Vault Content */}
            <main id="vault" className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                {/* Filter Navigation */}
                <div className="flex overflow-x-auto pb-4 mb-12 gap-3 hide-scrollbar w-full sm:flex-wrap justify-start">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name
                                ? 'bg-white text-[#0B0F19]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group relative flex flex-col justify-between p-6 bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.05] transition-colors"
                                style={{
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                {/* Top highlight bar */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${categoryColors[product.category]} opacity-50 group-hover:opacity-100 transition-opacity`} />

                                <div className="mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/90 border border-white/5">
                                            {product.status}
                                        </span>
                                        <Link to={`/${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-white/30 hover:text-cyan-400 transition-colors">
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    </div>

                                    <Link to={`/${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="group-hover:text-cyan-300 transition-colors block">
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                        {product.subtitle}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {product.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-black/30 rounded text-xs text-gray-500 font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default Showcase;
