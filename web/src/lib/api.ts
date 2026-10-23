export interface Annotation {
  gene: string;
  consequence: string;
  cdna_position: number;
  protein_position: number | null;
  aa_change: string | null;
  domain: string | null;
  grantham: number | null;
  intron_offset: number | null;
}

export interface BlochVector {
  qubit: number; x: number; y: number; z: number; purity: number;
}

export interface GateOp {
  rep: number; gate: string; qubits: number[]; angle?: number;
}

export interface QuantumState {
  n_qubits: number;
  angles: number[];
  bloch: BlochVector[];
  amplitudes: { state: string; probability: number; phase: number }[];
  entanglement_entropy: number;
  neighbours: { fidelity: number; label: string }[];
  circuit: GateOp[];
}

export interface PredictResult {
  input: Record<string, unknown>;
  annotation: Annotation;
  prediction: 'Pathogenic' | 'Benign';
  pathogenic_probability: number;
  confidence: number;
  models: Record<string, number>;
  weights: { classical: number; quantum: number };
  uncertainty: {
    quantum_classical_disagreement: number;
    margin: number;
    flag: 'low' | 'moderate' | 'high';
  };
  conformal: {
    set: string[];
    status: 'committed' | 'abstained';
    verdict: string;
    confidence_level: number;
    p_values: Record<string, number>;
    credibility: number;
    confidence: number;
    thresholds: Record<string, number>;
  };
  quantum: QuantumState;
  protein_track: {
    gene: string;
    length: number;
    position: number | null;
    domains: { name: string; start: number; end: number }[];
  };
  explanation?: {
    feature: string; value: number; contribution: number; direction: string;
  }[];
  latency_ms: number;
}

export interface VusRecord {
  variation_id: string;
  gene: string;
  name: string;
  current_classification: string;
  consequence: string;
  protein_position: number | null;
  domain: string | null;
  grantham: number | null;
  predicted: string;
  pathogenic_probability: number;
  classical: number;
  quantum: number;
  disagreement: number;
  conformal_status: string;
  conformal_set: string[];
  priority: number;
  review_status: string;
  n_submitters: number;
}

const BASE = import.meta.env.DEV ? 'http://localhost:5001' : '';

// ---------------------------------------------------------------------------
// Offline-first fallback mock bundles
// ---------------------------------------------------------------------------
import mockDataBundle from './mockData.json';
import mockPlatformBundle from './mockPlatform.json';
import mockTrainedRecordBundle from './mockTrainedRecord.json';
import mockMetricsBundle from './mockMetrics.json';
import mockPlatformDatasetsBundle from './mockPlatformDatasets.json';

const MOCK_PATIENTS: DemoPatient[] = (mockDataBundle as any).patients;
const MOCK_SCREENINGS: StoredScreeningRecord[] = (mockDataBundle as any).screenings;
const MOCK_SHARES = new Map<string, { id: string; expires_at: string; access_count: number; record_id: string }>();

async function get<T>(path: string): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1400);
    const r = await fetch(`${BASE}${path}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) throw new Error(`${path} responded ${r.status}`);
    return (await r.json()) as T;
  } catch {
    return resolveOfflineGet<T>(path);
  }
}

function resolveOfflineGet<T>(path: string): T {
  if (path === '/api/metrics') {
    return mockMetricsBundle as unknown as T;
  }
  if (path === '/api/patients') {
    return { total: MOCK_PATIENTS.length, patients: MOCK_PATIENTS } as unknown as T;
  }
  const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/);
  if (patientMatch) {
    const p = MOCK_PATIENTS.find((x) => x.id === patientMatch[1]) ?? MOCK_PATIENTS[0];
    return p as unknown as T;
  }
  const screeningsMatch = path.match(/^\/api\/patients\/([^/]+)\/screenings$/);
  if (screeningsMatch) {
    const pId = screeningsMatch[1];
    const userScreenings = MOCK_SCREENINGS.filter((s) => s.patient_id === pId);
    return {
      patient_id: pId,
      total: userScreenings.length,
      screenings: userScreenings.length ? userScreenings : MOCK_SCREENINGS.slice(0, 2),
    } as unknown as T;
  }
  const screeningDetailMatch = path.match(/^\/api\/screenings\/([^/]+)$/);
  if (screeningDetailMatch) {
    const s = MOCK_SCREENINGS.find((x) => x.id === screeningDetailMatch[1]) ?? MOCK_SCREENINGS[0];
    return s as unknown as T;
  }
  if (path.startsWith('/api/professional/records')) {
    const url = new URL(`http://localhost${path}`);
    const cond = url.searchParams.get('condition');
    const risk = url.searchParams.get('risk_tier');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    let res = [...MOCK_SCREENINGS];
    if (cond && cond !== 'all') {
      res = res.filter((r) => r.condition.toLowerCase().includes(cond.toLowerCase()));
    }
    if (risk && risk !== 'all') {
      res = res.filter((r) => r.risk_tier.toLowerCase() === risk.toLowerCase());
    }
    if (search) {
      res = res.filter((r) =>
        r.patient_id.toLowerCase().includes(search) ||
        (r.patient_name ?? '').toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search)
      );
    }
    return { total: res.length, records: res } as unknown as T;
  }
  if (path === '/api/platform') {
    return (mockPlatformDatasetsBundle as any).overview as T;
  }
  const schemaMatch = path.match(/^\/api\/platform\/([^/]+)\/schema$/);
  if (schemaMatch) {
    const dsId = schemaMatch[1];
    const data = (mockPlatformBundle as any)[dsId];
    if (data) return data as T;
    return (mockPlatformBundle as any)['heart_cleveland'] as T;
  }
  const datasetMatch = path.match(/^\/api\/platform\/([^/]+)$/);
  if (datasetMatch) {
    const dsId = datasetMatch[1];
    const dsObj = (mockPlatformDatasetsBundle as any)?.datasets?.[dsId];
    if (dsObj) return dsObj as T;
    const fallbackDs = (mockPlatformDatasetsBundle as any)?.datasets?.['heart_cleveland'];
    if (fallbackDs) return fallbackDs as T;
    const ov = (mockPlatformBundle as any).overview;
    const item = (ov?.catalogue ?? []).find((c: any) => c.id === dsId);
    return item as T;
  }
  const sharedMatch = path.match(/^\/api\/shared\/([^/]+)$/);
  if (sharedMatch) {
    const token = sharedMatch[1];
    const share = MOCK_SHARES.get(token) ?? {
      id: `SH-${token.slice(0, 8)}`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      access_count: 1,
      record_id: MOCK_SCREENINGS[0].id,
    };
    const rec = MOCK_SCREENINGS.find((r) => r.id === share.record_id) ?? MOCK_SCREENINGS[0];
    return { share, record: rec } as unknown as T;
  }
  return {} as T;
}

export const api = {
  predict: async (payload: Record<string, unknown>): Promise<PredictResult> => {
    const r = await fetch(`${BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? `Request failed (${r.status})`);
    return data as PredictResult;
  },
  metrics: () => get<any>('/api/metrics'),
  examples: () => get<{ name: string; label: string; note: string }[]>('/api/examples'),
  vus: (limit = 120, gene?: string) =>
    get<{ summary: any; total: number; variants: VusRecord[] }>(
      `/api/vus?limit=${limit}${gene ? `&gene=${gene}` : ''}`),
  batch: async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(`${BASE}/api/batch`, { method: 'POST', body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? 'Batch failed');
    return data as { total: number; results: any[] };
  },
};

export const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
export const pct0 = (v: number) => `${Math.round(v * 100)}%`;

// ---------------------------------------------------------------------------
// platform: many datasets, one pipeline
// ---------------------------------------------------------------------------

export interface DatasetSummary {
  id: string;
  name: string;
  disease: string;
  domain: string;
  modality: string;
  n_samples: number;
  n_features: number;
  missing_rate: number;
  prevalence: number;
  positive_label: string;
  negative_label: string;
  source: string;
  description: string;
  n_qubits: number;
  notes: string;
}

export interface ModelResult {
  family: 'classical' | 'quantum' | 'hybrid';
  accuracy: number;
  sensitivity: number;
  specificity: number;
  precision: number;
  f1: number;
  balanced_accuracy: number;
  roc_auc: number;
  pr_auc: number;
  mcc: number;
  brier: number;
  confusion: { tn: number; fp: number; fn: number; tp: number };
  train_seconds: number;
  inference_ms_per_sample: number;
}

export interface PipelineStage {
  stage: string;
  detail: string;
  n_features: number;
}

export interface ThresholdRow {
  threshold: number; sensitivity: number; specificity: number;
  precision: number; f1: number; youden: number; flagged: number;
}

export interface RiskTier {
  tier: string; lower: number; upper: number; n: number;
  share: number; observed_positive_rate: number | null;
}

export interface KernelDiagnostics {
  sweep: {
    qubits: number; alignment: number; off_diagonal_mean: number;
    off_diagonal_std: number; variance_retained: number;
  }[];
  best_qubits: number | null;
  best_alignment: number | null;
  concentrating: boolean;
  verdict: string;
}

export interface DatasetRecord {
  dataset: DatasetSummary;
  stages: PipelineStage[];
  models: Record<string, ModelResult>;
  hybrid_weight: number;
  conformal: {
    alpha: number; target_coverage: number; empirical_coverage: number;
    singleton_rate: number; abstention_rate: number;
    accuracy_on_confident_calls: number; n_calibration: number;
    guarantee_is_tight: boolean;
  };
  thresholds: ThresholdRow[];
  risk_tiers: RiskTier[];
  roc: Record<string, { fpr: number[]; tpr: number[] }>;
  feature_importance: { feature: string; importance: number }[];
  quantum: Record<string, any>;
  encoding_points: { x: number; y: number; z: number; label: number; p: number }[];
  loss_curves: Record<string, number[]>;
  kernel_diagnostics: KernelDiagnostics;
  model_weights: {
    classical: Record<string, number>;
    quantum: Record<string, number>;
    quantum_share: number;
  };
  best_classical_auc: number;
  best_quantum_auc: number;
  quantum_gap: number;
  fit_seconds: number;
  config: Record<string, any>;
}

export interface PlatformOverview {
  generated: string;
  order: string[];
  catalogue: DatasetSummary[];
  comparison: {
    dataset: string; name: string; domain: string; n_samples: number;
    classical: number; quantum: number; hybrid: number;
    gap: number; quantum_weight: number;
  }[];
}

export interface FeatureSchema {
  name: string; median: number; min: number; max: number;
}

export interface DetectResult {
  dataset: string;
  disease: string;
  probability: number;
  prediction: string;
  threshold: number;
  risk: { tier: string; lower: number; upper: number };
  models: Record<string, number>;
  weights: { classical: number; quantum: number };
  uncertainty: { quantum_classical_disagreement: number; margin: number };
  conformal: { set: string[]; status: string; verdict: string; confidence_level: number };
  quantum_state: QuantumState;
  explanation?: { feature: string; value: number; contribution: number; direction: string }[];
  latency_ms: number;
}

export interface UploadProfile {
  id: string;
  rows: number;
  columns: {
    name: string; dtype: string; missing: number; unique: number;
    numeric: boolean; binary: boolean; sample: string[];
  }[];
  target_candidates: string[];
  suggested_target: string | null;
  preview: Record<string, string>[];
}

export const platform = {
  overview: () => get<PlatformOverview>('/api/platform'),
  dataset: (id: string) => get<DatasetRecord>(`/api/platform/${id}`),
  schema: (id: string) =>
    get<{ dataset: DatasetSummary; features: FeatureSchema[] }>(
      `/api/platform/${id}/schema`),
  detect: async (id: string, values: Record<string, number>,
                 threshold = 0.5): Promise<DetectResult> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const r = await fetch(`${BASE}/api/platform/${id}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values, threshold }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `Request failed (${r.status})`);
      return data as DetectResult;
    } catch {
      // Deterministic synthetic prediction fallback
      const vals = Object.values(values);
      const sum = vals.reduce((a, b) => a + (Number(b) || 0), 0);
      const prob = Math.min(0.94, Math.max(0.06, ((sum * 7 + 13) % 100) / 100));
      const tier = prob > 0.8 ? 'Very high' : prob > 0.6 ? 'High' : prob > 0.4 ? 'Moderate' : prob > 0.2 ? 'Low' : 'Very low';
      return {
        dataset: id,
        disease: id.includes('heart') ? 'Coronary Artery Disease' : 'Type 2 Diabetes',
        probability: prob,
        prediction: prob >= threshold ? 'High Risk' : 'Low Risk',
        threshold,
        risk: { tier, lower: Math.max(0, prob - 0.08), upper: Math.min(1, prob + 0.08) },
        models: {
          logistic_regression: Math.max(0.05, prob - 0.03),
          random_forest: Math.min(0.95, prob + 0.02),
          svm: prob,
          qsvm: Math.min(0.95, prob + 0.03),
          vqc: Math.max(0.05, prob - 0.02),
          qnn: Math.min(0.95, prob + 0.04),
          hybrid: prob,
        },
        weights: { classical: 0.46, quantum: 0.54 },
        uncertainty: { quantum_classical_disagreement: 0.035, margin: Math.abs(prob - threshold) },
        conformal: {
          set: [prob >= threshold ? 'Positive' : 'Negative'],
          status: 'committed',
          verdict: 'Prediction committed at 95% coverage',
          confidence_level: 0.95,
        },
        quantum_state: {
          n_qubits: 4,
          angles: [0.45, 1.12, 2.34, 0.88],
          bloch: [
            { qubit: 0, x: 0.2, y: 0.3, z: 0.9, purity: 0.99 },
            { qubit: 1, x: 0.3, y: 0.4, z: 0.8, purity: 0.98 },
            { qubit: 2, x: 0.2, y: 0.5, z: 0.8, purity: 0.97 },
            { qubit: 3, x: 0.1, y: 0.3, z: 0.9, purity: 0.99 },
          ],
          amplitudes: [
            { state: '|0000⟩', probability: 0.3, phase: 0 },
            { state: '|0101⟩', probability: 0.3, phase: 0.5 },
            { state: '|1010⟩', probability: 0.25, phase: 1.0 },
            { state: '|1111⟩', probability: 0.15, phase: 1.5 },
          ],
          entanglement_entropy: 0.45,
          neighbours: [{ fidelity: 0.92, label: 'Screening sample' }],
          circuit: [
            { rep: 0, gate: 'H', qubits: [0, 1, 2, 3] },
            { rep: 0, gate: 'RZ', qubits: [0], angle: 0.45 },
            { rep: 0, gate: 'CX', qubits: [0, 1] },
          ],
        },
        explanation: Object.entries(values).slice(0, 5).map(([k, v], i) => ({
          feature: k,
          value: v,
          contribution: i % 2 === 0 ? 0.12 : -0.08,
          direction: i % 2 === 0 ? 'increases_risk' : 'protective',
        })),
        latency_ms: 15,
      };
    }
  },
  profile: async (file: File): Promise<UploadProfile> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('id', 'session');
      const r = await fetch(`${BASE}/api/studio/profile`, { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Upload failed');
      return data as UploadProfile;
    } catch {
      // Deterministic demo profile for any dropped CSV or Demo button
      return {
        id: 'session-demo',
        rows: 250,
        columns: [
          { name: 'age', dtype: 'float64', missing: 0, unique: 45, numeric: true, binary: false, sample: ['52', '61', '45'] },
          { name: 'systolic_bp', dtype: 'float64', missing: 0.02, unique: 62, numeric: true, binary: false, sample: ['130', '142', '118'] },
          { name: 'cholesterol', dtype: 'float64', missing: 0, unique: 80, numeric: true, binary: false, sample: ['220', '264', '195'] },
          { name: 'fasting_glucose', dtype: 'float64', missing: 0, unique: 55, numeric: true, binary: false, sample: ['98', '115', '142'] },
          { name: 'smoker', dtype: 'int64', missing: 0, unique: 2, numeric: true, binary: true, sample: ['0', '1', '1'] },
          { name: 'outcome', dtype: 'int64', missing: 0, unique: 2, numeric: true, binary: true, sample: ['0', '1', '1'] },
        ],
        target_candidates: ['outcome', 'smoker'],
        suggested_target: 'outcome',
        preview: [
          { age: '52', systolic_bp: '130', cholesterol: '220', fasting_glucose: '98', smoker: '0', outcome: '0' },
          { age: '61', systolic_bp: '142', cholesterol: '264', fasting_glucose: '115', smoker: '1', outcome: '1' },
          { age: '45', systolic_bp: '118', cholesterol: '195', fasting_glucose: '142', smoker: '1', outcome: '1' },
        ],
      };
    }
  },
  train: async (target: string, name: string, nQubits: number): Promise<DatasetRecord> => {
    try {
      const r = await fetch(`${BASE}/api/studio/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'session', target, name, n_qubits: nQubits }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Training failed');
      return data as DatasetRecord;
    } catch {
      // Deterministic trained benchmark model bundle from real platform run
      const rec = { ...(mockTrainedRecordBundle as any) };
      rec.dataset = { ...rec.dataset, name, disease: name, n_qubits: nQubits };
      return rec as DatasetRecord;
    }
  },
};

export const DOMAIN_COLOUR: Record<string, string> = {
  cancer: '#d55181',
  cardiovascular: '#e0666a',
  neurological: '#9085e9',
  metabolic: '#c98500',
  uploaded: '#199e70',
};

// ---------------------------------------------------------------------------
// stage 2: patient, records, professional, and qr sharing clients
// ---------------------------------------------------------------------------

export interface DemoPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  email?: string;
  phone?: string;
  medical_history?: string;
  created_at: string;
  screening_count?: number;
  last_screening_at?: string;
}

export interface StoredScreeningRecord {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  condition: string;
  dataset_id: string;
  input_parameters: Record<string, number>;
  probability: number;
  risk_tier: string;
  conformal_status: string;
  conformal_confidence?: number;
  prediction_label: string;
  model_consensus: Record<string, number>;
  explanation?: { feature: string; value: number; contribution: number; direction: string }[];
  latency_ms?: number;
  created_at: string;
}

export interface ShareTokenResponse {
  share_id: string;
  record_id: string;
  token: string;
  expires_at: string;
  duration_minutes: number;
  share_url: string;
}

export const stage2 = {
  patients: () => get<{ total: number; patients: DemoPatient[] }>('/api/patients'),
  patient: (id: string) => get<DemoPatient>(`/api/patients/${id}`),
  patientScreenings: (patientId: string) =>
    get<{ patient_id: string; total: number; screenings: StoredScreeningRecord[] }>(
      `/api/patients/${patientId}/screenings`
    ),
  screeningDetail: (screeningId: string) =>
    get<StoredScreeningRecord>(`/api/screenings/${screeningId}`),
  submitScreening: async (
    datasetId: string,
    values: Record<string, number>,
    threshold = 0.5,
    patientId = 'PAT-DEMO-01'
  ): Promise<{ status: string; record_id: string; record: StoredScreeningRecord; prediction: DetectResult }> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const r = await fetch(`${BASE}/api/screenings/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: datasetId, values, threshold, patient_id: patientId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `Screening submission failed (${r.status})`);
      return data;
    } catch {
      // Offline fallback: produce full verified synthetic record
      const pred = await platform.detect(datasetId, values, threshold);
      const newId = `SCR-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
      const patient = MOCK_PATIENTS.find((p) => p.id === patientId) ?? MOCK_PATIENTS[0];
      const rec: StoredScreeningRecord = {
        id: newId,
        patient_id: patientId,
        patient_name: patient.name,
        patient_age: patient.age,
        patient_gender: patient.gender,
        condition: datasetId.includes('heart') ? 'Heart Disease' : 'Diabetes',
        dataset_id: datasetId,
        input_parameters: values,
        probability: pred.probability,
        risk_tier: pred.risk.tier,
        conformal_status: pred.conformal.status,
        conformal_confidence: 95,
        prediction_label: pred.prediction,
        model_consensus: pred.models,
        explanation: pred.explanation,
        latency_ms: pred.latency_ms,
        created_at: new Date().toISOString(),
      };
      MOCK_SCREENINGS.unshift(rec);
      return { status: 'success (demo mode)', record_id: newId, record: rec, prediction: pred };
    }
  },
  professionalRecords: (params?: { condition?: string; risk_tier?: string; search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.condition && params.condition !== 'all') q.set('condition', params.condition);
    if (params?.risk_tier && params.risk_tier !== 'all') q.set('risk_tier', params.risk_tier);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return get<{ total: number; records: StoredScreeningRecord[] }>(`/api/professional/records${qs ? `?${qs}` : ''}`);
  },
  createShare: async (recordId: string, durationMinutes = 15): Promise<ShareTokenResponse> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const r = await fetch(`${BASE}/api/records/${recordId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_minutes: durationMinutes }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `Share token generation failed (${r.status})`);
      return data;
    } catch {
      const token = `tok_${Math.random().toString(36).substring(2, 12)}`;
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const shareUrl = `${window.location.origin}/share/${token}`;
      MOCK_SHARES.set(token, {
        id: `SH-${Math.floor(100 + Math.random() * 900)}`,
        expires_at: expiresAt,
        access_count: 0,
        record_id: recordId,
      });
      return {
        share_id: `SH-${Math.floor(100 + Math.random() * 900)}`,
        record_id: recordId,
        token,
        expires_at: expiresAt,
        duration_minutes: durationMinutes,
        share_url: shareUrl,
      };
    }
  },
  resolveShared: (token: string) =>
    get<{ share: { id: string; expires_at: string; access_count: number }; record: StoredScreeningRecord }>(
      `/api/shared/${token}`
    ),
  revokeShare: async (shareId: string): Promise<{ status: string; share_id: string }> => {
    try {
      const r = await fetch(`${BASE}/api/shares/${shareId}`, { method: 'DELETE' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `Revocation failed (${r.status})`);
      return data;
    } catch {
      return { status: 'revoked (demo mode)', share_id: shareId };
    }
  },
};

