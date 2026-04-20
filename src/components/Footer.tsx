import React from 'react';
import { Button } from './Button';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-white flex flex-col items-center">
            <div className="w-full max-w-[1200px] px-6 py-12 flex flex-col md:flex-row justify-between items-start gap-12">
                <Button variant="primary">Start a chat</Button>

                <div className="flex gap-4 md:gap-16">
                    <ArrowUpRight className="w-6 h-6 text-[#051A24]" />
                    <div className="flex flex-col gap-4 text-base text-[#051A24]">
                        <a href="#" className="hover:opacity-70 transition-opacity">Services</a>
                        <a href="#" className="hover:opacity-70 transition-opacity">Work</a>
                        <a href="#" className="hover:opacity-70 transition-opacity">About</a>
                    </div>
                    <div className="flex flex-col gap-4 text-base text-[#051A24]">
                        <a href="#" target="_blank" className="hover:opacity-70 transition-opacity">x.com</a>
                        <a href="#" target="_blank" className="hover:opacity-70 transition-opacity">LinkedIn</a>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1200px] px-6 py-4 flex justify-between items-center text-sm text-[#051A24] border-t border-[#051A24]/5">
                <span>Vortex Studio Limited</span>
                <span>Austin, USA</span>
            </div>
        </footer>
    );
};

export default Footer;
