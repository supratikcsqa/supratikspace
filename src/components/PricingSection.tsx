import React from 'react';
import { Button } from './Button';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

export const PricingSection: React.FC = () => {
    const ref = useInViewAnimation() as React.RefObject<HTMLDivElement>;

    return (
        <section ref={ref} className="w-full py-12 px-6 flex md:justify-end md:max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

                {/* Card 1 Dark */}
                <div className="bg-[#051A24] rounded-[40px] pl-10 pr-10 md:pr-24 pt-10 pb-10 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)] opacity-0" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-[22px] font-medium text-[#F6FCFF] mb-4">Strategic Advisory</h3>
                    <p className="text-[#E0EBF0] mb-12 opacity-80 leading-relaxed">
                        A dedicated product engineering architect.<br />You work directly with me.
                    </p>
                    <div className="mb-10">
                        <span className="text-2xl text-[#F6FCFF] font-medium block">$10,000</span>
                        <span className="text-[#E0EBF0] opacity-60 text-sm">Monthly</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="secondary">Start a chat</Button>
                        <Button variant="tertiary" className="!bg-transparent !text-white !border-white/20">How it works</Button>
                    </div>
                </div>

                {/* Card 2 Light */}
                <div className="bg-white rounded-[40px] pl-10 pr-10 md:pr-24 pt-10 pb-10 shadow-[0_4px_16px_rgba(0,0,0,0.08)] opacity-0" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-[22px] font-medium text-[#0D212C] mb-4">Custom Pipeline</h3>
                    <p className="text-[#273C46] mb-12 leading-relaxed">
                        Fixed scope, rapid timeline.<br />Zero compromises on architecture.
                    </p>
                    <div className="mb-10">
                        <span className="text-2xl text-[#0D212C] font-medium block">$15,000</span>
                        <span className="text-[#273C46] opacity-60 text-sm">Minimum</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="tertiary">Start a chat</Button>
                    </div>
                </div>

            </div>
        </section>
    );
};
