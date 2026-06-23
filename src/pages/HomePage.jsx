import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, Bus, Map as MapIcon, CalendarClock, 
  Banknote, CheckCircle2, Globe, LogOut, Sun, Moon, ShieldCheck, 
  Activity, Scale, Briefcase, Users, Settings
} from 'lucide-react';

// ========================================================================
// 1. LIVE MODULE IMPORTS
// ========================================================================
import BusConfigModule from '../modules/bus-config/BusConfigModule';
import ApprovalsModule from '../modules/approvals/ApprovalsModule';
import RoutesModule from '../modules/routes/RoutesModule';
import SchedulerModule from '../modules/scheduler/SchedulerModule';
import TreasuryModule from '../modules/treasury/TreasuryModule';
import ReconciliationModule from '../modules/reconciliation/ReconciliationModule';
import AnalyticsModule from '../modules/analytics/AnalyticsModule'; 
import PartnerModule from '../modules/partner/PartnerModule'; 
import ClientModule from '../modules/clients/ClientsModule'; 
import AuditorModule from '../modules/auditor/AuditorModule'; 
import ControlCentreModule from '../modules/control-centre/ControlCentreModule';

// ========================================================================
// 2. CATEGORIZED MENU STRUCTURE
// ========================================================================
const MENU_CATEGORIES = [
  {
    title: 'Onboard Vehicle',
    items: [
      { id: 'BUS_CONFIG', label: 'Bus Configurator', icon: <Bus size={18} /> },
      { id: 'ROUTES', label: 'Route Network', icon: <MapIcon size={18} /> },
      { id: 'SCHEDULER', label: 'Smart Scheduler', icon: <CalendarClock size={18} /> },
    ]
  },
  {
    title: 'Care',
    items: [
      { id: 'PARTNER', label: 'Partner Management', icon: <Briefcase size={18} /> },
      { id: 'CLIENTS', label: 'Client Registry', icon: <Users size={18} /> },
    ]
  },
  {
    title: 'Finance',
    items: [
      { id: 'TREASURY', label: 'Treasury Vault', icon: <Banknote size={18} /> },
      { id: 'RECONCILIATION', label: 'Reconciliation', icon: <CheckCircle2 size={18} /> },
    ]
  },
  {
    title: 'Intel',
    items: [
      { id: 'ANALYTICS', label: 'Analytics Centre', icon: <Activity size={18} /> },
      { id: 'AUDITOR', label: 'Audit Log', icon: <Scale size={18} /> },
    ]
  },
  {
    title: 'System Settings',
    items: [
      { id: 'APPROVALS', label: 'Approvals Queue', icon: <ShieldCheck size={18} /> },
      { id: 'CONTROL', label: 'Control Centre', icon: <Settings size={18} /> },
    ]
  }
];

const HomePage = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('HOME');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // THEME ENGINE: Syncs with localStorage, defaults to Light Mode (false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('ayabus-partner-theme');
    return savedTheme === 'dark';
  });

  // THEME EFFECT: Applies classes and saves to storage
  useEffect(() => {
    localStorage.setItem('ayabus-partner-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ========================================================================
  // 3. RENDER ENGINE
  // ========================================================================
  const renderModule = () => {
    switch (activeModule) {
      case 'BUS_CONFIG': return <BusConfigModule />;
      case 'APPROVALS': return <ApprovalsModule />;
      case 'ROUTES': return <RoutesModule />;
      case 'SCHEDULER': return <SchedulerModule />;
      case 'TREASURY': return <TreasuryModule />;
      case 'RECONCILIATION': return <ReconciliationModule />;
      case 'ANALYTICS': return <AnalyticsModule />;
      case 'PARTNER': return <PartnerModule />;
      case 'CLIENTS': return <ClientModule />;
      case 'AUDITOR': return <AuditorModule />;
      case 'CONTROL': return <ControlCentreModule />;
      default: return (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', minHeight: '100%', padding: '40px', textAlign: 'center' 
        }}>
          <Globe size={48} style={{ marginBottom: '24px', opacity: 0.2, color: 'var(--text-main)' }} />
          <h1 style={{ fontWeight: '800', fontSize: '28px', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
            AyaBus Admin Centre
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
            Open the menu to access operational modules.
          </p>
        </div>
      );
    }
  };

  return (
    <div style={{ 
      height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', 
      background: 'var(--bg-canvas)', color: 'var(--text-main)' 
    }}>
      
      {/* --- COMMAND BAR (TOP) --- */}
      <header style={{ 
        height: '72px', flexShrink: 0, borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 100
      }}>
        {/* Left Side: Brand Identity (NOW CLICKABLE TO RETURN HOME) */}
        <div 
          onClick={() => setActiveModule('HOME')}
          title="Return to Admin Centre"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{ background: 'var(--brand-primary)', padding: '6px', borderRadius: '8px', color: '#FFFFFF', display: 'flex' }}>
            <Bus size={20} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>
            AyaBus <span style={{ color: 'var(--brand-primary)' }}>Admin</span>
          </span>
        </div>

        {/* Right Side: Theme, Profile, and Hamburger Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={toggleTheme} 
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />
            
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: '700' }}>Operations</div>
            </div>

            <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

            {/* Hamburger Menu Button (Top Right) */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              style={{ 
                background: 'var(--brand-primary)', border: 'none', color: '#FFFFFF', 
                padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(206, 172, 92, 0.2)'
              }}
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
        </div>
      </header>

      {/* --- DYNAMIC VIEWPORT (Fully Adaptive and Scrollable) --- */}
      <main style={{ 
        flex: 1, 
        overflow: 'auto', /* This guarantees ANY module content will scroll natively if it overflows */
        position: 'relative',
        display: 'block'
      }}>
        {renderModule()}
      </main>

      {/* --- COMMAND DRAWER (OVERLAY FROM RIGHT) --- */}
      {isDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} 
          />
          
          {/* Drawer Panel (Anchored to Right) */}
          <div style={{ 
            width: '320px', background: 'var(--bg-surface)', height: '100%', position: 'relative',
            borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{ 
              padding: '24px', borderBottom: '1px solid var(--border-subtle)', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
            }}>
              <span style={{ fontWeight: '800', fontSize: '16px' }}>Module Registry</span>
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              
              <button
                onClick={() => { setActiveModule('HOME'); setIsDrawerOpen(false); }}
                style={{ 
                  width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none', 
                  background: activeModule === 'HOME' ? 'var(--brand-primary)' : 'transparent',
                  color: activeModule === 'HOME' ? '#FFFFFF' : 'var(--text-main)',
                  display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeModule === 'HOME' ? '800' : '600'
                }}
              >
                <Home size={18} />
                <span>Admin Centre</span>
              </button>

              {MENU_CATEGORIES.map((category, catIdx) => (
                <div key={catIdx} style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', 
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '8px' 
                  }}>
                    {category.title}
                  </div>
                  
                  {category.items.map((mod) => {
                    const isActive = activeModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => { setActiveModule(mod.id); setIsDrawerOpen(false); }}
                        style={{ 
                          width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none', 
                          background: isActive ? 'var(--brand-primary)' : 'transparent',
                          color: isActive ? '#FFFFFF' : 'var(--text-main)', /* Strict White Text when active */
                          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px',
                          cursor: 'pointer', transition: 'all 0.2s', fontWeight: isActive ? '800' : '600'
                        }}
                      >
                        <div style={{ opacity: isActive ? 1 : 0.7 }}>{mod.icon}</div>
                        <span>{mod.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}>
              <button 
                onClick={onLogout}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '8px', 
                  background: 'rgba(220, 38, 38, 0.1)', border: 'none', 
                  color: 'var(--status-error)', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '10px', 
                  fontWeight: '800', fontSize: '14px', transition: 'all 0.2s'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
      `}</style>
    </div>
  );
};

export default HomePage;