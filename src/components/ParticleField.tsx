import { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number; y: number; vx: number; vy: number;
    size: number; opacity: number; color: string;
}

const COLORS = ['#00f0ff', '#a855f7', '#ff0080', '#00ff88', '#3b82f6'];
const CONNECTION_DIST = 130;
const MOUSE_RADIUS = 180;

const ParticleField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: -9999, y: -9999 });
    const raf = useRef<number>(0);

    const createParticles = useCallback((w: number, h: number) => {
        const count = Math.min(Math.floor((w * h) / 18000), 80);
        particles.current = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 1.8 + 0.6,
            opacity: Math.random() * 0.5 + 0.15,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        const { width: w, height: h } = canvas; ctx.clearRect(0, 0, w, h);
        const pts = particles.current; const m = mouse.current;

        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const dx = m.x - p.x; const dy = m.y - p.y; const d = Math.sqrt(dx * dx + dy * dy);
            if (d < MOUSE_RADIUS && d > 0) {
                const force = (MOUSE_RADIUS - d) / MOUSE_RADIUS;
                p.vx -= (dx / d) * force * 0.015; p.vy -= (dy / d) * force * 0.015;
            }
            p.x += p.vx; p.y += p.vy; p.vx *= 0.995; p.vy *= 0.995;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill();

            for (let j = i + 1; j < pts.length; j++) {
                const o = pts[j]; const cx = p.x - o.x; const cy = p.y - o.y; const cd = Math.sqrt(cx * cx + cy * cy);
                if (cd < CONNECTION_DIST) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(o.x, o.y);
                    ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - cd / CONNECTION_DIST) * 0.12;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1; raf.current = requestAnimationFrame(draw);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; createParticles(canvas.width, canvas.height); };
        const onMouse = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
        resize(); window.addEventListener('resize', resize); window.addEventListener('mousemove', onMouse);
        raf.current = requestAnimationFrame(draw);
        return () => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse); cancelAnimationFrame(raf.current); };
    }, [createParticles, draw]);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

export default ParticleField;
