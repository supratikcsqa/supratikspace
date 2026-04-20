import React from 'react';
import { Hero } from '../components/Hero';
import { InfiniteMarquee } from '../components/InfiniteMarquee';
import { TestimonialSection } from '../components/TestimonialSection';
import { PricingSection } from '../components/PricingSection';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { AllProductsGrid } from '../components/AllProductsGrid';
import { PartnerSection } from '../components/PartnerSection';
import { Footer } from '../components/Footer';
import { BottomNav } from '../components/BottomNav';

const TrendyPortfolio: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-[#051A24] font-sans selection:bg-[#051A24]/10">
            <Hero />
            <InfiniteMarquee />
            <TestimonialSection />
            <PricingSection />
            <TestimonialCarousel />
            <AllProductsGrid />
            <PartnerSection />
            <Footer />
            <BottomNav />
        </div>
    );
};

export default TrendyPortfolio;
