import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { useSmoothScroll } from './lib/motion';

const Landing = lazy(() => import('./pages/Landing'));
const Platform = lazy(() => import('./pages/Platform'));
const Detect = lazy(() => import('./pages/Detect'));
const Studio = lazy(() => import('./pages/Studio'));
const Genomics = lazy(() => import('./pages/Predict'));
const Resolver = lazy(() => import('./pages/Resolver'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Method = lazy(() => import('./pages/Method'));

// Stage 1 Portals and Healthcare Flows
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const Screening = lazy(() => import('./pages/Screening'));
const ScreeningResults = lazy(() => import('./pages/ScreeningResults'));
const ProfessionalDashboard = lazy(() => import('./pages/ProfessionalDashboard'));
const Records = lazy(() => import('./pages/Records'));
const SharedRecord = lazy(() => import('./pages/SharedRecord'));
const Wellness = lazy(() => import('./pages/Wellness'));
const Emergency = lazy(() => import('./pages/Emergency'));

import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 24px', maxWidth: 680, margin: '60px auto', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', color: '#0F172A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Something went wrong loading this view</h2>
          </div>
          <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6 }}>
            A temporary component error occurred. You can reload the page or navigate back to the home portal.
          </p>
          <pre style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, fontSize: 12, color: '#DC2626', overflowX: 'auto', border: '1px solid #E2E8F0', marginTop: 16 }}>
            {this.state.error?.message || 'Unknown runtime error'}
          </pre>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              style={{ background: '#0D9488', color: '#FFFFFF', padding: '10px 18px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#F1F5F9', color: '#334155', padding: '10px 18px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Loading() {
  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'var(--ink-faint)'
      }}>
        preparing state
      </div>
    </div>
  );
}

export default function App() {
  useSmoothScroll();
  return (
    <>
      <div className="aurora" />
      <div className="grain" />
      <Nav />
      <main>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
          <Routes>
            {/* Landing & Research Pages (Preserved) */}
            <Route path="/" element={<Landing />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/genomics" element={<Genomics />} />
            <Route path="/predict" element={<Genomics />} />
            <Route path="/resolver" element={<Resolver />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/method" element={<Method />} />

            {/* Stage 1 Healthcare & Patient Flows */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/screening/:condition" element={<Screening />} />
            <Route path="/patient/results" element={<ScreeningResults />} />
            <Route path="/professional" element={<ProfessionalDashboard />} />
            <Route path="/records" element={<Records />} />
            <Route path="/shared/:token" element={<SharedRecord />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/emergency" element={<Emergency />} />

            {/* Fallback */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
