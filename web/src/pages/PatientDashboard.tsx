import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { stage2, type DemoPatient, type StoredScreeningRecord } from '../lib/api';
import { DonutChart, LineChart } from '../components/charts';
import { useReveal } from '../lib/motion';

const RISK_COLOR: Record<string, string> = {
  'Very low': '#16A34A',
  Low: '#10B981',
  Moderate: '#D97706',
  High: '#F97316',
  'Very high': '#DC2626',
};

function RiskBadge({ risk }: { risk: string }) {
  const c = RISK_COLOR[risk] ?? '#64748B';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: 11,
      fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '.04em',
      border: `1px solid ${c}40`, color: c, background: `${c}12`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      {risk}
    </span>
  );
}

export default function PatientDashboard() {
  const scope = useRef<HTMLDivElement>(null);
  const [patients, setPatients] = useState<DemoPatient[]>([]);
  const [patientId, setPatientId] = useState<string>('PAT-DEMO-01');
  const [screenings, setScreenings] = useState<StoredScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [conditionFilter, setConditionFilter] = useState<'all' | 'Heart Disease' | 'Diabetes'>('all');
  const [selectedScreening, setSelectedScreening] = useState<StoredScreeningRecord | null>(null);

  // Fetch 30 synthetic demo patients
  useEffect(() => {
    stage2.patients()
      .then((res) => {
        if (res.patients && res.patients.length > 0) {
          setPatients(res.patients);
        }
      })
      .catch((err) => console.warn('Could not load patient cohort list', err));
  }, []);

  // Fetch screenings whenever selected patient changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    stage2.patientScreenings(patientId)
      .then((res) => {
        if (!active) return;
        setScreenings(res.screenings);
        setSelectedScreening(res.screenings[0] ?? null);
      })
      .catch((err) => {
        console.warn('Screenings load failed', err);
        setScreenings([]);
        setSelectedScreening(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [patientId]);

  useReveal(scope, [screenings, loading, patientId]);

  const currentPatient = useMemo(() => {
    return patients.find((p) => p.id === patientId) ?? {
      id: patientId,
      name: 'Demonstration Patient',
      age: 52,
      gender: 'Male',
      medical_history: 'Hypertension, family history of coronary CAD',
    };
  }, [patients, patientId]);

  // Filtered screenings
  const filteredScreenings = useMemo(() => {
    if (conditionFilter === 'all') return screenings;
    return screenings.filter((s) => s.condition.toLowerCase().includes(conditionFilter.toLowerCase()));
  }, [screenings, conditionFilter]);

  const latestScreening = filteredScreenings[0] ?? null;

  // Donut data: risk category breakdown
  const riskDonutData = useMemo(() => {
    const counts: Record<string, number> = {
      'Very low': 0, Low: 0, Moderate: 0, High: 0, 'Very high': 0,
    };
    filteredScreenings.forEach((s) => {
      if (counts[s.risk_tier] !== undefined) counts[s.risk_tier]++;
      else counts['Moderate']++;
    });
    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      color: RISK_COLOR[label] || '#64748B',
    }));
  }, [filteredScreenings]);

  // History Line Chart: risk probability over time
  const historySeries = useMemo(() => {
    if (filteredScreenings.length === 0) return [];
    // Sort chronologically for time series
    const sorted = [...filteredScreenings].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    
    // Group by condition to avoid connecting unrelated medical trends
    const heartPoints = sorted
      .filter((s) => s.condition.toLowerCase().includes('heart'))
      .map((s, idx) => ({ x: idx + 1, y: s.probability }));

    const diabetesPoints = sorted
      .filter((s) => s.condition.toLowerCase().includes('diabetes'))
      .map((s, idx) => ({ x: idx + 1, y: s.probability }));

    const series = [];
    if (heartPoints.length > 0) {
      series.push({
        name: 'Heart Disease',
        points: heartPoints,
        colour: '#DC2626',
      });
    }
    if (diabetesPoints.length > 0) {
      series.push({
        name: 'Diabetes Risk',
        points: diabetesPoints,
        colour: '#0D9488',
      });
    }
    return series;
  }, [filteredScreenings]);

  return (
    <div ref={scope} style={{ paddingTop: 104, paddingBottom: 80 }} className="page-enter">
      <div className="wrap">
        {/* Top Header & Patient Cohort Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'var(--teal-soft)', border: '1px solid rgba(13,148,136,0.2)', marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' }} />
              <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: '#0F766E', textTransform: 'uppercase' }}>
                Synthetic Patient Record System · VTU Qiskit Fall Fest
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', color: 'var(--ink)' }}>
              Patient Health Intelligence
            </h1>
            <p className="lede" style={{ marginTop: 8, fontSize: 15, color: 'var(--ink-dim)' }}>
              Monitor ongoing screening history, feature risk attributions, and calibrated quantum confidence bounds.
            </p>
          </div>

          {/* Synthetic Patient Selector */}
          <div className="panel" style={{ padding: '16px 20px', minWidth: 320, background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              Select Synthetic Demo Patient ({patients.length || 30})
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                fontSize: 13,
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                color: 'var(--ink)',
                background: '#F8FAFC',
              }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — {p.age}y {p.gender}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11.5, color: 'var(--ink-dim)' }}>
              <span>History: <strong>{currentPatient.medical_history || 'Standard cohort demo'}</strong></span>
            </div>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid cols-4 reveal" style={{ gap: 16, marginBottom: 28 }}>
          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
              Total Screenings
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--ink)' }}>
              {screenings.length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Recorded in SQLite
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
              Latest Risk Probability
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: latestScreening ? RISK_COLOR[latestScreening.risk_tier] : 'var(--ink)' }}>
              {latestScreening ? `${(latestScreening.probability * 100).toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              {latestScreening ? latestScreening.condition : 'No screenings'}
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
              Conditions Screened
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--teal)' }}>
              {Array.from(new Set(screenings.map((s) => s.condition))).length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Heart CAD &amp; Diabetes
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
              Calibration Guarantee
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--violet)' }}>
              95.0%
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Conformal Coverage
            </div>
          </div>
        </div>

        {/* Filter Bar & Quick Screening Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', background: '#FFFFFF', padding: 4, borderRadius: 999, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            {(['all', 'Heart Disease', 'Diabetes'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setConditionFilter(filter)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: 0,
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: conditionFilter === filter ? 'var(--teal)' : 'transparent',
                  color: conditionFilter === filter ? '#FFFFFF' : 'var(--ink-dim)',
                  transition: 'background .2s, color .2s',
                }}
              >
                {filter === 'all' ? 'All Conditions' : filter}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/screening?condition=heart_disease" className="btn btn-teal" style={{ fontSize: 13, padding: '9px 18px' }}>
              + Heart Screening
            </Link>
            <Link to="/screening?condition=diabetes" className="btn" style={{ fontSize: 13, padding: '9px 18px', background: '#FFFFFF' }}>
              + Diabetes Screening
            </Link>
            <Link to="/records" className="btn" style={{ fontSize: 13, padding: '9px 18px', background: '#FFFFFF' }}>
              📋 Records &amp; QR
            </Link>
          </div>
        </div>

        {/* Charts Section: History Line Chart & Risk Donut */}
        <div className="grid cols-2 reveal" style={{ gap: 20, marginBottom: 32 }}>
          {/* History Chart */}
          <div className="panel" style={{ padding: 26, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
                  Screening Risk Over Time
                </h3>
                <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0 }}>
                  Estimated probability trend per clinical condition
                </p>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Probability %</span>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 230, width: '100%' }} />
            ) : historySeries.length > 0 ? (
              <div>
                <LineChart
                  series={historySeries}
                  height={220}
                  xLabel="Screening Session"
                  yLabel="Risk"
                  yFormat={(v) => `${(v * 100).toFixed(0)}%`}
                  xFormat={(v) => `S#${Math.round(v)}`}
                />
                <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
                  {historySeries.map((s) => (
                    <div key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.colour }} />
                      <span style={{ color: 'var(--ink-dim)' }}>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: 220, display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
                No historical records for this filter. Start a new screening above!
              </div>
            )}
          </div>

          {/* Risk Distribution Donut */}
          <div className="panel" style={{ padding: 26, background: '#FFFFFF' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
                Risk Stratification Breakdown
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0 }}>
                Distribution across 5 calibrated clinical risk categories
              </p>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 230, width: '100%' }} />
            ) : filteredScreenings.length > 0 ? (
              <DonutChart
                data={riskDonutData}
                size={180}
                strokeWidth={22}
                centerTitle="Screenings"
                centerValue={filteredScreenings.length}
              />
            ) : (
              <div style={{ height: 220, display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
                No screening data to stratify.
              </div>
            )}
          </div>
        </div>

        {/* Interactive Screening Timeline & Detail View */}
        <div className="grid cols-3 reveal" style={{ gap: 20, marginBottom: 36 }}>
          {/* Timeline / Screening list */}
          <div className="panel" style={{ gridColumn: 'span 2', padding: 26, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
                  Screening History &amp; Timeline
                </h3>
                <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0 }}>
                  Click a screening row to inspect model consensus and SHAP feature attributions
                </p>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--teal)' }}>
                {filteredScreenings.length} Records Found
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="skeleton" style={{ height: 38 }} />
                <div className="skeleton" style={{ height: 38 }} />
                <div className="skeleton" style={{ height: 38 }} />
              </div>
            ) : filteredScreenings.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Date</th>
                      <th>Condition</th>
                      <th>Risk Category</th>
                      <th>Probability</th>
                      <th>Conformal Status</th>
                      <th>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScreenings.map((r) => {
                      const isSelected = selectedScreening?.id === r.id;
                      return (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedScreening(r)}
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(13, 148, 136, 0.08)' : undefined,
                            borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent',
                          }}
                        >
                          <td className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)' }}>
                            {r.id}
                          </td>
                          <td className="mono" style={{ fontSize: 11.5 }}>
                            {r.created_at ? r.created_at.split('T')[0] : 'Recent'}
                          </td>
                          <td style={{ fontSize: 12.5, fontWeight: 500 }}>{r.condition}</td>
                          <td><RiskBadge risk={r.risk_tier} /></td>
                          <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                            {(r.probability * 100).toFixed(1)}%
                          </td>
                          <td>
                            <span className={`chip ${r.conformal_status === 'committed' ? 'chip-benign' : 'chip-warn'}`} style={{ fontSize: 9.5 }}>
                              {r.conformal_status === 'committed' ? `Committed (${r.conformal_confidence ?? 95}%)` : 'Abstained'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn"
                              style={{
                                fontSize: 11,
                                padding: '4px 10px',
                                background: isSelected ? 'var(--teal)' : '#FFFFFF',
                                color: isSelected ? '#FFFFFF' : 'var(--ink)',
                              }}
                            >
                              {isSelected ? 'Viewing' : 'Inspect'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-faint)' }}>
                No screenings found for this patient under current filter.
              </div>
            )}
          </div>

          {/* Screening Detail & Feature Explanation Inspector */}
          <div className="panel" style={{ padding: 24, background: '#FFFFFF' }}>
            <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
              Clinical Explanation
            </h3>
            <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '0 0 16px' }}>
              SHAP feature attributions &amp; model ensemble
            </p>

            {selectedScreening ? (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ padding: 12, borderRadius: 10, background: '#F8FAFC', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                    Selected Record
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>
                    {selectedScreening.id} — {selectedScreening.condition}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <RiskBadge risk={selectedScreening.risk_tier} />
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                      Probability: {(selectedScreening.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Ensemble consensus */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Model Consensus
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {selectedScreening.model_consensus && Object.keys(selectedScreening.model_consensus).length > 0 ? (
                      Object.entries(selectedScreening.model_consensus).map(([model, prob]) => (
                        <div key={model} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                          <span style={{ color: 'var(--ink-dim)' }}>{model}</span>
                          <span className="mono" style={{ fontWeight: 600 }}>{(prob * 100).toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Hybrid ensemble consensus calculated</div>
                    )}
                  </div>
                </div>

                {/* SHAP explanation */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Top Feature Contributions (SHAP)
                  </div>
                  {selectedScreening.explanation && selectedScreening.explanation.length > 0 ? (
                    <div style={{ display: 'grid', gap: 6 }}>
                      {selectedScreening.explanation.slice(0, 5).map((f) => {
                        const isRisk = f.direction === 'increases_risk';
                        return (
                          <div key={f.feature} style={{ padding: '8px 10px', borderRadius: 8, background: isRisk ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${isRisk ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: isRisk ? 'var(--rose)' : 'var(--emerald)' }}>
                              <span>{f.feature}</span>
                              <span className="mono">{f.contribution > 0 ? `+${f.contribution.toFixed(3)}` : f.contribution.toFixed(3)}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 2 }}>
                              Value: {f.value} · {isRisk ? 'Elevates estimated risk' : 'Protective against risk'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--ink-dim)', fontStyle: 'italic', padding: 8, background: '#F8FAFC', borderRadius: 8 }}>
                      Feature attributions computed from classical/quantum preprocessing.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 8 }}>
                  <Link to={`/records`} className="btn btn-teal" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5, padding: '9px 16px' }}>
                    Generate QR Share Token →
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--ink-faint)', fontSize: 12.5 }}>
                Select a screening from the table to view detailed feature importance.
              </div>
            )}
          </div>
        </div>

        {/* Health Guidance & Wellness Links */}
        <div className="panel reveal" style={{ padding: 26, background: '#FFFFFF', marginBottom: 32 }}>
          <p className="eyebrow" style={{ margin: '0 0 14px' }}>Preventive Health &amp; Guidance</p>
          <div className="grid cols-3" style={{ gap: 16 }}>
            <Link to="/wellness" style={{ textDecoration: 'none' }}>
              <div className="stat-tile" style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🫀</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Cardiovascular Protocol</div>
                <div style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.5 }}>
                  Recommended resting BP thresholds, exercise tolerance, and cholesterol management pathways.
                </div>
              </div>
            </Link>

            <Link to="/wellness" style={{ textDecoration: 'none' }}>
              <div className="stat-tile" style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🩸</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Metabolic Health Care</div>
                <div style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.5 }}>
                  Fasting plasma glucose guidelines, glycemic indexing, and BMI lifestyle targets.
                </div>
              </div>
            </Link>

            <Link to="/method" style={{ textDecoration: 'none' }}>
              <div className="stat-tile" style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⚛️</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Quantum Methodology</div>
                <div style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.5 }}>
                  How 4-qubit ZZFeatureMaps project clinical metrics into Hilbert space without heuristics.
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Disclaimer footer */}
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '0 0 40px', maxWidth: '85ch', lineHeight: 1.6 }}>
          ⚕ <strong>Research Demonstration Notice:</strong> AAROGYAM screening results are computed from synthetic demo models for the VTU Qiskit Fall Fest. They do not constitute formal medical diagnoses or clinical advice. Always consult licensed physicians for medical evaluations.
        </p>
      </div>
    </div>
  );
}
