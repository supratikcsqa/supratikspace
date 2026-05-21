/**
 * TrendyPortfolio — Homepage
 * Imports the exact components from futuristic-portfolio-design,
 * adapted to Vite/React (no Next.js, no @/ paths).
 */
import React from 'react';
import { StatusBar }    from '../components/portfolio/status-bar';
import { Hero }         from '../components/portfolio/hero';
import { Ticker }       from '../components/portfolio/ticker';
import { StackMatrix }  from '../components/portfolio/stack-matrix';
import { ShippingGrid } from '../components/portfolio/shipping-grid';
import { Timeline }     from '../components/portfolio/timeline';
import { BookingPanel } from '../components/portfolio/booking-panel';
import { SiteFooter }   from '../components/portfolio/site-footer';
import { WhatsAppWidget } from '../components/portfolio/whatsapp-widget';

const TrendyPortfolio: React.FC = () => {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <StatusBar />
            <Hero />
            <Ticker />
            <StackMatrix />
            <ShippingGrid />
            <Timeline />
            <BookingPanel />
            <SiteFooter />
            <WhatsAppWidget />
        </main>
    );
};

export default TrendyPortfolio;
