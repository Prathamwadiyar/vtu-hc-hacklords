import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../lib/motion';

export default function Wellness() {
  const scope = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'cardio' | 'metabolic' | 'lifestyle'>('cardio');

  useReveal(scope, [activeTab]);

  return (
    <div ref={scope} style={{ paddingTop: 108, paddingBottom: 80 }} className="page-enter">
      <div className="wrap">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/patient" className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
            ← Back to Patient Portal
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span className="eyebrow">Preventive Health Intelligence</span>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.5vw, 54px)' }}>
            Evidence-Based Wellness Guidance
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            Actionable clinical recommendations for cardiovascular resilience, metabolic equilibrium,
            and sustainable lifestyle optimization.
          </p>
        </div>

        {/* Medical disclaimer alert */}
        <div className="banner banner--info" style={{ marginBottom: 28 }}>
          <span>ℹ️</span>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <strong>Educational Resource:</strong> These wellness insights are compiled from established cardiological
            and endocrinological preventive guidelines (AHA, ADA, WHO). They provide general lifestyle recommendations
            and do not replace personalized therapeutic plans prescribed by your physician.
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          <button
            type="button"
            className="chip"
            style={{
              cursor: 'pointer',
              borderColor: activeTab === 'cardio' ? 'var(--rose)' : 'var(--line)',
              color: activeTab === 'cardio' ? 'var(--rose)' : 'var(--ink-dim)',
              background: activeTab === 'cardio' ? 'rgba(255,77,109,.12)' : 'transparent',
              fontSize: 12,
              padding: '8px 18px',
            }}
            onClick={() => setActiveTab('cardio')}
          >
            ❤️ Cardiovascular Health
          </button>
          <button
            type="button"
            className="chip"
            style={{
              cursor: 'pointer',
              borderColor: activeTab === 'metabolic' ? 'var(--amber)' : 'var(--line)',
              color: activeTab === 'metabolic' ? 'var(--amber)' : 'var(--ink-dim)',
              background: activeTab === 'metabolic' ? 'rgba(251,191,36,.12)' : 'transparent',
              fontSize: 12,
              padding: '8px 18px',
            }}
            onClick={() => setActiveTab('metabolic')}
          >
            🩸 Metabolic & Glucose Control
          </button>
          <button
            type="button"
            className="chip"
            style={{
              cursor: 'pointer',
              borderColor: activeTab === 'lifestyle' ? 'var(--cyan)' : 'var(--line)',
              color: activeTab === 'lifestyle' ? 'var(--cyan)' : 'var(--ink-dim)',
              background: activeTab === 'lifestyle' ? 'rgba(34,211,238,.12)' : 'transparent',
              fontSize: 12,
              padding: '8px 18px',
            }}
            onClick={() => setActiveTab('lifestyle')}
          >
            🌿 Nutrition, Rest & Activity
          </button>
        </div>

        {/* CARDIOVASCULAR CONTENT */}
        {activeTab === 'cardio' && (
          <div className="grid cols-3 reveal" style={{ gap: 20, marginBottom: 36 }}>
            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🩺</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Arterial Pressure Monitoring
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Systolic blood pressure above 130 mm Hg or diastolic above 80 mm Hg warrants serial home monitoring.
                Early interventions significantly reduce left ventricular strain and vascular remodeling.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>
                Target: &lt; 120/80 mm Hg
              </div>
            </div>

            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🥑</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Lipid Balance & Diet
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Minimize dietary saturated and industrial trans fats. Prioritize soluble fiber, plant sterols,
                omega-3 fatty acids, and cold-pressed extra virgin olive oil to optimize ApoB and LDL particle counts.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--emerald)' }}>
                Focus: Low-SFA, High Soluble Fiber
              </div>
            </div>

            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏃‍♂️</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Zone-2 Aerobic Exercise
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Aim for 150 minutes weekly of moderate-intensity steady-state cardio (Zone 2, where breathing is elevated
                yet conversational). This builds mitochondrial density and enhances microvascular elasticity.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--violet-soft)' }}>
                Protocol: 150 min/wk moderate aerobic
              </div>
            </div>
          </div>
        )}

        {/* METABOLIC CONTENT */}
        {activeTab === 'metabolic' && (
          <div className="grid cols-3 reveal" style={{ gap: 20, marginBottom: 36 }}>
            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>📉</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Glycemic Stability & Peaks
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Prevent excessive post-prandial glycemic excursions by pairing carbohydrates with protein, fiber,
                and healthy lipids. Eating non-starchy vegetables first can blunt subsequent glucose spikes by up to 35%.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--amber)' }}>
                Strategy: Food Sequencing & Fiber Preload
              </div>
            </div>

            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>⚖️</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Visceral Adiposity & BMI
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Visceral abdominal adipose tissue secretes inflammatory cytokines that directly impair insulin receptor
                sensitivity. A 5–7% reduction in overall body weight can reduce type 2 diabetes progression risk by 58%.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--emerald)' }}>
                Indicator: Waist-to-Height Ratio &lt; 0.5
              </div>
            </div>

            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🚶‍♀️</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Post-Meal Ambulatory Walks
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                A light 10–15 minute walk immediately following your largest meal activates non-insulin-mediated
                GLUT4 glucose transporters directly in skeletal muscle, clearing serum glucose with zero pancreatic stress.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>
                Action: 12 min walk post-dinner
              </div>
            </div>
          </div>
        )}

        {/* LIFESTYLE CONTENT */}
        {activeTab === 'lifestyle' && (
          <div className="grid cols-3 reveal" style={{ gap: 20, marginBottom: 36 }}>
            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🛌</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Sleep Architecture & Circadian
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Chronic sleep fragmentation (&lt; 6.5 hours/night) induces acute insulin resistance and sympathetic
                hyperactivity. Prioritize consistent sleep-wake cycles and a cool, dark sleep environment.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--violet-soft)' }}>
                Target: 7–8.5 hours restorative sleep
              </div>
            </div>

            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🧘‍♂️</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Cortisol & Stress Management
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Sustained psychosocial stress stimulates continuous cortisol and epinephrine release, elevating fasting
                hepatic gluconeogenesis and resting heart rate. Daily vagal stimulation exercises help normalize autonomic tone.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>
                Practice: Resonant breathing (5.5s in / 5.5s out)
              </div>
            </div>

            <div className="wellness-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>💧</div>
              <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                Cellular Hydration & Electrolytes
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Subclinical dehydration concentrates plasma volume, falsely elevates measured haematocrit, and increases
                viscous hemodynamic resistance. Ensure consistent intake of pure water balanced with dietary potassium and magnesium.
              </p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--emerald)' }}>
                Intake: 2.5–3.2 Liters daily
              </div>
            </div>
          </div>
        )}

        {/* Screening Call to Action Footer */}
        <div className="panel reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Assess Your Current Biomarkers</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Translate these wellness principles into concrete risk stratification using our screening wizard.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/patient/screening/heart" className="btn btn-teal" style={{ fontSize: 12 }}>
              Heart Screening →
            </Link>
            <Link to="/patient/screening/diabetes" className="btn" style={{ fontSize: 12 }}>
              Diabetes Screening →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
