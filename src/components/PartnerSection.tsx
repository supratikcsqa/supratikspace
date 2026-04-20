import React, { useState, useRef } from 'react';

export const PartnerSection: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [thumbs, setThumbs] = useState<{ id: number, x: number, y: number, r: number, src: string }[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(0);
    const lastSpawnTime = useRef(0);

    const images = [
        "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
        "https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif",
        "https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif"
    ];

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        const now = Date.now();
        if (now - lastSpawnTime.current > 150) {
            spawnThumb(x, y);
            lastSpawnTime.current = now;
        }
    };

    const spawnThumb = (x: number, y: number) => {
        const rotation = Math.random() * 20 - 10;
        const newThumb = {
            id: nextId.current++,
            x, y, r: rotation,
            src: images[nextId.current % images.length]
        };
        setThumbs(prev => [...prev, newThumb]);

        setTimeout(() => {
            setThumbs(prev => prev.filter(t => t.id !== newThumb.id));
        }, 1000);
    };

    return (
        <section className="w-full py-12 px-6 bg-white overflow-hidden transition-all duration-300" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setThumbs([])}>
            <div className="max-w-7xl mx-auto py-32 md:py-48 rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden bg-white">

                {thumbs.map(t => (
                    <img
                        key={t.id}
                        src={t.src}
                        className="absolute w-[180px] h-[120px] object-cover rounded-xl shadow-xl pointer-events-none z-0 mix-blend-multiply opacity-0 animate-[thumb-fade_1s_ease-out_forwards]"
                        style={{ left: t.x - 90, top: t.y - 60, transform: `rotate(${t.r}deg)` }}
                        alt=""
                    />
                ))}

                <h2 className="text-[48px] md:text-[64px] lg:text-[80px] text-[#0D212C] font-serif mb-12 relative z-10 pointer-events-none">
                    Partner with me
                </h2>

                <button className="bg-[#051A24] text-white rounded-full px-2 py-2 pr-6 flex items-center gap-4 relative z-10 shadow-[0_1px_2px_0_rgba(5,26,36,0.1),0_4px_4px_0_rgba(5,26,36,0.09),0_9px_6px_0_rgba(5,26,36,0.05),inset_0_2px_8px_0_rgba(255,255,255,0.5)] hover:scale-105 transition-transform duration-300">
                    <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150" alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <span className="font-medium whitespace-nowrap">Start chat with Supratik</span>
                </button>
            </div>
            <style>{`
                @keyframes thumb-fade {
                    0% { opacity: 0; transform: scale(0.8) rotate(var(--r)); }
                    10% { opacity: 1; transform: scale(1.05) rotate(var(--r)); }
                    100% { opacity: 0; transform: scale(0.9) rotate(var(--r)); }
                }
            `}</style>
        </section>
    );
};
