import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ShieldCheck, Activity, Zap, Cpu } from 'lucide-react';

const Metric: React.FC<{ icon: any; label: string; value: string; colorClass: string }> = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex flex-col items-center justify-center p-4 border-r border-slate-100 last:border-none min-w[100px]">
        <div className={`p-2 rounded-lg bg-slate-50 mb-2 ${colorClass}`}>
            <Icon size={18} />
        </div>
        <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase text-center mb-0.5">{label}</div>
        <div className="text-sm font-bold text-slate-800 tracking-tight text-center">{value}</div>
    </div>
);

const HeroSection: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <motion.section ref={ref} className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden" style={{ y, opacity }}>
            {/* Light mesh is rendered in index.css */}

            <div className="max-w-4xl mx-auto px-6 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest mb-10 shadow-sm"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    System Operational
                </motion.div>

                <h1 className="text-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.05]">
                    Supratik's <br className="hidden sm:block" />
                    <span className="text-gradient font-black">Command Centre.</span>
                </h1>

                <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16 font-light leading-relaxed">
                    Manage your elite fleet with precision and speed. A minimalist command center designed for clarity, scale, and uncompromising performance.
                </p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex flex-wrap items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                >
                    <Metric icon={ShieldCheck} label="Security" value="Encrypted" colorClass="text-emerald-500" />
                    <Metric icon={Activity} label="Latency" value="12ms" colorClass="text-emerald-500" />
                    <Metric icon={Zap} label="Operations" value="48.2k/hr" colorClass="text-emerald-500" />
                    <Metric icon={Cpu} label="System" value="Stable" colorClass="text-emerald-500" />
                </motion.div>
            </div>
        </motion.section>
    );
};

export default HeroSection;
