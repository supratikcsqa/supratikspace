import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentProvider } from './contexts/AgentContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebMCPProvider } from './webmcp';
import { initWebMCPPostMessageListener } from './webmcp';
import Frontend from './pages/Frontend';
import AdminDashboard from './pages/AdminDashboard';
import AgentWorkspace from './pages/AgentWorkspace';
import Login from './pages/Login';
import LaunchPage from './pages/LaunchPage';
import { getLaunchSlugFromHost } from './lib/repoLaunch';

// Higher order component for route protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// WebMCP RPC Initializer (bootstraps postMessage listener)
const WebMCPRPCBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        const cleanup = initWebMCPPostMessageListener();
        return cleanup;
    }, []);
    return <>{children}</>;
};

function App() {
    const hostLaunchSlug = typeof window !== 'undefined' ? getLaunchSlugFromHost(window.location.hostname) : null;

    return (
        <AuthProvider>
            <AgentProvider>
                <BrowserRouter>
                    <WebMCPProvider>
                        <WebMCPRPCBootstrap>
                            <Routes>
                                <Route path="/" element={hostLaunchSlug ? <LaunchPage forcedSlug={hostLaunchSlug} /> : <Frontend />} />
                                <Route path="/launch/:slug" element={<LaunchPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/agent/:agentId" element={<AgentWorkspace />} />
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </WebMCPRPCBootstrap>
                    </WebMCPProvider>
                </BrowserRouter>
            </AgentProvider>
        </AuthProvider>
    );
}

export default App;
