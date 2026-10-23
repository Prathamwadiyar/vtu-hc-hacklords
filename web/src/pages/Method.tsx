import { useEffect, useRef, useState } from 'react';
import { api, platform, type PlatformOverview } from '../lib/api';
import { useReveal } from '../lib/motion';

function Section({ n, title, badge, children }: {
  n: string; title: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <section className="reveal method-section" style={{
      display: 'grid', gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)',
      gap: 48, padding: '48px 0', borderTop: '1px solid var(--line-soft)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{
            fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: 'var(--violet-soft)', color: 'var(--violet)',
          }}>
            {n}
          </span>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
              background: 'var(--teal-soft)', color: 'var(--teal)', textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {badge}
            </span>
          )}
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28,
                     margin: '14px 0 0', lineHeight: 1.2, color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-dim)', maxWidth: '72ch', lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

const Formula = ({ formula, caption }: { formula: string; caption?: string }) => (
  <div style={{
    margin: '20px 0', borderRadius: 14, overflow: 'hidden',
    border: '1px solid rgba(124, 58, 237, 0.25)',
    background: 'linear-gradient(135deg, rgba(237, 233, 254, 0.45) 0%, rgba(204, 251, 241, 0.35) 100%)',
    boxShadow: '0 4px 15px -2px rgba(124, 58, 237, 0.06)',
  }}>
    <div className="mono" style={{
      padding: '16px 20px', fontSize: 13, color: 'var(--ink)',
      fontWeight: 600, overflowX: 'auto', whiteSpace: 'pre',
      background: '#FFFFFF', borderBottom: caption ? '1px solid var(--line-soft)' : 'none',
    }}>
      {formula}
    </div>
    {caption && (
      <div style={{ padding: '8px 20px', fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 500 }}>
        {caption}
      </div>
    )}
  </div>
);

const DELIVERABLES: [string, string, string, string][] = [
  ['01 · Pre-processing & Feature Selection',
   'ml/pipeline.py',
   'Constant-column removal, median imputation, tail clipping for noise, standardisation, mutual-information feature selection, and PCA.',
   '#0D9488'],
  ['02 · Hybrid Quantum-Classical Encoding',
   'ml/pipeline.py · ml/quantum.py',
   'Reduces tabular features onto N qubits via PCA, rescales to [0, π], and prepares an entangled register using batched analytical ZZFeatureMaps.',
   '#7C3AED'],
  ['03 · 6-Model Benchmarking Engine',
   'ml/quantum.py',
   'Evaluates 3 classical baselines (Logistic, RF, RBF SVM) against 3 quantum models (QSVM fidelity kernel, Variational VQC, and Data Re-uploading QNN).',
   '#0284C7'],
  ['04 · Calibrated Decision Support',
   'backend/platform_core.py',
   'A five-tier clinical risk ladder, operating point tuning for high sensitivity screening vs high specificity confirmation, and split conformal prediction.',
   '#D97706'],
  ['05 · Dataset Studio & Local Inference',
   'backend/app.py · web/',
   'In-browser CSV upload, instant profiling, custom column mapping, and client-side simulation fallback for offline hackathon demonstrations.',
   '#16A34A'],
];

export default function Method() {
  const scope = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<any>(null);
  const [ov, setOv] = useState<PlatformOverview | null>(null);

  useEffect(() => {
    api.metrics().then(setM).catch(() => {});
    platform.overview().then(setOv).catch(() => {});
  }, []);
  useReveal(scope, [m, ov]);

  return (
    <div ref={scope} style={{ paddingTop: 104, paddingBottom: 80, background: 'var(--bg)' }}>
      <div className="wrap">
        
        {/* Header Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
          border: '1px solid var(--line)', borderRadius: 24, padding: 'clamp(32px, 5vw, 56px)',
          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)', marginBottom: 40,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 240, height: 240,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: 100, width: 260, height: 260,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'var(--teal-soft)', border: '1px solid rgba(13, 148, 136, 0.25)', marginBottom: 18 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--teal)' }}>
              Scientific Architecture & Rigour
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.4vw, 56px)', lineHeight: 1.15, maxWidth: '20ch', margin: '0 0 16px', color: 'var(--ink)' }}>
            How AAROGYAM works, where quantum excels, and its rigorous boundaries.
          </h1>

          <p style={{ fontSize: 16, color: 'var(--ink-dim)', maxWidth: '64ch', margin: 0, lineHeight: 1.7 }}>
            A comprehensive overview of our multi-modal quantum preprocessing pipeline, fidelity kernel mathematics, conformal guarantees, and empirical benchmark results across five clinical domains.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 16, marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--line-soft)',
          }}>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 14, border: '1px solid var(--line-soft)' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>5 Cohorts</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>Genomics, Echo, Speech, Blood</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 14, border: '1px solid var(--line-soft)' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--violet)' }}>6 Models</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>3 Classical vs 3 Quantum</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 14, border: '1px solid var(--line-soft)' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>ZZFeatureMap</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>Full Pairwise Entanglement</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 14, border: '1px solid var(--line-soft)' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--emerald)' }}>Conformal Set</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>Guaranteed Abstention Option</div>
            </div>
          </div>
        </div>

        {/* Section 01 */}
        <Section n="01" title="The Problem Statement" badge="Foundation">
          <p>
            AAROGYAM is a quantum-assisted early health risk intelligence platform developed for the VTU Qiskit Fall Fest.
            Rather than training an isolated single-disease demo, our objective was to design a generalised biomedical learning framework
            that can ingest diverse clinical modalities—genomics, cardiac hemodynamic measurements, voice tremors, and laboratory panels—under
            a unified preprocessing and quantum embedding pipeline.
          </p>
          <p>
            By combining classical information theory (mutual information feature selection and PCA dimension reduction) with
            parameterised quantum circuits in IBM Qiskit, the system compares where quantum kernel embeddings offer separation advantages
            and where classical gradient ensembles remain superior.
          </p>

          <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
            {DELIVERABLES.map(([title, where, what, color]) => (
              <div key={title} style={{
                padding: '16px 20px', borderRadius: 14,
                background: '#FFFFFF', border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: `4px solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 600 }}>{title}</strong>
                  <span className="mono" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--panel-strong)', color: 'var(--ink-faint)' }}>
                    {where}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.6 }}>{what}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 02 */}
        <Section n="02" title="Benchmark Cohorts" badge="Data Engineering">
          <p>
            The platform is validated against five real-world biomedical benchmarks, each preserved in its native clinical form—including
            missing values, high collinearity, and skewness—to test pipeline robustness in authentic diagnostic environments.
          </p>

          <div style={{
            background: '#FFFFFF', borderRadius: 16, border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginTop: 18,
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
                <thead>
                  <tr style={{ background: 'var(--panel-strong)' }}>
                    {['Cohort Dataset', 'Clinical Domain', 'Modality', 'Cohort (n)', 'Features', 'Missing'].map((h) => (
                      <th key={h} className="mono" style={{
                        textAlign: ['Cohort (n)', 'Features', 'Missing'].includes(h) ? 'right' : 'left',
                        padding: '12px 14px', fontSize: 10, letterSpacing: '.08em',
                        textTransform: 'uppercase', color: 'var(--ink-faint)',
                        fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(ov?.catalogue ?? [
                    { id: 'brca_clinvar', disease: 'BRCA1 / BRCA2 Pathogenicity', domain: 'Oncology / Genomics', modality: 'Molecular HGVS', n_samples: 20296, n_features: 22, missing_rate: 0.08 },
                    { id: 'heart_cleveland', disease: 'Coronary Artery Disease', domain: 'Cardiology', modality: 'Hemodynamic Tabular', n_samples: 303, n_features: 13, missing_rate: 0.015 },
                    { id: 'diabetes_pima', disease: 'Type 2 Diabetes Screening', domain: 'Endocrinology', modality: 'Clinical Labs', n_samples: 768, n_features: 8, missing_rate: 0.12 },
                    { id: 'parkinsons_telemonitoring', disease: 'Parkinsonian Dysphonia', domain: 'Neurology', modality: 'Acoustic Time Series', n_samples: 195, n_features: 22, missing_rate: 0.0 },
                    { id: 'breast_cancer_wisconsin', disease: 'Breast Tumor Malignancy', domain: 'Oncology', modality: 'Fine Needle Aspirate', n_samples: 569, n_features: 30, missing_rate: 0.0 },
                  ]).map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--ink)' }}>{d.disease}</td>
                      <td style={{ padding: '12px 14px' }}>{d.domain}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--panel-strong)', color: 'var(--ink-dim)' }}>
                          {d.modality}
                        </span>
                      </td>
                      <td className="mono" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>
                        {d.n_samples.toLocaleString()}
                      </td>
                      <td className="mono" style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {d.n_features}
                      </td>
                      <td className="mono" style={{
                        padding: '12px 14px', textAlign: 'right', fontWeight: 600,
                        color: d.missing_rate > 0 ? 'var(--amber)' : 'var(--emerald)' }}>
                        {(d.missing_rate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-faint)' }}>
            * Note: All splits follow a strict 60/20/20 stratified scheme. For genomics, split leakage is rigorously eliminated at the variant identity level.
          </p>
        </Section>

        {/* Section 03 */}
        <Section n="03" title="Quantum Encoding & Kernel Geometry" badge="Qiskit Core">
          <p>
            Input features are reduced and rescaled to [0, π], then transformed into a high-dimensional Hilbert space via a <strong>ZZFeatureMap</strong> with
            two repetition layers and all-to-all pairwise entangling phase gates.
          </p>
          <p>
            Standard quantum kernel computation requires evaluating O(n²) independent quantum circuits on physical hardware.
            Within our high-speed statevector simulation engine, we derive an exact analytical closed form for the Gram matrix:
          </p>

          <Formula
            formula={`K(x, y) = |⟨φ(x)|φ(y)⟩|²        →        K = |Ψ Ψ†|²`}
            caption="Gram matrix derivation: Each quantum statevector is prepared once in O(n), allowing single-pass matrix multiplication."
          />

          <p>
            Furthermore, each feature mapping layer after the initial Hadamard transformation is diagonal in the computational basis:
          </p>

          <Formula
            formula={`φ(x, b) = 2 Σᵢ xᵢbᵢ + 2 Σᵢ<ⱼ (π − xᵢ)(π − xⱼ)(bᵢ ⊕ bⱼ)`}
            caption="Batched analytical NumPy evaluation verified against Qiskit's Aer statevector simulator."
          />

          <p>
            This mathematical equivalence enables real-time kernel evaluation in the browser and interactive training in Dataset Studio without waiting minutes for circuit transpilation.
          </p>
        </Section>

        {/* Section 04 */}
        <Section n="04" title="Empirical Quantum Advantage" badge="Honest Findings">
          <p>
            A cornerstone of AAROGYAM is scientific honesty. Rather than claiming unwarranted quantum supremacy, we measure exactly where quantum algorithms outperform classical models and where they struggle.
          </p>
          <p>
            On our benchmark suite, the quantum models achieve competitive or superior accuracy on 2 of the 5 datasets, but lag behind on smaller sample regimes.
            The platform quantifies two critical diagnostic metrics:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '20px 0' }}>
            <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--line)', borderTop: '3px solid var(--violet)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Kernel-Target Alignment (KTA)</div>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', margin: '8px 0 0', lineHeight: 1.6 }}>
                Quantifies the degree to which the quantum feature space naturally correlates with ground truth clinical outcomes before training.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--line)', borderTop: '3px solid var(--teal)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Off-Diagonal Kernel Spread</div>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', margin: '8px 0 0', lineHeight: 1.6 }}>
                Monitors exponential concentration. When qubits increase without sufficient samples, the kernel collapses to an uninformative identity matrix.
              </p>
            </div>
          </div>

          <p>
            Diagnosing these properties before fitting prevents deploying overfitted or collapsed quantum models in sensitive healthcare settings.
          </p>
        </Section>

        {/* Section 05 */}
        <Section n="05" title="Calibrated Decision Support" badge="Safety Layer">
          <p>
            Raw probabilistic outputs are inadequate for medical decisions. AAROGYAM equips every patient screening with:
          </p>
          <ul style={{ paddingLeft: 20, margin: '12px 0 20px', lineHeight: 1.8 }}>
            <li><strong>Five-tier clinical risk ladder</strong> validated against empirical outcome rates in the validation partition.</li>
            <li><strong>Dynamic operating point sweep</strong> allowing practitioners to tune between high sensitivity (preventing false negatives in screening) and high specificity (preventing unnecessary biopsies).</li>
            <li><strong>Class-conditional split conformal prediction</strong> providing finite-sample distribution-free coverage guarantees:</li>
          </ul>

          <Formula
            formula={`q_c = Quantile( s_c , ⌈(n_c + 1)(1 − α)⌉ / n_c )`}
            caption="Conformal threshold calculation at confidence level (1 − α) with non-conformity score s_c."
          />

          <p>
            When a case lies in a region of high model ambiguity, the conformal predictor produces a multi-label set (e.g. <code>[Pathogenic, Benign]</code>) or an abstention, formally signaling to the clinician that human expert triage is required.
          </p>
        </Section>

        {/* Section 06 */}
        <Section n="06" title="Genomic Variant Curation" badge="ClinVar Pipeline">
          <p>
            In the BRCA1/BRCA2 cohort, the pipeline engineers domain-specific molecular biochemical descriptors: Grantham physicochemical distance, residue volume shifts, charge transitions, hydropathy differences, and protein domain mapping.
          </p>
          {m?.leakage && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(254, 243, 199, 0.4))',
              border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: 14, padding: '16px 20px', margin: '16px 0',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--amber)', fontSize: 14, marginBottom: 4 }}>
                ⚠️ Data Leakage Elimination
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                ClinVar entries frequently duplicate the same variant across different genome assemblies (GRCh37/GRCh38). Splitting randomly by row places the identical biological variant into both train and test partitions, artificially inflating accuracy by{' '}
                <strong>{m.leakage.inflation_points.toFixed(1)} percentage points</strong> across {m.leakage.variants_shared_between_train_and_test.toLocaleString()} shared rows.
                AAROGYAM enforces true <strong>variant-identity splitting</strong>.
              </p>
            </div>
          )}
          <p>
            Additionally, rather than discarding Variants of Uncertain Significance (VUS), our ensemble scores and prioritizes thousands of unresolved variants for clinical reclassification reviews.
          </p>
        </Section>

        {/* Section 07 */}
        <Section n="07" title="Platform Boundaries & Limitations" badge="Transparency">
          <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--line-soft)' }}>
              <strong style={{ color: 'var(--ink)', fontSize: 13.5 }}>1. Statevector Simulation:</strong>
              <span style={{ fontSize: 13, color: 'var(--ink-dim)', display: 'block', marginTop: 4 }}>
                All quantum operations are executed as noiseless statevector simulations. No claim of physical hardware quantum supremacy is made.
              </span>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--line-soft)' }}>
              <strong style={{ color: 'var(--ink)', fontSize: 13.5 }}>2. Classical Dimensionality Bottleneck:</strong>
              <span style={{ fontSize: 13, color: 'var(--ink-dim)', display: 'block', marginTop: 4 }}>
                Reducing tabular features to match qubit register limits (6 qubits) inherently truncates feature variance compared to 30-feature classical forests.
              </span>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--line-soft)' }}>
              <strong style={{ color: 'var(--ink)', fontSize: 13.5 }}>3. Research & Screening Context:</strong>
              <span style={{ fontSize: 13, color: 'var(--ink-dim)', display: 'block', marginTop: 4 }}>
                This platform is engineered as an intelligent screening and research exploration tool for VTU Qiskit Fall Fest, not as an autonomous diagnostic device.
              </span>
            </div>
          </div>
        </Section>

        {/* Section 08 - Scientific References */}
        <Section n="08" title="Academic References" badge="Literature">
          <ol className="mono" style={{ fontSize: 12, lineHeight: 2.1, paddingLeft: 18, color: 'var(--ink-dim)' }}>
            <li>Havlíček et al. Supervised learning with quantum-enhanced feature spaces. <em>Nature 567</em>, 2019.</li>
            <li>Schuld &amp; Killoran. Quantum machine learning in feature Hilbert spaces. <em>Phys. Rev. Lett. 122</em>, 2019.</li>
            <li>Pérez-Salinas et al. Data re-uploading for a universal quantum classifier. <em>Quantum 4</em>, 2020.</li>
            <li>Thanasilp et al. Exponential concentration in quantum kernel methods. <em>Nature Communications 15</em>, 2024.</li>
            <li>Huang et al. Power of data in quantum machine learning. <em>Nature Communications 12</em>, 2021.</li>
            <li>Vovk, Gammerman &amp; Shafer. <em>Algorithmic Learning in a Random World</em>. Springer, 2005.</li>
            <li>Angelopoulos &amp; Bates. A gentle introduction to conformal prediction. 2021.</li>
            <li>Lundberg &amp; Lee. A unified approach to interpreting model predictions. <em>NeurIPS</em>, 2017.</li>
            <li>Grantham. Amino acid difference formula to help explain protein evolution. <em>Science 185</em>, 1974.</li>
            <li>Detrano et al. International application of a new probability algorithm for CAD. <em>Am J Cardiol 64</em>, 1989.</li>
          </ol>
        </Section>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .method-section { grid-template-columns: minmax(0, 1fr) !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}

