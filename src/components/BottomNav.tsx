import React, { useState, useEffect } from 'react';

export const BottomNav: React.FC = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight) {
                setShow(true);
            } else {
                setShow(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/90 backdrop-blur-md rounded-full pl-6 pr-2 py-2 flex items-center justify-between gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)]">
                <span className="font-serif text-[20px] font-semibold text-[#051A24]">S</span>
                <button className="bg-[#051A24] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-transform duration-300 hover:scale-[1.02] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
                    Start a chat
                </button>
            </div>
        </div>
    );
};
