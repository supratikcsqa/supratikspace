import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentProvider } from './contexts/AgentContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Frontend from './pages/Frontend';
import AdminDashboard from './pages/AdminDashboard';
import AgentWorkspace from './pages/AgentWorkspace';
import Login from './pages/Login';

// Higher order component for route protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <AgentProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Frontend />} />
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
                </BrowserRouter>
            </AgentProvider>
        </AuthProvider>
    );
}

export default App;
