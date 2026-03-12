import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const isLogged = localStorage.getItem('agentic_auth');
        if (isLogged === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const login = (password: string) => {
        // Basic frontend authentication check
        if (password === 'Supratik.pm.mc') {
            setIsAuthenticated(true);
            localStorage.setItem('agentic_auth', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('agentic_auth');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
