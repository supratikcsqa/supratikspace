import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

const Login: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/admin');
        } else {
            setError(true);
            setTimeout(() => setError(false), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="mesh-bg" />
            <div className="relative z-10 w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-4 shadow-sm">
                        <ShieldAlert size={24} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Admin Override</h2>
                    <p className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest text-center">Authentication Required</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Access Code..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-widest text-xs uppercase shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                    >
                        Authenticate
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs font-mono text-center tracking-widest uppercase">
                        Access Denied
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 flex justify-center w-full z-10">
                <button onClick={() => navigate('/')} className="text-[10px] font-mono text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                    &larr; Return to Fleet
                </button>
            </div>
        </div>
    );
};

export default Login;
