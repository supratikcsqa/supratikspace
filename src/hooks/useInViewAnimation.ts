import { useEffect, useRef } from 'react';

export const useInViewAnimation = (options = { threshold: 0.1, triggerOnce: true }) => {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    el.classList.add('animate-fade-in-up');
                    if (options.triggerOnce) observer.unobserve(el);

                    // Trigger children animations
                    const children = el.querySelectorAll('.opacity-0');
                    children.forEach((child) => {
                        (child as HTMLElement).classList.add('animate-fade-in-up');
                        if (options.triggerOnce) observer.unobserve(child);
                    });
                }
            });
        }, options);

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
            observer.disconnect();
        };
    }, [options]);

    return ref;
};
