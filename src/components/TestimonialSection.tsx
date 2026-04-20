import React, { useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

export const TestimonialSection: React.FC = () => {
    const sectionRef = useInViewAnimation() as React.RefObject<HTMLDivElement>;
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        let animationFrameId: number;
        const handleScroll = () => {
            animationFrameId = requestAnimationFrame(() => {
                if (!imageRef.current) return;
                const rect = imageRef.current.getBoundingClientRect();
                const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
                if (scrollPercent > 0 && scrollPercent < 2) {
                    const offset = Math.min(Math.max((scrollPercent - 0.5) * 100, -50), 50);
                    imageRef.current.style.transform = `translateY(${offset}px)`;
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <section ref={sectionRef} className="py-12 px-6 max-w-2xl mx-auto flex flex-col items-center text-center">
            <Quote className="w-6 h-6 text-slate-900 mb-6 opacity-0" style={{ animationDelay: '0.1s' }} />

            <h2 className="text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] text-[#0D212C] tracking-tight mb-8 opacity-0" style={{ animationDelay: '0.2s' }}>
                'I built the architecture I always wanted to work with, combining high-speed execution with <span className="font-serif">Enterprise Precision</span>'
            </h2>

            <p className="italic text-sm text-[#273C46] mb-8 opacity-0" style={{ animationDelay: '0.3s' }}>
                Supratik / Product Engineer
            </p>

            <div className="flex gap-8 items-center mb-16 opacity-0 font-medium text-slate-900 text-[24px]" style={{ animationDelay: '0.4s' }}>
                <span>Apple</span>
                <span>IDEO</span>
                <span>Polygon</span>
            </div>

            <div className="relative w-full max-w-xs overflow-hidden rounded-2xl shadow-lg opacity-0" style={{ animationDelay: '0.5s' }}>
                <img
                    ref={imageRef}
                    src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260330_103804_7aa5494f-4d5b-432e-9dc7-20715275f143.png&w=1280&q=85"
                    alt="Creative Portrait"
                    className="w-full h-auto object-cover transition-transform duration-75 ease-out scale-110"
                />
            </div>
        </section>
    );
};
