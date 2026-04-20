import React from 'react';
import { Button } from './Button';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

export const Hero: React.FC = () => {
    const ref = useInViewAnimation() as React.RefObject<HTMLDivElement>;

    return (
        <section ref={ref} className="w-full flex justify-center items-center pt-12 md:pt-16 px-6 relative rounded-b-[40px] bg-white pb-10">
            <div className="max-w-[440px] w-full flex flex-col items-center text-center">
                <h1 className="font-serif text-[32px] md:text-[40px] lg:text-[44px] font-semibold text-[#051A24] tracking-tight mb-4 opacity-0" style={{ animationDelay: '0.1s' }}>
                    Supratik
                </h1>

                <p className="font-mono text-xs md:text-sm text-[#051A24] mb-2 opacity-0" style={{ animationDelay: '0.2s' }}>
                    The creative ecosystem of a Product Engineer
                </p>

                <h2 className="text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] text-[#0D212C] tracking-tight whitespace-nowrap opacity-0" style={{ animationDelay: '0.3s' }}>
                    Build the <span className="font-serif">next wave,</span><br />the <span className="font-serif">bold way.</span>
                </h2>

                <div className="flex flex-col gap-6 text-sm md:text-base text-[#051A24] leading-relaxed mt-5 md:mt-6 text-left opacity-0" style={{ animationDelay: '0.4s' }}>
                    <p>
                        I spent years crafting products used by millions. I build to bring that same level of thinking to innovators shaping what comes next.
                    </p>
                    <p>
                        This portfolio is deliberately comprehensive. I guide the creative vision on every product, backed by an elite engineering framework that moves fast without cutting corners.
                    </p>
                    <p>
                        Projects execute at hyper-scale.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-5 md:mt-10 w-full opacity-0" style={{ animationDelay: '0.5s' }}>
                    <Button variant="primary" className="w-full sm:w-auto">Start a chat</Button>
                    <Button variant="secondary" className="w-full sm:w-auto">View products</Button>
                </div>
            </div>
        </section>
    );
};
