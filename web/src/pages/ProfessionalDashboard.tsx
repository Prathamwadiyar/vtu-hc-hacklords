import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { stage2, type StoredScreeningRecord } from '../lib/api';
import { DonutChart, GroupedBars } from '../components/charts';
import { useReveal } from '../lib/motion';

const RISK_BADGE: Record<string, { color: string; border: string; bg: string }> = {
  'Very low': { color: '#16A34A', border: 'rgba(22,163,74,.3)', bg: '#F0FDF4' },
  Low: { color: '#10B981', border: 'rgba(16,185,129,.3)', bg: '#ECFDF5' },
  Moderate: { color: '#D97706', border: 'rgba(217,119,6,.3)', bg: '#FFFBEB' },
  High: { color: '#F97316', border: 'rgba(249,115,22,.3)', bg: '#FFF7ED' },
  'Very high': { color: '#DC2626', border: 'rgba(220,38,38,.3)', bg: '#FEF2F2' },
};

export default function ProfessionalDashboard() {
  const scope = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [records, setRecords] = useState<StoredScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<StoredScreeningRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    setLoading(true);
    stage2.professionalRecords({
      condition: filterCondition !== 'all' ? filterCondition : undefined,
      risk_tier: filterRisk !== 'all' ? filterRisk : undefined,
      search: searchTerm.trim() || undefined,
      limit: 100,
    })
      .then((res) => {
        if (!active) return;
        setRecords(res.records);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.warn('Professional records load failed', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [filterCondition, filterRisk, searchTerm]);

  useReveal(scope, [records, loading]);

  // Aggregate statistics across the cohort
  const totalSyntheticPatients = useMemo(() => {
    const uniqueIds = new Set(records.map((r) => r.patient_id));
    return uniqueIds.size;
  }, [records]);

  const highRiskCount = useMemo(() => {
    return records.filter((r) => r.risk_tier === 'High' || r.risk_tier === 'Very high').length;
  }, [records]);

  const heartCount = useMemo(() => {
    return records.filter((r) => r.condition.toLowerCase().includes('heart')).length;
  }, [records]);

  const diabetesCount = useMemo(() => {
    return records.filter((r) => r.condition.toLowerCase().includes('diabetes')).length;
  }, [records]);

  // Donut data for cohort risk tiers
  const cohortDonutData = useMemo(() => {
    const counts: Record<string, number> = {
      'Very low': 0, Low: 0, Moderate: 0, High: 0, 'Very high': 0,
    };
    records.forEach((r) => {
      if (counts[r.risk_tier] !== undefined) counts[r.risk_tier]++;
      else counts['Moderate']++;
    });
    return [
      { label: 'Very low', count: counts['Very low'], color: '#16A34A' },
      { label: 'Low', count: counts['Low'], color: '#10B981' },
      { label: 'Moderate', count: counts['Moderate'], color: '#D97706' },
      { label: 'High', count: counts['High'], color: '#F97316' },
      { label: 'Very high', count: counts['Very high'], color: '#DC2626' },
    ];
  }, [records]);

  // Grouped bar chart comparing Heart vs Diabetes risk profile
  const comparisonGroups = useMemo(() => {
    const heartRecords = records.filter((r) => r.condition.toLowerCase().includes('heart'));
    const diabRecords = records.filter((r) => r.condition.toLowerCase().includes('diabetes'));

    const hTotal = heartRecords.length || 1;
    const dTotal = diabRecords.length || 1;

    const tiers = ['Very low', 'Low', 'Moderate', 'High', 'Very high'];
    return tiers.map((tier) => {
      const hRate = heartRecords.filter((r) => r.risk_tier === tier).length / hTotal;
      const dRate = diabRecords.filter((r) => r.risk_tier === tier).length / dTotal;
      return {
        label: tier,
        values: [hRate, dRate],
      };
    });
  }, [records]);

  // Pagination slice
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, currentPage]);

  const totalPages = Math.ceil(records.length / pageSize) || 1;

  return (
    <div ref={scope} style={{ paddingTop: 104, paddingBottom: 80 }} className="page-enter">
      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'var(--violet-soft)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)' }} />
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--violet)', textTransform: 'uppercase' }}>
              Clinical Research Portal · VTU Qiskit Fall Fest
            </span>
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', color: 'var(--ink)' }}>
            Clinical Healthcare Analytics
          </h1>
          <p className="lede" style={{ marginTop: 8, fontSize: 15, color: 'var(--ink-dim)' }}>
            Monitor 30 deterministic synthetic patient cohorts, evaluate classical vs quantum ensemble agreements, and audit conformal confidence bounds.
          </p>
        </div>

        {/* Clinical Research Disclaimer */}
        <div className="banner banner--info" style={{ marginBottom: 28, background: 'var(--teal-soft)', borderColor: 'rgba(13,148,136,0.3)', color: '#0F766E' }}>
          <span style={{ fontSize: 18 }}>🛡</span>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <strong>Investigational Platform:</strong> All patient records shown here are <strong>synthetically generated demonstration cohorts</strong> evaluated through the genuine Stage 3 scikit-learn &amp; Qiskit pipelines. This interface demonstrates how clinicians inspect ensemble disagreement gaps, conformal non-conformity guarantees, and SHAP explainability.
          </div>
        </div>

        {/* Stats Summary Tiles */}
        <div className="grid cols-5 reveal" style={{ gap: 16, marginBottom: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Synthetic Patients
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--ink)' }}>
              {totalSyntheticPatients || 30}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Deterministic cohort
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Screenings
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--teal)' }}>
              {records.length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Evaluated &amp; persisted
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Higher-Risk Screenings
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--rose)' }}>
              {highRiskCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Prompting clinical audit
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Heart CAD Cases
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--ink)' }}>
              {heartCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Cleveland model
            </div>
          </div>

          <div className="stat-tile">
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Diabetes Cases
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 4, color: 'var(--ink)' }}>
              {diabetesCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 2 }}>
              Pima metabolic model
            </div>
          </div>
        </div>

        {/* Analytics Visualizations: Donut & Grouped Bar Chart */}
        <div className="grid cols-2 reveal" style={{ gap: 20, marginBottom: 32 }}>
          {/* Cohort Risk Distribution Donut */}
          <div className="panel" style={{ padding: 26, background: '#FFFFFF' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
                Cohort Risk Distribution
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0 }}>
                Breakdown of active synthetic demo screenings by risk category
              </p>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 230, width: '100%' }} />
            ) : records.length > 0 ? (
              <DonutChart
                data={cohortDonutData}
                size={190}
                strokeWidth={24}
                centerTitle="Screenings"
                centerValue={records.length}
              />
            ) : (
              <div style={{ height: 220, display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
                No records matching current filters.
              </div>
            )}
          </div>

          {/* Heart vs Diabetes Risk Profile Comparison */}
          <div className="panel" style={{ padding: 26, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
                  Heart CAD vs Diabetes Prevalence
                </h3>
                <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0 }}>
                  Normalized proportion across risk strata
                </p>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Rate %</span>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 230, width: '100%' }} />
            ) : records.length > 0 ? (
              <div>
                <GroupedBars
                  groups={comparisonGroups}
                  models={['Heart Disease', 'Diabetes']}
                  height={220}
                />
                <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--teal)' }} />
                    <span style={{ color: 'var(--ink-dim)' }}>Heart Disease</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--violet)' }} />
                    <span style={{ color: 'var(--ink-dim)' }}>Diabetes</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: 220, display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
                No records available for comparison.
              </div>
            )}
          </div>
        </div>

        {/* Search, Condition & Risk Filters */}
        <div className="panel reveal" style={{ marginBottom: 24, padding: 18, background: '#FFFFFF' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', gap: 14 }}>
            <div>
              <label htmlFor="search-patient" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 6 }}>
                Search Patient Cohort
              </label>
              <input
                id="search-patient"
                type="text"
                placeholder="Search by Patient ID, Name (e.g. Ramesh, Priya, Rajesh)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '9px 12px', fontSize: 13, background: '#F8FAFC' }}
              />
            </div>
            <div>
              <label htmlFor="filter-condition" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 6 }}>
                Condition Filter
              </label>
              <select
                id="filter-condition"
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                style={{ padding: '9px 12px', fontSize: 13, background: '#F8FAFC' }}
              >
                <option value="all">All Conditions</option>
                <option value="Heart Disease">Heart Disease</option>
                <option value="Diabetes">Diabetes</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-risk" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 6 }}>
                Risk Stratum
              </label>
              <select
                id="filter-risk"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                style={{ padding: '9px 12px', fontSize: 13, background: '#F8FAFC' }}
              >
                <option value="all">All Risk Tiers</option>
                <option value="Very low">Very Low</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Very high">Very High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Table with 30 Synthetic Cohort Profiles */}
        <div className="panel reveal" style={{ marginBottom: 32, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)', margin: '0 0 4px', color: 'var(--ink)' }}>
                Synthetic Cohort Screening Records ({records.length} Found)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0 }}>
                Showing page {currentPage} of {totalPages} ({pageSize} records per page)
              </p>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--teal)' }}>
              Click row to inspect clinical case details
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 24 }}>
              <div className="skeleton" style={{ height: 32, width: '100%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 32, width: '100%' }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Patient Name &amp; ID</th>
                    <th>Age / Sex</th>
                    <th>Condition</th>
                    <th>Screening Date</th>
                    <th>Risk Category</th>
                    <th>Risk Probability</th>
                    <th>Classical vs Quantum</th>
                    <th>Conformal Calibration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((r) => {
                    const badge = RISK_BADGE[r.risk_tier] ?? RISK_BADGE.Low;
                    const cMean = (
                      ((r.model_consensus?.logistic_regression ?? 0) +
                       (r.model_consensus?.random_forest ?? 0) +
                       (r.model_consensus?.svm ?? 0)) / 3
                    );
                    const qMean = (
                      ((r.model_consensus?.qsvm ?? 0) +
                       (r.model_consensus?.vqc ?? 0) +
                       (r.model_consensus?.qnn ?? 0)) / 3
                    );
                    const disagreement = Math.abs(cMean - qMean);

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRecord(r)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--teal)' }}>
                          {r.id}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.patient_name ?? r.patient_id}</div>
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{r.patient_id}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {r.patient_age ? `${r.patient_age}y · ${r.patient_gender}` : '—'}
                        </td>
                        <td style={{ fontSize: 12.5, fontWeight: 500 }}>{r.condition}</td>
                        <td className="mono" style={{ fontSize: 11.5 }}>
                          {r.created_at ? r.created_at.split('T')[0] : 'Recent'}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 9px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontFamily: 'var(--mono)',
                              fontWeight: 600,
                              border: `1px solid ${badge.border}`,
                              color: badge.color,
                              background: badge.bg,
                            }}
                          >
                            {r.risk_tier}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
                          {(r.probability * 100).toFixed(1)}%
                        </td>
                        <td>
                          <div style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>
                            {(cMean * 100).toFixed(0)}%C / {(qMean * 100).toFixed(0)}%Q
                            {disagreement > 0.15 && (
                              <span style={{ color: 'var(--amber)', marginLeft: 6, fontWeight: 600 }}>⚠ gap</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`chip ${r.conformal_status === 'committed' ? 'chip-benign' : 'chip-warn'}`}
                            style={{ fontSize: 9.5 }}
                          >
                            {r.conformal_status === 'committed' ? `Committed (${r.conformal_confidence ?? 95}%)` : 'Abstained'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn"
                            style={{ fontSize: 11, padding: '4px 10px', background: '#F8FAFC' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(r);
                            }}
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{ padding: '5px 12px', fontSize: 12 }}
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    className="btn"
                    onClick={() => setCurrentPage(pg)}
                    style={{
                      padding: '5px 11px',
                      fontSize: 12,
                      background: currentPage === pg ? 'var(--teal)' : '#FFFFFF',
                      color: currentPage === pg ? '#FFFFFF' : 'var(--ink)',
                      borderColor: currentPage === pg ? 'var(--teal)' : 'var(--line)',
                    }}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  className="btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{ padding: '5px 12px', fontSize: 12 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Case Inspection Dialog */}
        {selectedRecord && (
          <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 660, background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div>
                  <span className="eyebrow" style={{ margin: 0, color: 'var(--teal)' }}>Subject Case Inspection</span>
                  <h2 className="display" style={{ fontSize: 26, margin: '4px 0 0', color: 'var(--ink)' }}>
                    {selectedRecord.patient_name ?? selectedRecord.patient_id}
                  </h2>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => setSelectedRecord(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <span className="chip" style={{ background: '#F8FAFC' }}>Record: {selectedRecord.id}</span>
                <span className="chip" style={{ background: '#F8FAFC' }}>ID: {selectedRecord.patient_id}</span>
                <span className="chip chip-warn">SYNTHETIC DEMO PATIENT</span>
              </div>

              <div style={{ display: 'grid', gap: 14, marginBottom: 24, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                {/* Clinical Biomarkers */}
                <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: '#F8FAFC', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '.08em', marginBottom: 8 }}>
                    Input Parameters ({selectedRecord.condition})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, fontSize: 12 }}>
                    {Object.entries(selectedRecord.input_parameters).map(([k, v]) => (
                      <div key={k} style={{ padding: '6px 8px', background: '#FFFFFF', borderRadius: 6, border: '1px solid var(--line-soft)' }}>
                        <div style={{ color: 'var(--ink-faint)', fontSize: 10, textTransform: 'uppercase' }}>{k}</div>
                        <div className="mono" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 13, marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Classical vs Quantum Sub-ensembles */}
                <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: '#F8FAFC', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '.08em', marginBottom: 8 }}>
                    Ensemble Disagreement Analysis
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--teal)' }}>Classical Models:</div>
                      <div className="mono" style={{ fontSize: 13, color: 'var(--ink)', marginTop: 6, lineHeight: 1.6 }}>
                        Logistic Reg: {((selectedRecord.model_consensus?.logistic_regression ?? 0) * 100).toFixed(1)}%<br />
                        Random Forest: {((selectedRecord.model_consensus?.random_forest ?? 0) * 100).toFixed(1)}%<br />
                        Linear SVM: {((selectedRecord.model_consensus?.svm ?? 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--violet)' }}>Quantum Models:</div>
                      <div className="mono" style={{ fontSize: 13, color: 'var(--ink)', marginTop: 6, lineHeight: 1.6 }}>
                        QSVM (Fidelity): {((selectedRecord.model_consensus?.qsvm ?? 0) * 100).toFixed(1)}%<br />
                        VQC (Statevector): {((selectedRecord.model_consensus?.vqc ?? 0) * 100).toFixed(1)}%<br />
                        Data Re-upload QNN: {((selectedRecord.model_consensus?.qnn ?? 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* SHAP explanation in modal */}
                {selectedRecord.explanation && selectedRecord.explanation.length > 0 && (
                  <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: '#F8FAFC', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '.08em', marginBottom: 8 }}>
                      Explainability Factors (SHAP Values)
                    </div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {selectedRecord.explanation.map((f) => {
                        const isRisk = f.direction === 'increases_risk';
                        return (
                          <div key={f.feature} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: isRisk ? '#FEF2F2' : '#F0FDF4', fontSize: 12, border: `1px solid ${isRisk ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'}` }}>
                            <span style={{ fontWeight: 600, color: isRisk ? 'var(--rose)' : 'var(--emerald)' }}>{f.feature} (value: {f.value})</span>
                            <span className="mono" style={{ fontWeight: 700 }}>{f.contribution > 0 ? `+${f.contribution.toFixed(3)}` : f.contribution.toFixed(3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conformal Calibration */}
                <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: '#F8FAFC', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '.08em', marginBottom: 4 }}>
                    Conformal Calibration Verdict
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink)' }}>
                    Status: <strong>{selectedRecord.conformal_status}</strong> ({selectedRecord.conformal_confidence ?? 95}% target non-conformity coverage)
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-dim)', margin: '6px 0 0' }}>
                    Ensures finite-sample distribution-free reliability. When uncertainty exceeds error tolerance, the model abstains rather than making an uncalibrated guess.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/detect?dataset=${selectedRecord.dataset_id}`}
                  className="btn btn-teal"
                  style={{ fontSize: 12.5 }}
                >
                  Inspect in Detect Sandbox →
                </Link>
                <button
                  type="button"
                  className="btn"
                  style={{ fontSize: 12.5 }}
                  onClick={() => setSelectedRecord(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
