import React from 'react';

export const InfiniteMarquee: React.FC = () => {
    const images = [
        "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
        "https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif",
        "https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif",
        "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
        "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
        "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
        "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
        "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif"
    ];

    const allImages = [...images, ...images];

    return (
        <section className="w-full mt-16 md:mt-20 mb-16 overflow-hidden relative bg-white">
            <div className="flex w-max animate-marquee">
                {allImages.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt="Project showcase loop"
                        className="h-[280px] md:h-[500px] object-cover mx-3 rounded-2xl shadow-lg w-auto"
                        loading="lazy"
                    />
                ))}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                @media (max-width: 768px) {
                    .animate-marquee {
                        animation: marquee 15s linear infinite;
                    }
                }
            `}</style>
        </section>
    );
};
