import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../lib/motion';

interface EmergencyHotline {
  region: string;
  number: string;
  desc: string;
}

const EMERGENCY_SERVICES: EmergencyHotline[] = [
  { region: 'India National Emergency', number: '112', desc: 'Unified emergency response service (Police, Fire, Ambulance)' },
  { region: 'India Ambulance / Medical', number: '108', desc: 'Direct emergency medical transport and ambulance dispatch' },
  { region: 'United States & Canada', number: '911', desc: 'Emergency medical services and paramedic dispatch' },
  { region: 'United Kingdom', number: '999', desc: 'Urgent medical assistance and ambulance service' },
  { region: 'European Union', number: '112', desc: 'Universal emergency service across EU member states' },
];

export default function Emergency() {
  const scope = useRef<HTMLDivElement>(null);
  const [confirmCall, setConfirmCall] = useState<EmergencyHotline | null>(null);

  useReveal(scope, []);

  const handleTriggerCall = (service: EmergencyHotline) => {
    setConfirmCall(service);
  };

  const handleProceedCall = () => {
    if (confirmCall) {
      window.location.href = `tel:${confirmCall.number}`;
      setConfirmCall(null);
    }
  };

  return (
    <div ref={scope} style={{ paddingTop: 108, paddingBottom: 80 }} className="page-enter">
      <div className="wrap" style={{ maxWidth: 760 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/patient" className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
            ← Back to Patient Portal
          </Link>
        </div>

        {/* Warning Hero Box */}
        <div
          className="panel reveal"
          style={{
            borderColor: 'rgba(255,77,109,.4)',
            background: 'linear-gradient(180deg, rgba(255,77,109,.08) 0%, rgba(9,11,22,.9) 100%)',
            marginBottom: 28,
            padding: 'clamp(24px, 4vw, 40px)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🚨</div>
          <span className="eyebrow" style={{ color: 'var(--rose)', margin: '0 0 8px' }}>
            Emergency Medical Protocol
          </span>
          <h1 className="display" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', marginBottom: 16 }}>
            Are You Experiencing an Acute Medical Emergency?
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink)', maxWidth: '54ch', margin: '0 auto 24px', lineHeight: 1.6 }}>
            If you or someone near you is experiencing severe chest pressure, radiating arm pain,
            sudden shortness of breath, loss of consciousness, or signs of stroke,
            <strong> do NOT wait for online screening results.</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ fontSize: 15, padding: '12px 28px', fontWeight: 600 }}
              onClick={() => handleTriggerCall(EMERGENCY_SERVICES[0])}
            >
              📞 Call Emergency 112 (India)
            </button>
            <button
              type="button"
              className="btn btn-danger"
              style={{ fontSize: 15, padding: '12px 28px', fontWeight: 600 }}
              onClick={() => handleTriggerCall(EMERGENCY_SERVICES[1])}
            >
              🚑 Call Ambulance 108
            </button>
          </div>
        </div>

        {/* Critical Symptoms Checklist */}
        <div className="panel reveal" style={{ marginBottom: 28 }}>
          <span className="eyebrow" style={{ marginBottom: 14 }}>
            Recognizing Red-Flag Cardiovascular & Metabolic Symptoms
          </span>
          <div className="grid cols-2" style={{ gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'rgba(255,77,109,.05)', border: '1px solid rgba(255,77,109,.2)' }}>
              <div style={{ fontWeight: 600, color: 'var(--rose)', fontSize: 14, marginBottom: 6 }}>
                ⚠️ Suspected Acute Coronary Syndrome
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-dim)', lineHeight: 1.6 }}>
                <li>Crushing substernal chest heaviness or squeezing</li>
                <li>Pain radiating into left shoulder, arm, jaw, or neck</li>
                <li>Sudden unexplained diaphoresis (cold clammy sweats)</li>
                <li>Severe dyspnea accompanied by lightheadedness</li>
              </ul>
            </div>

            <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'rgba(251,191,36,.05)', border: '1px solid rgba(251,191,36,.2)' }}>
              <div style={{ fontWeight: 600, color: 'var(--amber)', fontSize: 14, marginBottom: 6 }}>
                ⚠️ Acute Glycemic or Metabolic Crisis
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-dim)', lineHeight: 1.6 }}>
                <li>Sudden altered mental status, confusion, or delirium</li>
                <li>Fruity breath odor with rapid deep Kussmaul respirations</li>
                <li>Severe profound hypoglycemia with tremors or fainting</li>
                <li>Inability to retain oral fluids with persistent emesis</li>
              </ul>
            </div>
          </div>
        </div>

        {/* International Emergency Dispatch Numbers */}
        <div className="panel reveal" style={{ marginBottom: 32 }}>
          <span className="eyebrow" style={{ marginBottom: 14 }}>
            Direct Regional Emergency Dispatch Directory
          </span>

          <div style={{ display: 'grid', gap: 10 }}>
            {EMERGENCY_SERVICES.map((s) => (
              <div
                key={s.region}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,.02)',
                  border: '1px solid var(--line-soft)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>{s.region}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 2 }}>{s.desc}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-teal"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={() => handleTriggerCall(s)}
                >
                  Dial {s.number}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Strict Medical Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.6, textAlign: 'center' }}>
          AAROGYAM is a machine learning research prototype. It does not possess real-time telemetry,
          does not dispatch first responders, and does not monitor live patient conditions.
          In any life-threatening situation, always dial local emergency numbers immediately.
        </p>

        {/* Call Confirmation Dialog */}
        {confirmCall && (
          <div className="modal-overlay" onClick={() => setConfirmCall(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 440 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📞</div>
              <h2 className="display" style={{ fontSize: 24, marginBottom: 8 }}>
                Initiate Emergency Call?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', marginBottom: 20 }}>
                You are about to dial <strong>{confirmCall.number}</strong> ({confirmCall.region}).
                This will trigger your device’s phone dialer.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: '10px 22px', fontSize: 13 }}
                  onClick={handleProceedCall}
                >
                  Confirm & Call {confirmCall.number}
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '10px 18px', fontSize: 13 }}
                  onClick={() => setConfirmCall(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
