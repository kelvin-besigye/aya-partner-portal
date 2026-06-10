/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: ActiveTicketsBoard.jsx
 * * DESCRIPTION:
 * The live Transparency Layer. Displays all historically submitted 
 * requests, their live statuses in the Maker-Checker workflow, 
 * and the specific responses from the L9 Admin team.
 * * WORLD-CLASS PHYSICS:
 * 1. DICTIONARY HYDRATION: Natively reads from `support.dictionary.js` to 
 * instantly map database strings into exact brand colors, icons, and labels.
 * 2. THE FEEDBACK LOOP: If `admin_response` exists on a resolved ticket, 
 * it renders a highly visible, inset box providing the exact resolution details.
 * 3. KINETIC FILTERING: Built-in state filters (Active vs Resolved) that 
 * instantly slice the array without re-fetching from the network.
 */

import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, Clock, CheckCircle2, 
    Paperclip, MessageSquare, AlertCircle, ChevronDown,
    Activity, ShieldCheck, XCircle
} from 'lucide-react';

import { 
    getRequestTypeConfig, 
    getStatusConfig, 
    getPriorityConfig 
} from '../../data/support.dictionary';

const ActiveTicketsBoard = ({ tickets = [], isLoading = false }) => {
    
    // ========================================================================
    // 1. STATE & FILTERING ENGINE
    // ========================================================================
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED

    // Memoize the filtered array so React doesn't re-calculate on every render
    const filteredTickets = useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        
        return tickets.filter(ticket => {
            const status = ticket.status?.toUpperCase() || 'PENDING';
            if (activeFilter === 'ACTIVE') return status === 'PENDING' || status === 'PROCESSING';
            if (activeFilter === 'RESOLVED') return status === 'RESOLVED' || status === 'REJECTED';
            return true;
        });
    }, [tickets, activeFilter]);

    // Format the timestamp cleanly (e.g., "Mar 26, 2026 - 14:30")
    const formatTicketDate = (isoString) => {
        if (!isoString) return 'Unknown Date';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-GB', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    // ========================================================================
    // 2. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="tickets-board-chassis">
                <div className="board-header skeleton-pulse">
                    <div className="skeleton-title w-30" />
                    <div className="skeleton-filters w-40" />
                </div>
                <div className="board-body">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="ticket-card skeleton-pulse">
                            <div className="skeleton-row w-50" />
                            <div className="skeleton-row w-100 h-40" />
                            <div className="skeleton-row w-30" />
                        </div>
                    ))}
                </div>
                <style>{`
                    .skeleton-pulse { animation: pulseFade 1.5s infinite ease-in-out; }
                    .skeleton-title { height: 24px; background: var(--bg-input); border-radius: 6px; }
                    .skeleton-filters { height: 36px; background: var(--bg-input); border-radius: 8px; }
                    .skeleton-row { height: 16px; background: var(--bg-input); border-radius: 4px; margin-bottom: 12px; }
                    .h-40 { height: 40px; } .w-30 { width: 30%; } .w-40 { width: 40%; } .w-50 { width: 50%; } .w-100 { width: 100%; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 3. THE RENDER ENGINE
    // ========================================================================
    return (
        <div className="tickets-board-chassis">
            
            {/* --- BOARD HEADER & FILTERS --- */}
            <div className="board-header">
                <div className="header-titles">
                    <h3>Dispatch Radar</h3>
                    <span className="ticket-count">{filteredTickets.length} records found</span>
                </div>

                <div className="filter-cluster">
                    <Filter size={16} className="text-muted" />
                    <button 
                        className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('ALL')}
                    >
                        All
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'ACTIVE' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('ACTIVE')}
                    >
                        Active
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'RESOLVED' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('RESOLVED')}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            {/* --- THE TICKET FEED --- */}
            <div className="board-body">
                {filteredTickets.length === 0 ? (
                    <div className="empty-board-state">
                        <div className="empty-icon-ring">
                            <ShieldCheck size={32} className="text-success" />
                        </div>
                        <h4>Operational Clarity</h4>
                        <p>No tickets found for the selected filter. Your operations are currently fully aligned with the network.</p>
                    </div>
                ) : (
                    <div className="ticket-list">
                        {filteredTickets.map((ticket) => {
                            // 1. HYDRATE FROM DICTIONARY
                            const typeConfig = getRequestTypeConfig(ticket.request_type);
                            const statusConfig = getStatusConfig(ticket.status);
                            const priorityConfig = getPriorityConfig(ticket.priority);
                            
                            const TypeIcon = typeConfig.Icon || Activity;
                            const StatusIcon = statusConfig.Icon || Clock;

                            return (
                                <div key={ticket.id} className={`ticket-card status-${statusConfig.id.toLowerCase()}`}>
                                    
                                    {/* CARD TOP: Identity & Status */}
                                    <div className="ticket-header">
                                        <div className="ticket-identity">
                                            <div className="type-icon-box" style={{ backgroundColor: typeConfig.bgOpacity, color: typeConfig.color }}>
                                                <TypeIcon size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="identity-text">
                                                <span className="type-label">{typeConfig.label}</span>
                                                <span className="ticket-id">TCK-{ticket.id.substring(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <div className="ticket-meta">
                                            <div className="priority-badge" style={{ color: priorityConfig.color }}>
                                                {priorityConfig.label}
                                            </div>
                                            <div className="status-badge" style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}>
                                                <StatusIcon size={14} className={statusConfig.id === 'PROCESSING' ? 'ayabus-spin' : ''} />
                                                <span>{statusConfig.label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD MIDDLE: The Core Request */}
                                    <div className="ticket-content">
                                        <p className="request-description">{ticket.description}</p>
                                        
                                        {/* Document Attachment Link */}
                                        {ticket.document_url && (
                                            <a 
                                                href={ticket.document_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="attachment-link"
                                            >
                                                <Paperclip size={14} />
                                                <span>View Attached Document</span>
                                            </a>
                                        )}
                                        
                                        <div className="timestamp-row">
                                            <Clock size={12} />
                                            <span>Submitted on {formatTicketDate(ticket.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* CARD BOTTOM: The Maker-Checker Feedback Loop */}
                                    {ticket.admin_response && (
                                        <div className={`admin-response-box ${statusConfig.id === 'REJECTED' ? 'is-rejected' : 'is-resolved'}`}>
                                            <div className="response-header">
                                                <MessageSquare size={14} />
                                                <span>L9 Dispatch Response</span>
                                            </div>
                                            <p>{ticket.admin_response}</p>
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ========================================================================
                4. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- CHASSIS & HEADER --- */
                .tickets-board-chassis {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: 100%;
                }

                .board-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px; border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-canvas); flex-shrink: 0;
                }
                
                .header-titles h3 { margin: 0 0 4px 0; font-size: 15px; font-weight: 900; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
                .ticket-count { font-size: 12px; font-weight: 700; color: var(--text-muted); }

                /* --- KINETIC FILTERS --- */
                .filter-cluster {
                    display: flex; align-items: center; gap: 8px;
                    background: var(--bg-input); padding: 4px; border-radius: 10px;
                    border: 1px solid var(--border-subtle);
                }
                .filter-cluster svg { margin: 0 4px; }
                .filter-btn {
                    background: transparent; border: none; padding: 6px 16px;
                    border-radius: 6px; font-size: 12px; font-weight: 700;
                    color: var(--text-muted); cursor: pointer; transition: all 0.2s;
                }
                .filter-btn:hover { color: var(--text-main); }
                .filter-btn.active { background: var(--bg-surface); color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

                /* --- BODY SCROLLING --- */
                .board-body {
                    flex: 1; padding: 24px; overflow-y: auto;
                }
                /* Custom Scrollbar */
                .board-body::-webkit-scrollbar { width: 6px; }
                .board-body::-webkit-scrollbar-track { background: transparent; }
                .board-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

                /* --- TICKET CARDS --- */
                .ticket-list { display: flex; flex-direction: column; gap: 16px; }
                
                .ticket-card {
                    background: var(--bg-canvas); border: 1px solid var(--border-subtle);
                    border-radius: 16px; padding: 20px; transition: all 0.2s ease;
                }
                .ticket-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 16px rgba(0,0,0,0.02); }

                /* Header Data */
                .ticket-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
                .ticket-identity { display: flex; align-items: center; gap: 12px; }
                .type-icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .identity-text { display: flex; flex-direction: column; gap: 2px; }
                .type-label { font-size: 14px; font-weight: 800; color: var(--text-main); }
                .ticket-id { font-family: monospace; font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; }

                /* Badges */
                .ticket-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
                .priority-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
                .status-badge { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

                /* Core Content */
                .ticket-content { display: flex; flex-direction: column; gap: 12px; }
                .request-description { margin: 0; font-size: 14px; color: var(--text-main); line-height: 1.5; white-space: pre-wrap; }
                
                .attachment-link {
                    display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
                    padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-strong);
                    border-radius: 8px; color: var(--text-main); font-size: 12px; font-weight: 700;
                    text-decoration: none; transition: all 0.2s;
                }
                .attachment-link:hover { background: var(--bg-surface); border-color: var(--brand-primary); color: var(--brand-primary); }

                .timestamp-row { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 4px; }

                /* --- ADMIN RESPONSE BOX (The Checker Feedback) --- */
                .admin-response-box {
                    margin-top: 16px; padding: 16px; border-radius: 12px;
                    border-left: 3px solid transparent;
                }
                .is-resolved { background: rgba(34, 197, 94, 0.05); border-left-color: var(--status-success); }
                .is-rejected { background: rgba(239, 68, 68, 0.05); border-left-color: var(--status-danger); }
                
                .response-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 11px; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
                .admin-response-box p { margin: 0; font-size: 13px; color: var(--text-main); line-height: 1.5; font-weight: 600; }

                /* --- EMPTY STATE --- */
                .empty-board-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: 40px 20px; }
                .empty-icon-ring { width: 72px; height: 72px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); border: 1px dashed rgba(34, 197, 94, 0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
                .empty-board-state h4 { margin: 0 0 8px 0; font-size: 18px; font-weight: 900; color: var(--text-main); }
                .empty-board-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* --- UTILITIES --- */
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }
                .ayabus-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 768px) {
                    .board-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .filter-cluster { width: 100%; overflow-x: auto; padding-bottom: 4px; }
                    .filter-btn { flex: 1; white-space: nowrap; }
                    .ticket-header { flex-direction: column; gap: 16px; }
                    .ticket-meta { width: 100%; flex-direction: row; justify-content: space-between; align-items: center; }
                }
            `}</style>
        </div>
    );
};

export default ActiveTicketsBoard;