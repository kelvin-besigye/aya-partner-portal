/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Layout
 * File: StoreTabBar.jsx
 * * DESCRIPTION:
 * The apex navigation primitive for the Partner Store ecosystem. 
 * Allows the operator to seamlessly swap between the 4 Data Vaults 
 * (Corporate, Fleet, Routes, Timetable) without triggering a page reload.
 * * WORLD-CLASS PHYSICS:
 * 1. DICTIONARY DRIVEN: Iterates directly over `STORE_ASSET_TYPES` from 
 * the physics engine, ensuring total synchronization if a 5th tab is ever added.
 * 2. OMNI-DIRECTIONAL SCROLL: Wrapped in a fluid track with hidden scrollbars 
 * so it glides perfectly on mobile touchscreens without compressing the tabs.
 * 3. KINETIC INDICATORS: The active tab uses a bold AyaBus Gold underline 
 * and a subtle background illumination to ground the user's location.
 */

import React, { useRef, useEffect } from 'react';
import { STORE_ASSET_TYPES } from '../../data/store.dictionary';

const StoreTabBar = ({ activeTab, onTabChange }) => {
    const tabTrackRef = useRef(null);

    // Ensure the active tab is always visible in the scrollable track on mobile
    useEffect(() => {
        if (tabTrackRef.current) {
            const activeElement = tabTrackRef.current.querySelector('.store-tab-btn.active');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [activeTab]);

    // Extract the dictionary objects into an iterable array
    const tabs = Object.values(STORE_ASSET_TYPES);

    return (
        <div className="store-tab-chassis">
            <div className="store-tab-track" ref={tabTrackRef}>
                {tabs.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    const TabIcon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            className={`store-tab-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                            role="tab"
                            aria-selected={isSelected}
                        >
                            {/* 1. ICON ZONE */}
                            <div className="tab-icon-wrapper">
                                <TabIcon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                            </div>

                            {/* 2. TYPOGRAPHY ZONE */}
                            <div className="tab-text-wrapper">
                                <span className="tab-label">{tab.label}</span>
                                <span className="tab-description">{tab.description}</span>
                            </div>
                            
                            {/* 3. ACTIVE INDICATOR (The Gold Line) */}
                            {isSelected && <div className="tab-active-indicator" />}
                        </button>
                    );
                })}
            </div>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .store-tab-chassis {
                    width: 100%;
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle);
                    position: sticky;
                    top: 0;
                    z-index: 40;
                }

                /* SCROLLABLE TRACK FOR MOBILE */
                .store-tab-track {
                    display: flex;
                    align-items: flex-end; /* Aligns tabs to the bottom border */
                    gap: 8px;
                    padding: 0 24px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none;  /* IE and Edge */
                }
                .store-tab-track::-webkit-scrollbar {
                    display: none; /* Chrome, Safari and Opera */
                }

                /* INDIVIDUAL TAB BUTTON */
                .store-tab-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 16px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    min-width: max-content;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    outline: none;
                }

                /* HOVER KINETICS */
                .store-tab-btn:hover:not(.active) {
                    background: var(--bg-input);
                    border-radius: 12px 12px 0 0;
                }
                .store-tab-btn:hover .tab-icon-wrapper {
                    color: var(--brand-primary);
                    transform: scale(1.1);
                }

                /* ACTIVE STATE PHYSICS */
                .store-tab-btn.active {
                    background: linear-gradient(to top, rgba(206, 172, 92, 0.05) 0%, transparent 100%);
                }

                /* ICON WRAPPER */
                .tab-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                }
                .store-tab-btn.active .tab-icon-wrapper {
                    color: var(--brand-primary);
                }

                /* TYPOGRAPHY */
                .tab-text-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 2px;
                    text-align: left;
                }
                .tab-label {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--text-muted);
                    transition: color 0.2s;
                }
                .store-tab-btn.active .tab-label {
                    color: var(--text-main);
                    font-weight: 900;
                }

                .tab-description {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    opacity: 0.7;
                }
                .store-tab-btn.active .tab-description {
                    opacity: 1;
                }

                /* THE GOLD LINE (Active Indicator) */
                .tab-active-indicator {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--brand-primary);
                    border-radius: 3px 3px 0 0;
                    animation: slideUpSnappy 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                /* ANIMATIONS */
                @keyframes slideUpSnappy {
                    0% { transform: translateY(100%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }

                /* MOBILE RESPONSIVE DEGRADATION */
                @media (max-width: 768px) {
                    .store-tab-track {
                        padding: 0 16px;
                    }
                    .store-tab-btn {
                        padding: 16px 12px;
                        gap: 8px;
                    }
                    .tab-label {
                        font-size: 13px;
                    }
                    /* Hide the description on mobile to save horizontal space */
                    .tab-description {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default StoreTabBar;