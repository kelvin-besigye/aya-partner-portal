import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Bus, FileText, Wallet, Zap, Store, 
    LifeBuoy, LogOut, Menu, X, Sun, Moon 
} from 'lucide-react';

// --- LIVE MODULES ---
import ManifestHub from '../modules/manifest/ManifestHub';
import PartnerStoreModule from '../modules/store/PartnerStoreModule';
import TreasuryModule from '../modules/treasury/TreasuryModule';
import SurgeModule from '../modules/surge/SurgeModule';
import SupportModule from '../modules/support/SupportModule'; // 🚀 INJECTED SUPPORT MODULE

/**
 * AYABUS PARTNER PORTAL
 * ------------------------------------------------------------------
 * Module: Main Application Layout
 * File: HomePage.jsx
 */

const HomePage = () => {
    const { tenant, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Controls the right-hand sliding menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ========================================================================
    // THEME ENGINE: Self-contained local state so toggle works both ways
    // ========================================================================
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);
    // ========================================================================

    // Lock body scroll when menu is open to prevent double-scrolling on mobile
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    // --- NAVIGATION ARCHITECTURE ---
    const MENU_CATEGORIES = [
        {
            title: 'Operations',
            items: [
                { path: '/manifest', label: 'Live Manifest', icon: <FileText size={18} /> },
                { path: '/surge', label: 'Surge Exchange', icon: <Zap size={18} /> },
            ]
        },
        {
            title: 'Assets & Finance',
            items: [
                { path: '/treasury', label: 'Financial Ledger', icon: <Wallet size={18} /> },
                { path: '/store', label: 'Partner Store', icon: <Store size={18} /> },
            ]
        },
        {
            title: 'Support',
            items: [
                { path: '/help', label: 'Concierge Support', icon: <LifeBuoy size={18} /> },
            ]
        }
    ];

    // --- DEFAULT HOME VIEW (Command Centre) ---
    const HomeView = () => (
        <div className="home-empty-state">
            <div className="welcome-container">
                <div className="icon-wrapper">
                    <Bus size={48} strokeWidth={1.5} />
                </div>
                <h1>{tenant?.company_name || 'Partner'} Command Centre</h1>
                <p>Welcome to the AyaBus Partner Portal. Select a module from the menu to begin.</p>
            </div>
        </div>
    );

    return (
        <div className="app-layout">
            
            {/* =========================================
                1. TOP NAVIGATION BAR
            ========================================= */}
            <header className="top-header">
                {/* LEFT: Branding & Home Link */}
                <div 
                    className="brand-container"
                    onClick={() => {
                        navigate('/');
                        setIsMenuOpen(false);
                    }}
                >
                    <div className="logo-box">
                        <Bus size={20} />
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">AyaBus</span>
                        <span className="brand-subtitle">Partner Portal</span>
                    </div>
                </div>

                {/* RIGHT: Theme Toggle & Hamburger */}
                <div className="header-actions">
                    <button 
                        className="action-btn theme-toggle" 
                        onClick={toggleTheme}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button 
                        className="action-btn menu-toggle" 
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* =========================================
                2. MAIN VIEWPORT (Routing Container)
            ========================================= */}
            <main className="main-viewport">
                <Routes>
                    <Route path="/" element={<HomeView />} />
                    <Route path="/manifest" element={<ManifestHub />} />
                    <Route path="/store/*" element={<PartnerStoreModule />} />
                    <Route path="/treasury/*" element={<TreasuryModule />} />
                    {/* 🚀 THE SURGE ENGINE ROUTE */}
                    <Route path="/surge/*" element={<SurgeModule />} />
                    {/* 🚀 THE SUPPORT HUB ROUTE */}
                    <Route path="/help/*" element={<SupportModule />} />
                    {/* Add future routes here */}
                </Routes>
            </main>

            {/* =========================================
                3. RIGHT-SIDE SLIDING DRAWER MENU
            ========================================= */}
            {isMenuOpen && (
                <div className="drawer-overlay">
                    {/* Backdrop to click-to-close */}
                    <div className="drawer-backdrop" onClick={() => setIsMenuOpen(false)} />
                    
                    {/* Sliding Panel */}
                    <aside className="drawer-panel">
                        {/* Drawer Header */}
                        <div className="drawer-header">
                            <div className="user-info">
                                <span className="user-company">{tenant?.company_name || 'Partner'}</span>
                                <span className="user-role">Authorized Operator</span>
                            </div>
                            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="drawer-nav">
                            {MENU_CATEGORIES.map((cat, idx) => (
                                <div key={idx} className="nav-category">
                                    <div className="category-title">{cat.title}</div>
                                    {cat.items.map(item => {
                                        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
                                        return (
                                            <button 
                                                key={item.path}
                                                className={`nav-item ${isActive ? 'active' : ''}`}
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setIsMenuOpen(false); // Auto-close on navigate
                                                }}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>

                        {/* Drawer Footer (Logout) */}
                        <div className="drawer-footer">
                            <button className="logout-btn" onClick={logout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* =========================================
                4. COMPONENT CSS
            ========================================= */}
            <style>{`
                .app-layout {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-canvas);
                    overflow: hidden;
                }

                /* --- TOP HEADER --- */
                .top-header {
                    height: 72px;
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    flex-shrink: 0;
                    z-index: 100;
                }

                .brand-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    user-select: none;
                    transition: opacity 0.2s;
                }
                .brand-container:hover { opacity: 0.8; }

                .logo-box {
                    width: 40px;
                    height: 40px;
                    background: var(--brand-primary);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #FFF;
                }

                .brand-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .brand-title {
                    font-size: 18px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                .brand-subtitle {
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--brand-primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    line-height: 1;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .action-btn {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-main);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .action-btn:hover {
                    background: var(--bg-input);
                    border-color: var(--border-subtle);
                }

                /* --- MAIN VIEWPORT --- */
                .main-viewport {
                    flex: 1;
                    overflow: auto;
                    position: relative;
                }

                .home-empty-state {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .welcome-container {
                    text-align: center;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    animation: fadeIn 0.4s ease;
                }

                .icon-wrapper {
                    width: 80px;
                    height: 80px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--brand-primary);
                    margin-bottom: 8px;
                }

                .welcome-container h1 {
                    font-size: 24px;
                    font-weight: 900;
                    color: var(--text-main);
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .welcome-container p {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0;
                    line-height: 1.5;
                }

                /* --- DRAWER MENU --- */
                .drawer-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 9999;
                    display: flex;
                    justify-content: flex-end;
                }

                .drawer-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(2px);
                    animation: fadeIn 0.3s ease;
                }

                .drawer-panel {
                    position: relative;
                    width: 320px;
                    max-width: 100vw;
                    height: 100%;
                    background: var(--bg-surface);
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .drawer-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border-subtle);
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .user-company {
                    font-size: 16px;
                    font-weight: 900;
                    color: var(--text-main);
                }

                .user-role {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .close-btn {
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-main);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .close-btn:hover {
                    background: var(--border-strong);
                    transform: rotate(90deg);
                }

                .drawer-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .nav-category {
                    margin-bottom: 32px;
                }

                .category-title {
                    font-size: 11px;
                    font-weight: 900;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
                    padding-left: 12px;
                }

                .nav-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-main);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 4px;
                }
                .nav-item:hover {
                    background: var(--bg-input);
                }
                .nav-item.active {
                    background: rgba(206, 172, 92, 0.1);
                    color: var(--brand-primary);
                    font-weight: 800;
                }

                .drawer-footer {
                    padding: 24px;
                    border-top: 1px solid var(--border-subtle);
                    background: var(--bg-input);
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--status-error);
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.15);
                    transform: translateY(-1px);
                }

                /* --- ANIMATIONS --- */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                /* Scrollbar overrides for drawer */
                .drawer-nav::-webkit-scrollbar { width: 4px; }
                .drawer-nav::-webkit-scrollbar-track { background: transparent; }
                .drawer-nav::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default HomePage;