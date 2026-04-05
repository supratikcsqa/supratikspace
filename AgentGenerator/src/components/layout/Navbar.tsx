'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, History, BookOpen, BarChart2, Key, X, Eye, EyeOff } from 'lucide-react';

const NAV_LINKS = [
    { href: '/', label: 'Generate', icon: Cpu },
    { href: '/history', label: 'History', icon: History },
    { href: '/docs', label: 'How to Use', icon: BookOpen },
    { href: '/stats', label: 'Stats', icon: BarChart2 },
];

const PROVIDERS = [
    { key: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
    { key: 'google', label: 'Google AI', placeholder: 'AIza...' },
    { key: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
];

export function Navbar() {
    const pathname = usePathname();
    const [showKeys, setShowKeys] = useState(false);
    const [visible, setVisible] = useState<Record<string, boolean>>({});
    const [keys, setKeys] = useState<Record<string, string>>({});

    useEffect(() => {
        const stored: Record<string, string> = {};
        PROVIDERS.forEach(({ key }) => {
            const val = localStorage.getItem(`apikey_${key}`);
            if (val) stored[key] = val;
        });
        setKeys(stored);
    }, []);

    const saveKey = (provider: string, value: string) => {
        setKeys((prev) => ({ ...prev, [provider]: value }));
        localStorage.setItem(`apikey_${provider}`, value);
    };

    const keysConfigured = PROVIDERS.filter(({ key }) => !!keys[key]).length;

    return (
        <>
            <nav className="navbar">
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Cpu size={18} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                        Agent<span className="gradient-text">Forge</span>
                    </span>
                </Link>

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 8,
                                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                                    color: active ? 'white' : 'var(--text-secondary)',
                                    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                                    transition: 'all 200ms',
                                }}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* API Key button */}
                <button className="btn-ghost" onClick={() => setShowKeys(true)} style={{ fontSize: 13 }}>
                    <Key size={14} />
                    API Keys
                    {keysConfigured > 0 && (
                        <span style={{
                            background: '#10b981', color: 'white', fontSize: 11, fontWeight: 600,
                            padding: '1px 6px', borderRadius: 999,
                        }}>
                            {keysConfigured}
                        </span>
                    )}
                </button>
            </nav>

            {/* API Key Panel */}
            {showKeys && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                }} onClick={() => setShowKeys(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="animate-fade-in"
                        style={{
                            width: 380, margin: '60px 16px 0 0',
                            background: '#111827', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', padding: 24,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>API Keys (BYOK)</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                    Keys stored in localStorage only — never sent to our servers
                                </p>
                            </div>
                            <button onClick={() => setShowKeys(false)} className="btn-ghost" style={{ padding: '6px 8px' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {PROVIDERS.map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                        {label}
                                        {keys[key] && (
                                            <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: 4 }}>
                                                ✓ set
                                            </span>
                                        )}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={visible[key] ? 'text' : 'password'}
                                            value={keys[key] ?? ''}
                                            onChange={(e) => saveKey(key, e.target.value)}
                                            placeholder={placeholder}
                                            style={{
                                                width: '100%', padding: '10px 40px 10px 12px',
                                                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                                                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
                                                fontFamily: 'JetBrains Mono, monospace', outline: 'none',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = 'var(--accent-start)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                                        />
                                        <button
                                            onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                                            style={{
                                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                            }}
                                        >
                                            {visible[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Your keys are used directly in your browser requests and are never logged or stored server-side.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
