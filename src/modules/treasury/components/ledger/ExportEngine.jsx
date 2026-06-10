/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: ExportEngine.jsx
 * * DESCRIPTION:
 * The Client-Side CSV Compiler. Takes the purified JSON transactions 
 * from the ledger and converts them into a strictly formatted, Excel-ready 
 * Comma Separated Value document.
 * * WORLD-CLASS PHYSICS:
 * 1. EXCEL-GRADE ESCAPING: Automatically detects and escapes rogue commas 
 * or quotes inside passenger names or route codes to prevent column breakage.
 * 2. MATHEMATICAL PURITY: Exports raw integers with their correct operational 
 * sign (e.g., `-2500` instead of `UGX 2,500`) so accountants can instantly 
 * run SUM() and Pivot Tables without cleaning the data.
 * 3. NON-BLOCKING UI: Uses a `setTimeout` macrotask release to allow the 
 * React DOM to paint the "Spinning Loader" *before* locking the main thread 
 * to crunch the CSV array.
 */

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ExportEngine = ({ 
    transactions = [], 
    periodLabel = 'Ledger',
    disabled = false 
}) => {
    // ========================================================================
    // 1. KINETIC STATE
    // ========================================================================
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('IDLE'); // IDLE, SUCCESS, ERROR

    // ========================================================================
    // 2. CSV COMPILER (The Math & String Engine)
    // ========================================================================
    
    // Safely escapes strings for CSV format (wraps in quotes if it contains commas)
    const escapeCSV = (str) => {
        if (str === null || str === undefined) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
            // Double up internal quotes to escape them per CSV spec
            return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
    };

    const processExport = () => {
        if (!transactions || transactions.length === 0) return;

        // 1. Define strict Excel-friendly headers
        const headers = [
            'Date', 
            'Time', 
            'Transaction Type', 
            'Details & Context', 
            'Status', 
            'Amount (UGX)', 
            'System Reference ID'
        ];

        // 2. Map JSON payload to CSV rows
        const csvRows = transactions.map(tx => {
            // A. Mathematical Purity: Ensure debits are actual negative numbers for Excel
            const isDebit = tx.type.operator === '-';
            const excelAmount = isDebit ? -Math.abs(tx.rawAmount) : Math.abs(tx.rawAmount);
            
            // B. Contextual Reconstruction: Build the secondary string
            let detail = '';
            if (tx.type.id === 'TICKET_SALE') detail = `Passenger: ${tx.passengerName} - Route: ${tx.routeCode}`;
            else if (tx.type.id === 'PAYOUT_SETTLEMENT') detail = `Bank: ${tx.settlementBank} ${tx.settlementAccountMasked}`;
            else if (tx.type.id === 'CANCELLATION_CLAWBACK') detail = `Clawback Ref: ${tx.referenceId.substring(0,8)}`;
            else detail = 'Automated Processing Fee';

            // C. Return the comma-joined row
            return [
                escapeCSV(tx.displayDate),
                escapeCSV(tx.displayTime),
                escapeCSV(tx.type.label),
                escapeCSV(detail),
                escapeCSV(tx.status.label),
                escapeCSV(excelAmount), // Raw math string
                escapeCSV(tx.id)        // The absolute UUID for auditors
            ].join(',');
        });

        // 3. Assemble the final file string
        const csvString = [headers.join(','), ...csvRows].join('\n');
        
        // 4. Forge the Blob & Virtual Link
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const safePeriodLabel = periodLabel.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `AyaBus_Ledger_${safePeriodLabel}_${timestamp}.csv`;

        // 5. Trigger Browser Download
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ========================================================================
    // 3. THE EVENT TRIGGER
    // ========================================================================
    const handleExport = () => {
        if (disabled || transactions.length === 0 || isExporting) return;

        setIsExporting(true);
        setExportStatus('IDLE');

        // Macrotask Yield: Allows React to paint the "Spinning" state to the DOM 
        // before the heavy synchronous array mapping blocks the thread.
        setTimeout(() => {
            try {
                processExport();
                setExportStatus('SUCCESS');
            } catch (error) {
                console.error("[AyaBus Export Engine] CSV Compilation Failed:", error);
                setExportStatus('ERROR');
            } finally {
                setIsExporting(false);
                
                // Reset success badge after 3 seconds
                setTimeout(() => {
                    setExportStatus('IDLE');
                }, 3000);
            }
        }, 50);
    };

    // ========================================================================
    // 4. RENDERER
    // ========================================================================
    const isButtonDisabled = disabled || transactions.length === 0 || isExporting;

    return (
        <button 
            className={`sovereign-export-btn ${exportStatus.toLowerCase()}`}
            onClick={handleExport}
            disabled={isButtonDisabled}
            title={transactions.length === 0 ? "No data to export" : "Export Ledger to Excel"}
        >
            {/* ICON MATRIX */}
            {isExporting ? (
                <Loader2 size={16} className="ayabus-spin" />
            ) : exportStatus === 'SUCCESS' ? (
                <CheckCircle2 size={16} className="text-success" />
            ) : exportStatus === 'ERROR' ? (
                <AlertCircle size={16} className="text-danger" />
            ) : (
                <Download size={16} />
            )}

            {/* LABEL MATRIX */}
            <span>
                {isExporting ? 'Compiling CSV...' 
                : exportStatus === 'SUCCESS' ? 'Export Complete' 
                : exportStatus === 'ERROR' ? 'Export Failed' 
                : 'Export CSV'}
            </span>

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                .sovereign-export-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 18px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-strong);
                    border-radius: 10px;
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    user-select: none;
                    min-width: 140px; /* Prevents button jitter when text changes */
                }

                /* KINETIC HOVER */
                .sovereign-export-btn:hover:not(:disabled) {
                    background: var(--bg-input);
                    border-color: var(--brand-primary);
                    color: var(--brand-primary);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }

                /* DISABLED STATE */
                .sovereign-export-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: var(--bg-canvas);
                    border-color: var(--border-subtle);
                }

                /* SUCCESS/ERROR OVERRIDES */
                .sovereign-export-btn.success {
                    background: rgba(34, 197, 94, 0.05);
                    border-color: rgba(34, 197, 94, 0.3);
                    color: var(--status-success);
                }
                .sovereign-export-btn.error {
                    background: rgba(239, 68, 68, 0.05);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: var(--status-danger);
                }

                /* ANIMATION */
                .ayabus-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                .text-success { color: var(--status-success); }
                .text-danger { color: var(--status-danger); }
            `}</style>
        </button>
    );
};

export default ExportEngine;