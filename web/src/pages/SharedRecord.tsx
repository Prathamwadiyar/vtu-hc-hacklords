import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProbabilityDial from '../components/ProbabilityDial';
import { stage2, type StoredScreeningRecord } from '../lib/api';
import { useReveal } from '../lib/motion';

export default function SharedRecord() {
  const { token } = useParams<{ token: string }>();
  const scope = useRef<HTMLDivElement>(null);
  const [record, setRecord] = useState<StoredScreeningRecord | null>(null);
  const [shareInfo, setShareInfo] = useState<{ id: string; expires_at: string; access_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No sharing token provided');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    stage2.resolveShared(token)
      .then((res) => {
        if (!active) return;
        setRecord(res.record);
        setShareInfo(res.share);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Invalid or expired share link');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  useReveal(scope, [record, loading, error]);

  return (
    <div ref={scope} style={{ paddingTop: 108, paddingBottom: 80 }} className="page-enter">
      <div className="wrap" style={{ maxWidth: 840 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/" className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
            ← Home
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 32, width: '40%', margin: '0 auto 16px' }} />
            <div className="skeleton" style={{ height: 120, width: '70%', margin: '0 auto 16px' }} />
            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              Verifying cryptographic share token hash with backend…
            </p>
          </div>
        )}

        {/* Error / Expired */}
        {error && (
          <div className="panel" style={{ padding: 48, textAlign: 'center', borderColor: 'var(--rose)' }}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>🔒</div>
            <h1 className="display" style={{ fontSize: 28, marginBottom: 12, color: 'var(--rose)' }}>
              Share Link Expired or Unavailable
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', maxWidth: '50ch', margin: '0 auto 24px' }}>
              {error}. For patient privacy and security, clinical QR tokens automatically expire after 15 minutes
              or upon manual revocation.
            </p>
            <Link to="/records" className="btn btn-teal">
              Go to Medical Records
            </Link>
          </div>
        )}

        {/* Record Content */}
        {!loading && !error && record && shareInfo && (
          <div>
            <div className="banner banner--info" style={{ marginBottom: 24 }}>
              <span>🛡️</span>
              <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                <strong>Authorized Temporary Access:</strong> This is an ephemeral shared clinical screening record.
                Session access count: {shareInfo.access_count}. Expires at {new Date(shareInfo.expires_at).toLocaleTimeString()}.
              </div>
            </div>

            <div className="result-hero reveal" style={{ marginBottom: 24 }}>
              <p className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: 8 }}>
                Verified Clinical Telemetry · {record.condition}
              </p>
              <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 12 }}>
                Patient: {record.patient_name ?? record.patient_id}
              </h1>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <span className="chip">{record.id}</span>
                <span className="chip">{record.patient_age}y · {record.patient_gender}</span>
                <span className="chip chip-warn">DEMO RECORD</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ProbabilityDial p={record.probability} label={`Evaluated risk probability`} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="chip" style={{ fontSize: 12, padding: '5px 14px', borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                  Tier: {record.risk_tier} Risk
                </span>
                <span className={`chip ${record.conformal_status === 'committed' ? 'chip-benign' : 'chip-warn'}`} style={{ fontSize: 12, padding: '5px 14px' }}>
                  Conformal: {record.conformal_status} ({record.conformal_confidence ?? 95}%)
                </span>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="panel reveal" style={{ marginBottom: 24 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Clinical Parameters at Evaluation</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {Object.entries(record.input_parameters).map(([k, v]) => (
                  <div key={k} style={{ padding: '8px 12px', background: 'rgba(255,255,255,.02)', borderRadius: 8, border: '1px solid var(--line-soft)' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                      {k.replace(/_/g, ' ')}
                    </div>
                    <div className="mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Consensus */}
            <div className="panel reveal" style={{ marginBottom: 24 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Quantum-Classical Model Consensus</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginBottom: 8 }}>Classical Ensemble:</div>
                  <div className="mono" style={{ fontSize: 13, lineHeight: 1.8 }}>
                    Logistic Regression: {((record.model_consensus?.logistic_regression ?? 0) * 100).toFixed(1)}%<br />
                    Random Forest: {((record.model_consensus?.random_forest ?? 0) * 100).toFixed(1)}%<br />
                    SVM (RBF): {((record.model_consensus?.svm ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--violet-soft)', marginBottom: 8 }}>Quantum Models:</div>
                  <div className="mono" style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--violet-soft)' }}>
                    QSVM Kernel: {((record.model_consensus?.qsvm ?? 0) * 100).toFixed(1)}%<br />
                    VQC Variational: {((record.model_consensus?.vqc ?? 0) * 100).toFixed(1)}%<br />
                    Quantum NN: {((record.model_consensus?.qnn ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Medical Disclaimer */}
            <p style={{ fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.6, textAlign: 'center' }}>
              AAROGYAM Research Demonstration. This shared record is generated for clinical decision-support evaluation
              and does not replace formal pathology or licensed physician consultation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
