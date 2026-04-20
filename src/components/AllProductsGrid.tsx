import React from 'react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';
import { products } from '../data/products';

export const AllProductsGrid: React.FC = () => {
    return (
        <section className="max-w-[1200px] mx-auto px-6 py-20 bg-white">
            <h2 className="text-[32px] md:text-[48px] text-[#0D212C] font-serif mb-16 text-center leading-tight">
                Architecting scale across<br />36 discrete products.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                ))}
            </div>
        </section>
    );
}

const ProductCard: React.FC<{ product: any, index: number }> = ({ product, index }) => {
    const ref = useInViewAnimation({ threshold: 0.05, triggerOnce: true }) as React.RefObject<HTMLAnchorElement>;

    return (
        <a
            ref={ref}
            href={product.link || '#'}
            className="group block opacity-0 bg-white border border-[#051A24]/5 rounded-[24px] p-6 shadow-sm hover:shadow-[0_4px_30px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${(index % 6) * 0.1}s` }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#051A24]/0 to-[#051A24]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-[#051A24]/5 text-[#0D212C]">
                    {product.status}
                </span>
                {product.link && (
                    <span className="w-8 h-8 rounded-full bg-[#051A24] flex items-center justify-center -translate-y-2 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
                    </span>
                )}
            </div>

            <h3 className="font-serif text-[22px] md:text-[26px] font-semibold text-[#051A24] mb-3 relative z-10 group-hover:text-blue-900 transition-colors">
                {product.title}
            </h3>

            <p className="text-sm text-[#273C46] leading-relaxed line-clamp-3 relative z-10">
                {product.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                {product.tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md border border-[#0D212C]/10 text-[#0D212C]/60">
                        {tag}
                    </span>
                ))}
            </div>
        </a>
    );
};
