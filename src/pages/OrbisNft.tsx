import React from 'react';
import { Mail, Twitter, Github } from 'lucide-react';

const OrbisNft: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#010828] text-cream font-mono overflow-x-hidden selection:bg-neon/30">
            {/* Fixed Texture Overlay */}
            <div className="fixed inset-0 z-50 pointer-events-none mix-blend-lighten opacity-60 bg-cover bg-center" style={{ backgroundImage: "url('/texture.png')" }}></div>

            {/* SECTION 1: HERO */}
            <section className="relative w-full h-screen rounded-b-[32px] overflow-hidden">
                <video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
                    autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0"></video>

                <div className="relative z-10 h-full max-w-[1831px] mx-auto px-6 sm:px-12 lg:px-24 flex flex-col justify-between pt-8 pb-12">
                    {/* Header */}
                    <header className="flex justify-between items-center">
                        <div className="font-grotesk text-[16px] tracking-wider uppercase">Orbis.Nft</div>
                        <nav className="hidden lg:flex liquid-glass rounded-[28px] px-[52px] py-[24px] gap-8">
                            {['Homepage', 'Gallery', 'Buy NFT', 'FAQ', 'Contact'].map(link => (
                                <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="font-grotesk text-[13px] uppercase hover:text-neon transition-colors duration-300">
                                    {link}
                                </a>
                            ))}
                        </nav>
                        <div className="lg:hidden w-8"></div> {/* Spacer for mobile */}
                    </header>

                    {/* Social Icons (Desktop) */}
                    <div className="hidden lg:flex flex-col gap-4 absolute top-8 right-24">
                        {[Mail, Twitter, Github].map((Icon, i) => (
                            <a href="#" key={i} className="liquid-glass w-[56px] h-[56px] rounded-[1rem] flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Icon className="w-5 h-5 text-cream" />
                            </a>
                        ))}
                    </div>

                    {/* Hero Content */}
                    <div className="relative max-w-[780px] lg:ml-32 mt-auto mb-[15vh]">
                        <h1 className="font-grotesk uppercase text-[40px] sm:text-[60px] md:text-[75px] lg:text-[90px] leading-[1.05] md:leading-[1]">
                            Beyond earth<br />and ( its ) familiar boundaries
                        </h1>
                        <span className="font-condiment text-neon mix-blend-exclusion opacity-90 absolute right-0 bottom-[-20px] sm:bottom-[10px] md:bottom-[20px] lg:right-[50px] -rotate-1 text-[24px] sm:text-[36px] md:text-[40px] lg:text-[48px]">
                            Nft collection
                        </span>
                    </div>

                    {/* Social Icons (Mobile) */}
                    <div className="flex lg:hidden justify-center gap-4 mt-8">
                        {[Mail, Twitter, Github].map((Icon, i) => (
                            <a href="#" key={i} className="liquid-glass w-[56px] h-[56px] rounded-[1rem] flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Icon className="w-5 h-5 text-cream" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 2: ABOUT / INTRO */}
            <section className="relative w-full min-h-screen">
                <video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4"
                    autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0"></video>

                <div className="relative z-10 w-full h-full max-w-[1831px] mx-auto px-6 sm:px-12 lg:px-24 py-[64px] lg:py-[96px] flex flex-col justify-between min-h-screen">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-0">
                        <div className="relative">
                            <h2 className="font-grotesk uppercase text-[32px] sm:text-[48px] lg:text-[60px] leading-[1.1]">
                                Hello!<br />I'm orbis
                            </h2>
                            <span className="font-condiment text-neon mix-blend-exclusion absolute bottom-[-10px] right-[-20px] lg:bottom-[-20px] lg:right-[-40px] -rotate-2 text-[36px] sm:text-[52px] lg:text-[68px]">
                                Orbis
                            </span>
                        </div>
                        <p className="font-mono uppercase text-[14px] sm:text-[16px] text-cream max-w-[266px] leading-relaxed">
                            A digital object fixed beyond time and place. An exploration of distance, form, and silence in space
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-end mt-[20vh] gap-8 text-[#010828] lg:text-cream/10">
                        <p className="font-mono uppercase text-[14px] sm:text-[16px] max-w-[266px] leading-relaxed">
                            A digital object fixed beyond time and place. An exploration of distance, form, and silence in space
                        </p>
                        <p className="hidden lg:block font-mono uppercase text-[16px] max-w-[266px] leading-relaxed">
                            A digital object fixed beyond time and place. An exploration of distance, form, and silence in space
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 3: NFT COLLECTION GRID */}
            <section className="bg-[#010828] w-full max-w-[1831px] mx-auto px-6 sm:px-12 lg:px-24 py-24 lg:py-32">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16 lg:mb-24">
                    <h2 className="font-grotesk uppercase text-[32px] sm:text-[48px] lg:text-[60px] leading-[1.1]">
                        Collection of<br />
                        <span className="inline-block ml-12 sm:ml-24 lg:ml-32">
                            <span className="font-condiment text-neon lowercase items-baseline pr-3 tracking-widest text-[40px] sm:text-[56px] lg:text-[72px]">Space</span>
                            objects
                        </span>
                    </h2>
                    <div className="relative group cursor-pointer inline-block">
                        <div className="flex items-end gap-3 font-grotesk uppercase leading-none">
                            <span className="text-[32px] sm:text-[48px] lg:text-[60px]">SEE</span>
                            <div className="flex flex-col text-[20px] sm:text-[28px] lg:text-[36px]">
                                <span>ALL</span>
                                <span>CREATORS</span>
                            </div>
                        </div>
                        <div className="w-full h-[6px] sm:h-[8px] lg:h-[10px] bg-neon mt-2 group-hover:bg-cream transition-colors duration-300"></div>
                    </div>
                </div>

                {/* NFT Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                    {[
                        { v: 'hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4', s: '8.7' },
                        { v: 'hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4', s: '9' },
                        { v: 'hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4', s: '8.2' }
                    ].map((item, idx) => (
                        <div key={idx} className="liquid-glass rounded-[32px] p-[18px] hover:bg-white/10 transition-colors duration-500 cursor-pointer group">
                            <div className="relative w-full pb-[100%] rounded-[24px] overflow-hidden mb-4">
                                <video src={`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/${item.v}`}
                                    autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover"></video>
                            </div>
                            <div className="liquid-glass rounded-[20px] px-5 py-4 flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-cream/70 font-mono tracking-widest">RARITY SCORE:</span>
                                    <span className="text-[16px] font-grotesk tracking-wider">{item.s}/10</span>
                                </div>
                                <button className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white ml-0.5"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 4: CTA */}
            <section className="relative w-full bg-[#010828] overflow-hidden">
                <video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4"
                    autoPlay loop muted playsInline className="w-full h-auto block opacity-80"></video>

                {/* CTA Texts */}
                <div className="absolute inset-0 z-10 flex items-center justify-end px-6 sm:px-12 lg:pr-[20%] lg:pl-[15%]">
                    <div className="relative pl-6 lg:pl-16">
                        <span className="font-condiment text-neon mix-blend-exclusion absolute top-[-30px] left-[-10px] lg:top-[-40px] lg:left-[-20px] text-[17px] sm:text-[40px] lg:text-[68px] -rotate-3">
                            Go beyond
                        </span>
                        <h2 className="font-grotesk uppercase text-[16px] sm:text-[36px] md:text-[48px] lg:text-[60px] leading-[1.1] text-right">
                            <div className="mb-4 lg:mb-12">JOIN US.</div>
                            <div>REVEAL WHAT'S HIDDEN.</div>
                            <div>DEFINE WHAT'S NEXT.</div>
                            <div>FOLLOW THE SIGNAL.</div>
                        </h2>
                    </div>
                </div>

                {/* Social Icons Bottom-Left */}
                <div className="absolute left-[8%] bottom-[12%] lg:bottom-[20%] z-20">
                    <div className="liquid-glass rounded-[0.5rem] lg:rounded-[1.25rem] flex flex-col">
                        {[Mail, Twitter, Github].map((Icon, i) => (
                            <a href="#" key={i} className={`flex items-center w-[14vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem] py-3 sm:py-5 lg:py-6 justify-center hover:bg-white/10 transition-colors ${i !== 2 ? 'border-b border-white/10' : ''}`}>
                                <Icon className="w-[4vw] h-[4vw] sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cream" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OrbisNft;
