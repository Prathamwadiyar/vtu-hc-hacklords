import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const RESEARCH_LINKS = [
  { to: '/studio', label: 'Studio' },
  { to: '/method', label: 'Method' },
];

const PORTAL_LINKS = [
  { to: '/patient', label: 'Patient Portal', icon: '♥', desc: 'Screening & records' },
  { to: '/professional', label: 'Professional Portal', icon: '⚕', desc: 'Clinical view' },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const { pathname } = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setPortalOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!portalOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [portalOpen]);

  const isPortalActive = pathname.startsWith('/patient') || pathname.startsWith('/professional');

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
      transition: 'background .35s, border-color .35s, backdrop-filter .35s, box-shadow .35s',
      background: solid ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.65)',
      borderBottom: `1px solid ${solid ? 'rgba(226, 232, 240, 0.9)' : 'rgba(226, 232, 240, 0.45)'}`,
      boxShadow: solid
        ? '0 10px 25px -5px rgba(13, 148, 136, 0.08), 0 8px 10px -6px rgba(124, 58, 237, 0.05)'
        : '0 4px 12px -2px rgba(15, 23, 42, 0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div className="wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Brand Logo with gradient badge and subtle pulse */}
        <NavLink to="/" className="nav-brand-link" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(124, 58, 237, 0.18))',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.12)',
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
          }} className="nav-brand-icon">
            <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M11 5c0 6 10 6 10 11s-10 5-10 11" stroke="#7C3AED"
                strokeWidth="2.6" fill="none" strokeLinecap="round" />
              <path d="M21 5c0 6-10 6-10 11s10 5 10 11" stroke="#0D9488"
                strokeWidth="2.6" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.02em',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #14213D 30%, #0D9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Aarogyam
            </span>
            <span style={{
              fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--teal)', fontWeight: 700, marginTop: -2,
            }}>
              Quantum Health AI
            </span>
          </div>
        </NavLink>

        <nav className="nav-desktop" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {RESEARCH_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}
              className="nav-item-pill"
              style={({ isActive }) => ({
                padding: '7px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 500,
                color: isActive ? '#0D9488' : 'var(--ink-dim)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.12), rgba(204, 251, 241, 0.6))'
                  : 'transparent',
                border: `1px solid ${isActive ? 'rgba(13, 148, 136, 0.35)' : 'transparent'}`,
                boxShadow: isActive ? '0 2px 8px rgba(13, 148, 136, 0.12)' : 'none',
                transition: 'all .2s ease',
              })}>
              {l.label}
            </NavLink>
          ))}

          {/* Portals dropdown button */}
          <div ref={dropRef} style={{ position: 'relative', marginLeft: 4 }}>
            <button
              onClick={() => setPortalOpen((v) => !v)}
              className="nav-portal-btn"
              style={{
                padding: '7px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                color: isPortalActive ? '#7C3AED' : 'var(--ink-dim)',
                background: isPortalActive || portalOpen
                  ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(237, 233, 254, 0.6))'
                  : 'rgba(241, 245, 249, 0.6)',
                border: `1px solid ${isPortalActive || portalOpen ? 'rgba(124, 58, 237, 0.35)' : 'var(--line)'}`,
                boxShadow: isPortalActive || portalOpen ? '0 2px 8px rgba(124, 58, 237, 0.15)' : 'none',
                transition: 'all .2s ease',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              aria-haspopup="true"
              aria-expanded={portalOpen}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isPortalActive ? '#7C3AED' : '#0D9488',
                boxShadow: `0 0 8px ${isPortalActive ? 'rgba(124, 58, 237, 0.6)' : 'rgba(13, 148, 136, 0.6)'}`,
              }} />
              Portals
              <span style={{
                display: 'inline-block',
                transform: portalOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform .2s',
                fontSize: 9,
                color: isPortalActive ? '#7C3AED' : 'var(--ink-faint)',
              }}>▼</span>
            </button>

            {portalOpen && (
              <div className="nav-dropdown" style={{
                minWidth: 250, padding: 8,
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(0,0,0,0.04)',
              }}>
                <div style={{ padding: '6px 10px 4px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontWeight: 600 }}>
                  Clinical & Patient Access
                </div>
                {PORTAL_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} onClick={() => setPortalOpen(false)} className="nav-drop-item">
                    <span style={{
                      width: 32, height: 32, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: l.to === '/patient' ? 'var(--teal-soft)' : 'var(--violet-soft)',
                      color: l.to === '/patient' ? 'var(--teal)' : 'var(--violet)',
                      fontSize: 16, flexShrink: 0,
                    }}>{l.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>
                        {l.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 1 }}>
                        {l.desc}
                      </div>
                    </div>
                  </NavLink>
                ))}
                <div style={{ height: 1, background: 'var(--line-soft)', margin: '6px 6px' }} />
                <NavLink to="/wellness" onClick={() => setPortalOpen(false)} className="nav-drop-item">
                  <span style={{
                    width: 32, height: 32, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#DCFCE7', color: '#16A34A', fontSize: 16, flexShrink: 0,
                  }}>🌿</span>
                  <div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>Wellness Portal</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 1 }}>Preventative health guidance</div>
                  </div>
                </NavLink>
                <NavLink to="/emergency" onClick={() => setPortalOpen(false)} className="nav-drop-item">
                  <span style={{
                    width: 32, height: 32, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#FEE2E2', color: '#DC2626', fontSize: 16, flexShrink: 0,
                  }}>🚨</span>
                  <div>
                    <div style={{ fontSize: 13.5, color: '#DC2626', fontWeight: 600 }}>Emergency Protocol</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 1 }}>Triage & emergency contacts</div>
                  </div>
                </NavLink>
              </div>
            )}
          </div>

          {/* GitHub CTA with gentle gradient glow */}
          <a className="nav-github-btn" href="https://github.com/pranalib2026-cmyk/Aarogyam"
            target="_blank" rel="noreferrer"
            style={{
              marginLeft: 8, padding: '7px 18px', borderRadius: 999,
              fontSize: 13, fontWeight: 600,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #14213D 0%, #0D9488 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>
        </nav>

        <button className="nav-toggle btn" onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation" aria-expanded={open}
          style={{ display: 'none', padding: '8px 14px' }}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div className="wrap" style={{ paddingBottom: 16 }}>
          <div className="panel" style={{ display: 'grid', gap: 4, borderRadius: 16, border: '1px solid var(--line)', background: '#FFFFFF', padding: 12 }}>
            {RESEARCH_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} style={{ padding: '10px 12px', fontSize: 14.5, borderRadius: 8, color: 'var(--ink)', fontWeight: 500 }}>
                {l.label}
              </NavLink>
            ))}
            <div style={{ height: 1, background: 'var(--line-soft)', margin: '4px 0' }} />
            {PORTAL_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} style={{ padding: '10px 12px', fontSize: 14.5, borderRadius: 8, color: 'var(--ink)', fontWeight: 500 }}>
                {l.icon} {l.label}
              </NavLink>
            ))}
            <NavLink to="/wellness" style={{ padding: '10px 12px', fontSize: 14.5, borderRadius: 8, color: '#16A34A', fontWeight: 500 }}>
              🌿 Wellness
            </NavLink>
            <NavLink to="/emergency" style={{ padding: '10px 12px', fontSize: 14.5, borderRadius: 8, color: '#DC2626', fontWeight: 500 }}>
              🚨 Emergency
            </NavLink>
          </div>
        </div>
      )}

      <style>{`
        .nav-brand-link:hover .nav-brand-icon {
          transform: scale(1.08) rotate(4deg);
          box-shadow: 0 6px 18px rgba(13, 148, 136, 0.25);
        }
        .nav-item-pill:hover {
          color: #0D9488 !important;
          background: rgba(13, 148, 136, 0.08) !important;
          transform: translateY(-1px);
        }
        .nav-portal-btn:hover {
          color: #7C3AED !important;
          background: rgba(124, 58, 237, 0.08) !important;
          transform: translateY(-1px);
          border-color: rgba(124, 58, 237, 0.3) !important;
        }
        .nav-github-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35) !important;
          background: linear-gradient(135deg, #0D9488 0%, #7C3AED 100%) !important;
        }
        .nav-drop-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 10px;
          transition: background 0.18s ease, transform 0.18s ease;
          text-decoration: none;
        }
        .nav-drop-item:hover {
          background: #F8FAFC;
          transform: translateX(3px);
        }
        @media (max-width: 1100px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
