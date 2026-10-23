import { useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProbabilityDial from '../components/ProbabilityDial';
import { SERIES } from '../components/charts';
import type { DetectResult } from '../lib/api';
import { useReveal } from '../lib/motion';

interface ScreeningLocationState {
  result?: DetectResult;
  datasetId?: string;
  conditionName?: string;
  inputs?: Record<string, number>;
  recordId?: string;
  timestamp?: string;
}

const TIER_COLOUR: Record<string, string> = {
  'Very low': '#199e70',
  Low: '#5aa06a',
  Moderate: '#c98500',
  High: '#e0666a',
  'Very high': '#d5395f',
};

const MODEL_LABEL: Record<string, string> = {
  logistic_regression: 'Logistic Regression',
  random_forest: 'Random Forest',
  svm: 'Support Vector Machine (RBF)',
  qsvm: 'Quantum Support Vector Machine (QSVM)',
  vqc: 'Variational Quantum Classifier (VQC)',
  qnn: 'Quantum Neural Network (QNN)',
  classical_mean: 'Classical Ensemble Mean',
  quantum_mean: 'Quantum Ensemble Mean',
  hybrid: 'Calibrated Hybrid Ensemble',
};

export default function ScreeningResults() {
  const location = useLocation();
  const scope = useRef<HTMLDivElement>(null);

  const stateData: ScreeningLocationState | null = useMemo(() => {
    if (location.state && (location.state as ScreeningLocationState).result) {
      return location.state as ScreeningLocationState;
    }
    try {
      const cached = sessionStorage.getItem('last_screening_result');
      if (cached) return JSON.parse(cached) as ScreeningLocationState;
    } catch {
      // ignore
    }
    return null;
  }, [location.state]);

  useReveal(scope, [stateData]);

  if (!stateData || !stateData.result) {
    return (
      <div ref={scope} style={{ paddingTop: 120, paddingBottom: 80 }} className="page-enter">
        <div className="wrap" style={{ maxWidth: 640, textAlign: 'center' }}>
          <div className="panel" style={{ padding: 48 }}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>📋</div>
            <h1 className="display" style={{ fontSize: 32, marginBottom: 12 }}>
              No Active Screening Found
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-dim)', marginBottom: 28 }}>
              No recent screening evaluation session was detected. You can launch a new screening
              from the patient portal anytime.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/patient" className="btn btn-teal">
                Go to Patient Portal
              </Link>
              <Link to="/patient/screening/heart" className="btn">
                Start Heart Screening
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { result, conditionName = 'Health Risk', datasetId = 'heart_cleveland', inputs, timestamp } = stateData;
  const tierColor = TIER_COLOUR[result.risk.tier] ?? 'var(--cyan)';
  const formattedDate = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();

  return (
    <div ref={scope} style={{ paddingTop: 108, paddingBottom: 80 }} className="page-enter">
      <div className="wrap" style={{ maxWidth: 980 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <Link to="/patient" className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
            ← Back to Patient Dashboard
          </Link>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
            {stateData.recordId ? `PERSISTED RECORD: ${stateData.recordId} · ` : ''}EVALUATION ID: #{Math.abs(result.latency_ms * 31).toString(16).toUpperCase()} · {formattedDate}
          </span>
        </div>

        {/* Hero Card */}
        <div className="result-hero reveal" style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: 8 }}>
            Screening Complete · {conditionName}
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 5vw, 54px)', marginBottom: 16 }}>
            Risk Stratification Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-dim)', maxWidth: '58ch', margin: '0 auto 28px' }}>
            Multi-model quantum-classical consensus with distribution-free conformal calibration.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
            <ProbabilityDial p={result.probability} label={`Estimated ${result.disease.toLowerCase()} risk`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <span
              className="chip"
              style={{
                borderColor: `${tierColor}88`,
                color: tierColor,
                background: `${tierColor}18`,
                fontSize: 12,
                padding: '6px 16px',
              }}
            >
              Tier: {result.risk.tier} Risk ({(result.risk.lower * 100).toFixed(0)}% – {(result.risk.upper * 100).toFixed(0)}%)
            </span>
            <span
              className={`chip ${result.conformal.status === 'committed' ? 'chip-benign' : 'chip-warn'}`}
              style={{ fontSize: 12, padding: '6px 16px' }}
            >
              {result.conformal.status === 'committed'
                ? `Conformal: Committed (${result.conformal.confidence_level}% target coverage)`
                : 'Conformal: Model Abstains'}
            </span>
            <span className="chip chip-quantum" style={{ fontSize: 12, padding: '6px 16px' }}>
              Ensemble: {Math.round(result.weights.classical * 100)}% Classical / {Math.round(result.weights.quantum * 100)}% Quantum
            </span>
          </div>
        </div>

        {/* Medical disclaimer alert */}
        <div className="banner banner--warn reveal" style={{ marginBottom: 28 }}>
          <span>⚕</span>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <strong>Mandatory Medical Notice:</strong> This report is generated by a mathematical and machine learning
            research prototype (AAROGYAM). It is <strong>NOT a definitive clinical diagnosis</strong>, laboratory result,
            or prescription. Normal scores do not rule out cardiovascular or endocrine disease, and elevated scores
            warrant professional medical evaluation. Please share this output with a qualified physician.
          </div>
        </div>

        {/* Detailed Panels Grid */}
        <div className="grid cols-2 reveal" style={{ gap: 20, marginBottom: 28, alignItems: 'start' }}>
          {/* Left: Model consensus */}
          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 14 }}>
              Component Model Ensemble Consensus
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', marginBottom: 18 }}>
              Individual model output probabilities before meta-weighting and conformal calibration:
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {/* Classical models */}
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '.1em' }}>
                Classical Models
              </div>
              {['logistic_regression', 'random_forest', 'svm'].map((key) => {
                const val = result.models[key] ?? 0;
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 48px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{MODEL_LABEL[key] ?? key}</span>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                      <div style={{ width: `${val * 100}%`, height: '100%', background: SERIES[0] }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11, textAlign: 'right' }}>{(val * 100).toFixed(1)}%</span>
                  </div>
                );
              })}

              <div className="rule" style={{ margin: '4px 0' }} />

              {/* Quantum models */}
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--violet-soft)', letterSpacing: '.1em' }}>
                Quantum Kernel & Neural Models
              </div>
              {['qsvm', 'vqc', 'qnn'].map((key) => {
                const val = result.models[key] ?? 0;
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 48px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{MODEL_LABEL[key] ?? key}</span>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                      <div style={{ width: `${val * 100}%`, height: '100%', background: SERIES[2] }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11, textAlign: 'right' }}>{(val * 100).toFixed(1)}%</span>
                  </div>
                );
              })}

              <div className="rule" style={{ margin: '4px 0' }} />

              {/* Hybrid final */}
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 48px', gap: 10, alignItems: 'center', paddingTop: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Hybrid Consensus</span>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                  <div style={{ width: `${(result.models.hybrid ?? result.probability) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--violet), var(--cyan))' }} />
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', color: 'var(--cyan)' }}>
                  {((result.models.hybrid ?? result.probability) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,.02)', border: '1px solid var(--line-soft)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
                <strong>Quantum–Classical Disagreement:</strong>{' '}
                <span className="mono" style={{ color: result.uncertainty.quantum_classical_disagreement > 0.25 ? 'var(--amber)' : 'var(--emerald)' }}>
                  {(result.uncertainty.quantum_classical_disagreement * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
                Inference latency: {result.latency_ms} ms · Evaluation state: Valid
              </div>
            </div>
          </div>

          {/* Right: Feature Contributions or Input Summary */}
          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 14 }}>
              {result.explanation && result.explanation.length > 0 ? 'Explainable AI Feature Contributions' : 'Submitted Patient Measurements'}
            </p>

            {result.explanation && result.explanation.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', marginBottom: 10 }}>
                  SHAP / sensitivity coefficients showing which factors pushed the risk score upward or downward:
                </p>
                {result.explanation.slice(0, 8).map((exp, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 60px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: 'var(--ink)' }}>{exp.feature.replace(/_/g, ' ')}</span>
                    <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.abs(exp.contribution) * 100)}%`,
                          height: '100%',
                          background: exp.direction?.includes('disease') || exp.direction === 'increases_risk' || exp.contribution > 0 ? 'var(--rose)' : 'var(--emerald)',
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, textAlign: 'right', color: exp.direction?.includes('disease') || exp.direction === 'increases_risk' || exp.contribution > 0 ? '#ff8098' : '#6ee7b7' }}>
                      {exp.contribution > 0 ? `+${exp.contribution.toFixed(2)}` : exp.contribution.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : inputs ? (
              <div style={{ display: 'grid', gap: 6, maxHeight: 380, overflowY: 'auto' }}>
                <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', marginBottom: 8 }}>
                  Measurements submitted for this screening session:
                </p>
                {Object.entries(inputs).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,.02)', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-dim)' }}>{k.replace(/_/g, ' ')}</span>
                    <span className="mono" style={{ color: 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>No feature breakdown data returned.</p>
            )}

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
              <Link to={`/detect?dataset=${datasetId}`} className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                🔬 View in Research Detect Sandbox
              </Link>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="panel reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Ready for next steps?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
              Explore lifestyle guidance or securely save this record for future clinician review.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/wellness" className="btn btn-teal" style={{ fontSize: 12.5 }}>
              Wellness Recommendations →
            </Link>
            <Link to="/records" className="btn" style={{ fontSize: 12.5 }}>
              View Medical Records
            </Link>
            <Link to="/patient" className="btn" style={{ fontSize: 12.5 }}>
              Start Another Screening
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
