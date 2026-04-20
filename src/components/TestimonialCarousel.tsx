import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export const TestimonialCarousel: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const testimonials = [
        { name: "Marcus Anderson", role: "CEO, Data.storage", quote: "With very little guidance the team delivered architectures that were consistently spot on and hyper-performant." },
        { name: "Alex Wu", role: "Founder, Nexgate", quote: "Supratik led the creation of our best fundraising suite to date! Pure engineering excellence." },
        { name: "James Mitchell", role: "VP Product, LaunchPad", quote: "Working with this ecosystem transformed our product vision entirely." },
        { name: "Rachel Foster", role: "Co-founder, Nexus Labs", quote: "The deployment speed exceeded our highest expectations." },
        { name: "David Zhang", role: "Head of Design, Paradigm", quote: "Incredible full-stack implementation from start to finish." }
    ];

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isHovered, testimonials.length]);

    const next = () => setActiveIndex((c) => (c + 1) % testimonials.length);
    const prev = () => setActiveIndex((c) => (c - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="w-full py-20 bg-white overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className="md:max-w-4xl md:mx-auto px-6 mb-8 flex justify-between items-center w-full">
                <h2 className="text-[32px] md:text-[40px] text-[#0D212C] font-serif leading-none">What builders say</h2>
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-black text-black" />)}
                    </div>
                    <span className="font-medium text-sm">Clutch 5/5</span>
                </div>
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-6">
                <div className="flex overflow-hidden relative min-h-[350px]">
                    {testimonials.map((t, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                            <div
                                key={idx}
                                className={`absolute top-0 left-0 w-full md:w-[427.5px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive ? 'opacity-100 scale-100 relative z-10' : 'opacity-0 scale-95 md:translate-x-[20%] pointer-events-none z-0 absolute'
                                    }`}
                            >
                                <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-6 md:pl-10 md:pr-10 py-8 border border-gray-50 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="mb-6 opacity-20">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                                        </div>
                                        <p className="text-base text-[#0D212C] leading-relaxed mb-8">"{t.quote}"</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 animate-pulse"></div>
                                        <div>
                                            <div className="font-semibold text-sm text-[#0D212C]">{t.name}</div>
                                            <div className="text-xs text-[#273C46] flex items-center gap-1">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                {t.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center md:justify-start gap-4 mt-8">
                    <button onClick={prev} className="w-12 h-12 rounded-full border border-[#0D212C]/20 flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-[#0D212C]" />
                    </button>
                    <button onClick={next} className="w-12 h-12 rounded-full border border-[#0D212C]/20 flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <ChevronRight className="w-5 h-5 text-[#0D212C]" />
                    </button>
                </div>
            </div>
        </section>
    );
};
