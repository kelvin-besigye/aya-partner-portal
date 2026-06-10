import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage'; // 1. IMPORT THE NEW CHASSIS

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* 2. INJECT THE CHASSIS HERE */}
                    {/* Notice we use "/*" so the HomePage can handle its own nested URLs like /treasury */}
                    <Route 
                        path="/*" 
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;  