import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import HelixScene from '../components/HelixScene';
import Stat from '../components/Stat';
import { DOMAIN_COLOUR, api, platform, type PlatformOverview } from '../lib/api';
import { reducedMotion, useReveal } from '../lib/motion';

const PIPELINE = [
  { n: '01', t: 'Ingest and clean', d: 'Any binary-outcome biomedical table. Constant columns dropped, missing cells imputed from the training split, noisy tails clipped, everything normalised.' },
  { n: '02', t: 'Select and reduce', d: 'Features ranked by mutual information, then projected by PCA onto as many components as there are qubits — the classical front-end of the hybrid architecture.' },
  { n: '03', t: 'Encode', d: 'Components rescaled to [0, π] and prepared as an entangled register through a ZZFeatureMap, computed as batched statevector algebra.' },
  { n: '04', t: 'Train six models', d: 'Logistic regression, random forest and an RBF SVM classically; a quantum-kernel SVM, a variational classifier and a data re-uploading QNN on the encoded state.' },
  { n: '05', t: 'Decide, or decline', d: 'A validation-weighted ensemble, a risk tier, a tunable operating point, and a conformal predictor that abstains instead of guessing.' },
];

export default function Landing() {
  const scope = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const [ov, setOv] = useState<PlatformOverview | null>(null);
  const [m, setM] = useState<any>(null);

  useEffect(() => {
    platform.overview().then(setOv).catch(() => {});
    api.metrics().then(setM).catch(() => {});
  }, []);
  useReveal(scope, [ov, m]);

  useEffect(() => {
    if (reducedMotion() || !hero.current) return;
    const q = gsap.utils.selector(hero);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(q('.h-eyebrow'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo(q('.h-line'), { opacity: 0, y: 44 },
              { opacity: 1, y: 0, duration: 1, stagger: 0.09 }, '-=0.3')
      .fromTo(q('.h-lede'), { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.8 }, '-=0.55')
      .fromTo(q('.h-cta'), { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.5')
      .fromTo(q('.h-canvas'), { opacity: 0, scale: 0.94 },
              { opacity: 1, scale: 1, duration: 1.6 }, 0.15);
    return () => { tl.kill(); };
  }, []);

  const totalSamples = (ov?.catalogue ?? []).reduce((a, d) => a + d.n_samples, 0);
  const quantumWins = (ov?.comparison ?? []).filter((c) => c.quantum > c.classical).length;

  return (
    <div ref={scope}>
      {/* ---------------- hero ---------------- */}
      <section ref={hero} style={{ position: 'relative', minHeight: '100svh',
                                   display: 'flex', alignItems: 'center' }}>
        <div className="h-canvas hero-canvas">
          <HelixScene className="helix-hero" />
        </div>

        <div className="wrap hero-copy" style={{ position: 'relative', zIndex: 1,
                                                 paddingTop: 80, paddingBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'var(--teal-soft)', border: '1px solid rgba(13, 148, 136, 0.25)', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#0F766E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              VTU Qiskit Fall Fest · Quantum-Assisted Health Intelligence
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', maxWidth: '14ch', color: 'var(--ink)', lineHeight: 1.02 }}>
            <span className="h-line" style={{ display: 'block' }}>Earlier insights.</span>
            <span className="h-line" style={{ display: 'block', color: 'var(--teal)' }}>
              Better decisions.
            </span>
          </h1>

          <p className="lede h-lede" style={{ marginTop: 24, fontSize: 18, color: 'var(--ink-dim)', maxWidth: '58ch', lineHeight: 1.6 }}>
            AAROGYAM explores how classical AI and quantum machine learning can support early health risk screening through explainable, data-driven intelligence.
          </p>

          <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
            <Link className="btn btn-teal h-cta" to="/patient" style={{ padding: '12px 24px', fontSize: 14 }}>
              Explore Patient Portal
            </Link>
            <Link className="btn btn-primary h-cta" to="/professional" style={{ padding: '12px 24px', fontSize: 14 }}>
              Explore Clinical Portal
            </Link>
            <Link className="btn h-cta" to="/detect" style={{ padding: '12px 24px', fontSize: 14 }}>
              View Quantum Research
            </Link>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, zIndex: 1 }}>
          <div className="wrap mono" style={{ fontSize: 10, letterSpacing: '.2em',
                                              textTransform: 'uppercase',
                                              color: 'var(--ink-faint)' }}>
            Scroll
          </div>
        </div>
      </section>

      {/* ---------------- portal entry ---------------- */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ padding: '0 0 80px' }}>
          <p className="eyebrow" style={{ marginBottom: 20, opacity: 0.7 }}>Access Portals</p>
          <div className="grid cols-2" style={{ gap: 20 }}>
            <Link to="/patient" className="portal-card portal-card--patient">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(34,211,238,.2), rgba(34,211,238,.05))',
                  border: '1px solid rgba(34,211,238,.25)', fontSize: 22,
                }}>♥</div>
                <div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--serif)', fontWeight: 400, marginBottom: 2 }}>
                    Patient Portal
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Health screening &amp; records</div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', margin: '0 0 20px', lineHeight: 1.6 }}>
                Run heart disease and diabetes screenings, view your health history,
                access wellness guidance, and share records securely.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Heart Disease', 'Diabetes', 'Wellness', 'Records'].map((t) => (
                  <span key={t} className="chip" style={{ borderColor: 'rgba(34,211,238,.25)', color: '#7ee8f8' }}>{t}</span>
                ))}
              </div>
            </Link>

            <Link to="/professional" className="portal-card portal-card--professional">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(124,92,255,.2), rgba(124,92,255,.05))',
                  border: '1px solid rgba(124,92,255,.3)', fontSize: 22,
                }}>⚕</div>
                <div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--serif)', fontWeight: 400, marginBottom: 2 }}>
                    Healthcare Professional
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Clinical dashboard &amp; model insights</div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', margin: '0 0 20px', lineHeight: 1.6 }}>
                Review patient screening results, compare quantum vs classical model
                performance, access technical explainability, and manage shared records.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Patients', 'Model XAI', 'Q vs C', 'Records'].map((t) => (
                  <span key={t} className="chip" style={{ borderColor: 'rgba(124,92,255,.3)', color: 'var(--violet-soft)' }}>{t}</span>
                ))}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- stat band ---------------- */}
      <section style={{ borderTop: '1px solid var(--line-soft)',
                        borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap" style={{ padding: '54px 0' }}>
          <div className="grid cols-4 reveal">
            <Stat value={ov?.catalogue.length ?? 0} label="Diseases covered out of the box"
                  note="cancer · cardiovascular · neurological · metabolic" />
            <Stat value={totalSamples} label="Patient records across the catalogue"
                  note="genomics, imaging, records and voice" />
            <Stat value={6} label="Models trained per dataset"
                  note="three classical, three quantum" />
            <Stat value={quantumWins} label="Datasets where quantum beats classical"
                  note="measured, not assumed" />
          </div>
        </div>
      </section>

      {/* ---------------- catalogue ---------------- */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">The catalogue</p>
          <h2 className="display reveal" style={{ fontSize: 'clamp(28px, 4vw, 48px)',
                                                  maxWidth: '20ch', marginBottom: 26 }}>
            The same stack, four clinical domains and one genomics case study.
          </h2>
          <div className="grid cols-3" style={{ gap: 18 }}>
            {(ov?.catalogue ?? []).map((d) => (
              <Link key={d.id} to={`/detect?dataset=${d.id}`} className="panel reveal">
                <span className="chip" style={{
                  borderColor: `${DOMAIN_COLOUR[d.domain]}66`,
                  color: DOMAIN_COLOUR[d.domain],
                  background: `${DOMAIN_COLOUR[d.domain]}18` }}>{d.domain}</span>
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24,
                             margin: '14px 0 8px', lineHeight: 1.15 }}>{d.disease}</h3>
                <p style={{ fontSize: 12.8, color: 'var(--ink-dim)', margin: 0 }}>
                  {d.description}
                </p>
                <p className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)',
                                             marginTop: 12, marginBottom: 0 }}>
                  {d.n_samples.toLocaleString()} × {d.n_features} · {d.modality.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- two core screening conditions ---------------- */}
      <section className="section" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <p className="eyebrow reveal" style={{ color: 'var(--teal)' }}>Early Detection Focus</p>
            <h2 className="display reveal" style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', color: 'var(--ink)' }}>
              Two Core Screening Conditions
            </h2>
            <p className="lede reveal" style={{ margin: '14px auto 0', fontSize: 16 }}>
              AAROGYAM combines clinical feature standardization with quantum feature-map kernel analysis to screen for early asymptomatic risk indicators.
            </p>
          </div>

          <div className="grid cols-2" style={{ gap: 24 }}>
            <div className="panel reveal" style={{ padding: 32, borderTop: '4px solid var(--rose)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span className="chip" style={{ background: '#FEF2F2', color: 'var(--rose)', borderColor: 'rgba(220,38,38,0.2)' }}>Cardiovascular</span>
                  <h3 style={{ fontSize: 26, fontFamily: 'var(--serif)', margin: '12px 0 4px', color: 'var(--ink)' }}>Heart Disease Screening</h3>
                </div>
                <div style={{ fontSize: 32 }}>🫀</div>
              </div>
              <p style={{ color: 'var(--ink-dim)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Analyzes 13 non-invasive clinical attributes including resting blood pressure, cholesterol levels, thal, ST depression (oldpeak), and exercise-induced angina via the Cleveland Heart architecture.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Features</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>13 Clinical</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Quantum Qubits</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal)' }}>4-Qubit ZZMap</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Screening Time</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--violet)' }}>&lt; 150 ms</div>
                </div>
              </div>
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Calibrated 5-tier risk stratification</span>
                <Link to="/screening?condition=heart_disease" className="btn btn-teal" style={{ padding: '8px 18px', fontSize: 13 }}>
                  Start Heart Screening →
                </Link>
              </div>
            </div>

            <div className="panel reveal" style={{ padding: 32, borderTop: '4px solid var(--teal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span className="chip" style={{ background: 'var(--teal-soft)', color: 'var(--teal)', borderColor: 'rgba(13,148,136,0.2)' }}>Metabolic</span>
                  <h3 style={{ fontSize: 26, fontFamily: 'var(--serif)', margin: '12px 0 4px', color: 'var(--ink)' }}>Diabetes Risk Screening</h3>
                </div>
                <div style={{ fontSize: 32 }}>🩸</div>
              </div>
              <p style={{ color: 'var(--ink-dim)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Evaluates metabolic biomarkers including plasma glucose concentration, BMI, insulin, blood pressure, and diabetes pedigree function derived from the validated Pima Indian cohort.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Features</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>8 Biomarkers</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Quantum Qubits</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal)' }}>4-Qubit ZZMap</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Screening Time</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--violet)' }}>&lt; 120 ms</div>
                </div>
              </div>
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>SHAP explainability enabled</span>
                <Link to="/screening?condition=diabetes" className="btn btn-teal" style={{ padding: '8px 18px', fontSize: 13 }}>
                  Start Diabetes Screening →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- how it works visual 3-step ---------------- */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
            <p className="eyebrow reveal">Visual Intelligence Process</p>
            <h2 className="display reveal" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
              How AAROGYAM Works
            </h2>
          </div>
          <div className="grid cols-3" style={{ gap: 20 }}>
            <div className="panel reveal" style={{ padding: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-soft)', display: 'grid', placeItems: 'center', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--mono)', marginBottom: 16 }}>
                01
              </div>
              <h3 style={{ fontSize: 20, fontFamily: 'var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>Input &amp; Mutual Info Filter</h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.6, margin: 0 }}>
                Patient physiological metrics are captured via the step-by-step screening wizard, cleaned, normalized, and ranked using non-linear mutual information statistics.
              </p>
            </div>

            <div className="panel reveal" style={{ padding: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--violet-soft)', display: 'grid', placeItems: 'center', color: 'var(--violet)', fontWeight: 700, fontFamily: 'var(--mono)', marginBottom: 16 }}>
                02
              </div>
              <h3 style={{ fontSize: 20, fontFamily: 'var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>Quantum Statevector Encoding</h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.6, margin: 0 }}>
                Features are projected to a 4-qubit Hilbert space via ZZFeatureMap quantum entanglement. Fidelity kernels are simulated deterministically in closed form on CPU.
              </p>
            </div>

            <div className="panel reveal" style={{ padding: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF3C7', display: 'grid', placeItems: 'center', color: 'var(--amber)', fontWeight: 700, fontFamily: 'var(--mono)', marginBottom: 16 }}>
                03
              </div>
              <h3 style={{ fontSize: 20, fontFamily: 'var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>Explainable Risk &amp; QR Sharing</h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.6, margin: 0 }}>
                Predictions deliver clear risk probabilities, 5-tier classification, SHAP feature importance attributions, and cryptographically signed QR records for clinical review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- pipeline ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">Technical Pipeline Details</p>
          <div className="grid" style={{ gap: 18, marginTop: 24,
                                         gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {PIPELINE.map((s) => (
              <div key={s.n} className="panel reveal" style={{ minHeight: 190 }}>
                <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400,
                             margin: '10px 0 8px' }}>{s.t}</h3>
                <p style={{ fontSize: 12.6, color: 'var(--ink-dim)', margin: 0, lineHeight: 1.5 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- contributions ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">What this build contributes</p>
          <div className="grid cols-3" style={{ gap: 22, marginTop: 26 }}>
            <article className="panel reveal">
              <span className="chip chip-quantum">diagnostic</span>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400,
                           margin: '16px 0 10px' }}>
                It tells you when quantum <em>won't</em> help
              </h3>
              <p style={{ fontSize: 13.2, color: 'var(--ink-dim)' }}>
                Before training anything, the platform sweeps the quantum kernel
                across register widths and measures how fast its off-diagonal
                spread collapses. On these datasets it halves with every qubit
                added — the exponential concentration that makes a quantum kernel
                useless — and that is reported up front rather than discovered
                after the fact.
              </p>
            </article>
            <article className="panel reveal">
              <span className="chip chip-benign">honesty</span>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400,
                           margin: '16px 0 10px' }}>A model that can abstain</h3>
              <p style={{ fontSize: 13.2, color: 'var(--ink-dim)' }}>
                Conformal prediction gives a distribution-free coverage guarantee,
                and where the calibration set is too small to support it the
                platform says so. Every dataset also gets a risk ladder whose
                bands are checked against the observed outcome rate.
              </p>
            </article>
            <article className="panel reveal">
              <span className="chip chip-warn">speed</span>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400,
                           margin: '16px 0 10px' }}>Quantum kernels in closed form</h3>
              <p style={{ fontSize: 13.2, color: 'var(--ink-dim)' }}>
                Under statevector simulation the fidelity kernel has an exact
                closed form, so states are prepared once instead of once per
                pair — O(n) rather than O(n²)
                {m?.quantum && <>, matching Qiskit to{' '}
                  {Number(m.quantum.kernel_max_deviation_vs_qiskit).toExponential(0)}</>}.
                That is what makes both the diagnostic sweep and browser-speed
                training possible.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------- genomics case study ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="panel reveal" style={{ padding: 'clamp(26px, 4vw, 48px)' }}>
            <div className="grid cols-2" style={{ gap: 40, alignItems: 'center' }}>
              <div>
                <span className="chip chip-quantum">deep dive</span>
                <h2 className="display" style={{ fontSize: 'clamp(26px, 3.4vw, 42px)',
                                                 margin: '16px 0 12px' }}>
                  A genomics case study, taken all the way down.
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>
                  The BRCA1/BRCA2 dataset gets the full treatment: HGVS parsing,
                  Grantham chemistry, functional-domain mapping, a corrected
                  evaluation that removes ClinVar's duplicate assembly rows — and
                  a resolver that scores the{' '}
                  {m?.dataset ? m.dataset.n_vus.toLocaleString() : 'thousands of'}{' '}
                  variants ClinVar still calls uncertain.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                  <Link className="btn btn-primary" to="/genomics">Open the deep-dive</Link>
                  <Link className="btn" to="/resolver">The VUS Resolver</Link>
                </div>
              </div>
              <div className="grid cols-2" style={{ gap: 14 }}>
                {[
                  { v: m?.dataset?.n_labelled != null ? m.dataset.n_labelled.toLocaleString() : '20,296', l: 'Classified variants' },
                  { v: m?.dataset?.n_vus != null ? m.dataset.n_vus.toLocaleString() : '15,581', l: 'Unresolved, scored' },
                  { v: m?.leakage?.inflation_points != null ? `${m.leakage.inflation_points.toFixed(1)} pts` : '1.0 pts',
                    l: 'Accuracy removed by fixing the split' },
                  { v: m?.conformal?.accuracy_on_confident_calls != null ? `${(m.conformal.accuracy_on_confident_calls * 100).toFixed(1)}%` : '99.7%',
                    l: 'Accuracy when it commits' },
                ].map((k) => (
                  <div key={k.l} style={{ padding: '14px 16px', borderRadius: 12,
                                          border: '1px solid var(--line-soft)' }}>
                    <div className="mono" style={{ fontSize: 21 }}>{k.v}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 5 }}>{k.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- cta ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="panel reveal" style={{
            padding: 'clamp(30px, 5vw, 66px)', textAlign: 'center',
            background: 'linear-gradient(140deg, rgba(124,92,255,.14), rgba(34,211,238,.07))',
          }}>
            <h2 className="display" style={{ fontSize: 'clamp(30px, 4.6vw, 56px)' }}>
              Point it at your own data.
            </h2>
            <p className="lede" style={{ margin: '18px auto 28px' }}>
              Upload a CSV with a binary outcome column. The platform profiles it,
              trains all six models, benchmarks them and tells you whether the
              quantum half was worth it.
            </p>
            <Link className="btn btn-primary" to="/studio">Open the studio</Link>
          </div>
        </div>
      </section>

      {/* ---------------- medical disclaimer & limitations ---------------- */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="wrap">
          <div className="panel reveal" style={{
            padding: '28px 32px',
            background: '#F8FAFC',
            border: '1px solid var(--line)',
            borderLeft: '4px solid var(--amber)',
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>⚠️</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' }}>
                Research Demonstration Platform · Medical Disclaimer &amp; Quantum Architecture Notice
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', margin: '0 0 10px', lineHeight: 1.6 }}>
                <strong>Non-Diagnostic Notice:</strong> AAROGYAM is an exploratory research and educational proof-of-concept developed for the VTU Qiskit Fall Fest. All patient data, clinical records, and screening sessions presented are <strong>strictly synthetic</strong> and must not be used as clinical diagnostic advice or primary medical guidance. Always consult licensed healthcare professionals for medical conditions.
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', margin: 0, lineHeight: 1.6 }}>
                <strong>Quantum Simulation Fidelity:</strong> All quantum algorithms (ZZFeatureMap encoding, quantum kernel matrices, and variational circuits) are executed via CPU-based statevector mathematical simulation with double-precision linear algebra, not on physical cryogenic NISQ hardware. No quantum computational supremacy or commercial advantage is claimed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-canvas {
          position: absolute;
          inset: 0 0 0 46%;
          z-index: 0;
          mask-image: linear-gradient(90deg, transparent, #000 22%, #000 82%, transparent),
                      linear-gradient(180deg, transparent, #000 15%);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 22%, #000 82%, transparent),
                              linear-gradient(180deg, transparent, #000 15%);
          mask-composite: intersect;
          -webkit-mask-composite: source-in;
        }
        .helix-hero { width: 100%; height: 100svh; }
        .hero-copy { max-width: min(1240px, calc(100% - 48px)); }
        @media (max-width: 1080px) { .hero-canvas { inset: 0 0 0 40%; opacity: .8; } }
        @media (max-width: 820px) {
          .hero-canvas {
            inset: 0; opacity: .28;
            mask-image: radial-gradient(60% 50% at 70% 30%, #000, transparent 75%);
            -webkit-mask-image: radial-gradient(60% 50% at 70% 30%, #000, transparent 75%);
          }
        }
      `}</style>
    </div>
  );
}
