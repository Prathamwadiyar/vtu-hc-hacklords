import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { platform, stage2, type DatasetSummary, type FeatureSchema } from '../lib/api';
import { useReveal } from '../lib/motion';

interface FieldMeta {
  label: string;
  unit?: string;
  hint: string;
  step?: number;
  options?: { value: number; label: string }[];
}

const FIELD_METADATA: Record<string, FieldMeta> = {
  // Heart disease (Cleveland)
  age: { label: 'Age', unit: 'years', hint: 'Patient chronological age in years', step: 1 },
  sex: {
    label: 'Sex at Birth',
    hint: 'Biological sex',
    options: [
      { value: 1, label: 'Male (1)' },
      { value: 0, label: 'Female (0)' },
    ],
  },
  cp: {
    label: 'Chest Pain Type',
    hint: 'Symptom presentation category',
    options: [
      { value: 0, label: 'Typical angina (0)' },
      { value: 1, label: 'Atypical angina (1)' },
      { value: 2, label: 'Non-anginal pain (2)' },
      { value: 3, label: 'Asymptomatic (3)' },
    ],
  },
  trestbps: { label: 'Resting Blood Pressure', unit: 'mm Hg', hint: 'Systolic blood pressure on admission', step: 1 },
  chol: { label: 'Serum Cholesterol', unit: 'mg/dL', hint: 'Fasting serum total cholesterol', step: 1 },
  fbs: {
    label: 'Fasting Blood Sugar > 120 mg/dL',
    hint: 'Elevated fasting blood sugar status',
    options: [
      { value: 0, label: 'No (≤ 120 mg/dL)' },
      { value: 1, label: 'Yes (> 120 mg/dL)' },
    ],
  },
  restecg: {
    label: 'Resting Electrocardiogram',
    hint: 'Baseline resting ECG results',
    options: [
      { value: 0, label: 'Normal (0)' },
      { value: 1, label: 'ST-T wave abnormality (1)' },
      { value: 2, label: 'Left ventricular hypertrophy (2)' },
    ],
  },
  thalach: { label: 'Maximum Heart Rate Achieved', unit: 'bpm', hint: 'Peak heart rate reached during stress test', step: 1 },
  exang: {
    label: 'Exercise-Induced Angina',
    hint: 'Presence of chest pain during physical exertion',
    options: [
      { value: 0, label: 'No (0)' },
      { value: 1, label: 'Yes (1)' },
    ],
  },
  oldpeak: { label: 'ST Depression', unit: 'mm', hint: 'ST depression induced by exercise relative to rest', step: 0.1 },
  slope: {
    label: 'Slope of Peak Exercise ST',
    hint: 'Gradient profile of the peak exercise ST segment',
    options: [
      { value: 0, label: 'Upsloping (0)' },
      { value: 1, label: 'Flat (1)' },
      { value: 2, label: 'Downsloping (2)' },
    ],
  },
  ca: {
    label: 'Major Vessels Colored by Fluoroscopy',
    hint: 'Number of major coronary vessels (0–3)',
    options: [
      { value: 0, label: '0 vessels' },
      { value: 1, label: '1 vessel' },
      { value: 2, label: '2 vessels' },
      { value: 3, label: '3 vessels' },
    ],
  },
  thal: {
    label: 'Thallium Scintigraphy',
    hint: 'Thallium cardiac perfusion scan status',
    options: [
      { value: 1, label: 'Normal (1)' },
      { value: 2, label: 'Fixed defect (2)' },
      { value: 3, label: 'Reversible defect (3)' },
    ],
  },

  // Diabetes (Pima)
  pregnancies: { label: 'Pregnancies', unit: 'count', hint: 'Total number of times pregnant', step: 1 },
  glucose: { label: 'Plasma Glucose (2-hr OGTT)', unit: 'mg/dL', hint: 'Fasting or 2-hour oral glucose tolerance test', step: 1 },
  bloodpressure: { label: 'Diastolic Blood Pressure', unit: 'mm Hg', hint: 'Diastolic arterial pressure', step: 1 },
  skinthickness: { label: 'Triceps Skinfold Thickness', unit: 'mm', hint: 'Indicator of body fat distribution', step: 1 },
  insulin: { label: '2-Hour Serum Insulin', unit: 'µU/mL', hint: 'Post-glucose challenge serum insulin level', step: 1 },
  bmi: { label: 'Body Mass Index (BMI)', unit: 'kg/m²', hint: 'Weight in kg / (height in meters)²', step: 0.1 },
  diabetespedigreefunction: { label: 'Diabetes Pedigree Function', unit: 'score', hint: 'Genetic risk score based on family history', step: 0.01 },
};

function getFieldMeta(name: string): FieldMeta {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (FIELD_METADATA[key]) return FIELD_METADATA[key];
  if (FIELD_METADATA[name]) return FIELD_METADATA[name];
  const clean = name.replace(/_/g, ' ');
  return {
    label: clean.charAt(0).toUpperCase() + clean.slice(1),
    hint: `Clinical feature: ${clean}`,
    step: 0.1,
  };
}

export default function Screening() {
  const { condition } = useParams<{ condition: string }>();
  const navigate = useNavigate();
  const scope = useRef<HTMLDivElement>(null);

  const isDiabetes = condition?.toLowerCase() === 'diabetes';
  const datasetId = isDiabetes ? 'diabetes_pima' : 'heart_cleveland';
  const conditionName = isDiabetes ? 'Diabetes' : 'Heart Disease';
  const conditionIcon = isDiabetes ? '🩸' : '❤️';

  const [schema, setSchema] = useState<{ dataset: DatasetSummary; features: FeatureSchema[] } | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, number | string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useReveal(scope, [loadingSchema, currentStep]);

  useEffect(() => {
    let active = true;
    setLoadingSchema(true);
    setSchemaError(null);

    platform.schema(datasetId)
      .then((res) => {
        if (!active) return;
        setSchema(res);
        const initial: Record<string, number | string> = {};
        res.features.forEach((f) => {
          const meta = getFieldMeta(f.name);
          if (meta.options && meta.options.length > 0) {
            initial[f.name] = meta.options[0].value;
          } else {
            initial[f.name] = '';
          }
        });
        setFormValues(initial);
      })
      .catch((err) => {
        if (!active) return;
        setSchemaError(err instanceof Error ? err.message : 'Unable to connect to model schema service');
      })
      .finally(() => {
        if (active) setLoadingSchema(false);
      });

    return () => { active = false; };
  }, [datasetId]);

  const { step1Features, step2Features, features } = useMemo(() => {
    const list = schema?.features ?? [];
    const mid = Math.ceil(list.length / 2);
    return {
      features: list,
      step1Features: list.slice(0, mid),
      step2Features: list.slice(mid),
    };
  }, [schema]);

  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {};
    const targetFeatures = stepNumber === 1 ? step1Features : step2Features;

    targetFeatures.forEach((f) => {
      const val = formValues[f.name];
      const meta = getFieldMeta(f.name);

      if (meta.options && meta.options.length > 0) {
        if (val === '' || val === undefined) {
          errors[f.name] = 'Please select an option';
        }
      } else {
        if (val === '' || val === undefined || val === null) {
          errors[f.name] = 'This clinical measurement is required';
        } else {
          const num = Number(val);
          if (isNaN(num)) {
            errors[f.name] = 'Please enter a valid numeric value';
          } else if (num < f.min || num > f.max) {
            errors[f.name] = `Value out of expected range (${f.min} – ${f.max})`;
          }
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setFieldErrors({});
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyMedians = () => {
    if (!schema) return;
    const filled: Record<string, number | string> = {};
    schema.features.forEach((f) => {
      filled[f.name] = f.median;
    });
    setFormValues(filled);
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);

    try {
      const numericPayload: Record<string, number> = {};
      features.forEach((f) => {
        const raw = formValues[f.name];
        numericPayload[f.name] = (raw !== '' && raw !== undefined) ? Number(raw) : f.median;
      });

      let result: any = null;
      let recordId: string | undefined = undefined;

      try {
        const resp = await stage2.submitScreening(datasetId, numericPayload, 0.5, 'PAT-DEMO-01');
        result = resp.prediction;
        recordId = resp.record_id;
      } catch (submitErr) {
        console.warn('Backend screening persistence failed, executing direct inference:', submitErr);
        result = await platform.detect(datasetId, numericPayload, 0.5);
      }

      try {
        sessionStorage.setItem('last_screening_result', JSON.stringify({
          result,
          datasetId,
          conditionName,
          inputs: numericPayload,
          recordId,
          timestamp: new Date().toISOString(),
        }));
      } catch (storageErr) {
        console.warn('Could not cache screening to sessionStorage', storageErr);
      }

      navigate('/patient/results', {
        state: {
          result,
          datasetId,
          conditionName,
          inputs: numericPayload,
          recordId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Screening prediction request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={scope} style={{ paddingTop: 108, paddingBottom: 80 }} className="page-enter">
      <div className="wrap" style={{ maxWidth: 840 }}>
        {/* Navigation back */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/patient" className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
            ← Back to Patient Portal
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{conditionIcon}</span>
            <span className="eyebrow" style={{ margin: 0 }}>Clinical Screening Protocol</span>
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            {conditionName} Risk Screening
          </h1>
          <p className="lede" style={{ fontSize: 15, marginTop: 10 }}>
            Structured, step-by-step risk assessment powered by hybrid quantum-classical predictive models.
          </p>
        </div>

        {/* Disclaimer banner */}
        <div className="banner banner--warn" style={{ marginBottom: 28 }}>
          <span>⚠️</span>
          <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            <strong>Healthcare Research Instrument Only.</strong> Input values represent biological and clinical
            measurements. Default medians can be pre-filled for convenience, but authentic results require validated
            patient records. Predictions do not constitute medical diagnosis.
          </div>
        </div>

        {/* Step progress bar */}
        <div className="panel panel-tight" style={{ marginBottom: 28, padding: '16px 22px' }}>
          <div className="step-bar">
            <div className={`step-node ${currentStep === 1 ? 'step-node--active' : currentStep > 1 ? 'step-node--done' : ''}`}>
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <div className={`step-line ${currentStep > 1 ? 'step-line--done' : ''}`} />
            <div className={`step-node ${currentStep === 2 ? 'step-node--active' : currentStep > 2 ? 'step-node--done' : ''}`}>
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <div className={`step-line ${currentStep > 2 ? 'step-line--done' : ''}`} />
            <div className={`step-node ${currentStep === 3 ? 'step-node--active' : ''}`}>
              3
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--ink-faint)' }}>
            <span style={{ color: currentStep === 1 ? 'var(--cyan)' : 'inherit' }}>Step 1: Baseline Metrics</span>
            <span style={{ color: currentStep === 2 ? 'var(--cyan)' : 'inherit' }}>Step 2: Clinical Biomarkers</span>
            <span style={{ color: currentStep === 3 ? 'var(--cyan)' : 'inherit' }}>Step 3: Verification & Submission</span>
          </div>
        </div>

        {/* Loading state */}
        {loadingSchema && (
          <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 24, width: '40%', margin: '0 auto 16px' }} />
            <div className="skeleton" style={{ height: 48, width: '80%', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: 48, width: '80%', margin: '0 auto' }} />
            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 24 }}>
              Loading clinical dataset schema and feature bounds…
            </p>
          </div>
        )}

        {/* Schema error */}
        {schemaError && (
          <div className="panel" style={{ borderColor: 'var(--rose)', padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'var(--rose)', fontSize: 15, marginBottom: 12 }}>
              Failed to load clinical screening model schema.
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-dim)', marginBottom: 20 }}>{schemaError}</p>
            <button className="btn btn-teal" onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Form Body */}
        {!loadingSchema && !schemaError && schema && (
          <div className="panel" style={{ padding: 'clamp(20px, 3.5vw, 32px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <span className="eyebrow" style={{ margin: 0 }}>
                {currentStep === 1 && `Part 1 of 2: Primary Vitals (${step1Features.length} measurements)`}
                {currentStep === 2 && `Part 2 of 2: Specialized Tests (${step2Features.length} measurements)`}
                {currentStep === 3 && 'Final Verification & Model Dispatch'}
              </span>
              {currentStep < 3 && (
                <button
                  type="button"
                  className="btn"
                  style={{ fontSize: 11.5, padding: '5px 12px' }}
                  onClick={handleApplyMedians}
                  title="Fill empty fields with typical reference values (dataset medians)"
                >
                  Fill Sample Reference Medians
                </button>
              )}
            </div>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div style={{ display: 'grid', gap: 18 }}>
                {step1Features.map((f) => {
                  const meta = getFieldMeta(f.name);
                  const err = fieldErrors[f.name];
                  const val = formValues[f.name];

                  return (
                    <div key={f.name} className="field-group">
                      <label htmlFor={f.name}>{meta.label}</label>
                      <div className="field-wrap">
                        {meta.options ? (
                          <select
                            id={f.name}
                            value={val}
                            onChange={(e) => setFormValues({ ...formValues, [f.name]: Number(e.target.value) })}
                            style={{ borderColor: err ? 'var(--rose)' : undefined }}
                          >
                            {meta.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <input
                              id={f.name}
                              type="number"
                              step={meta.step ?? 0.1}
                              min={f.min}
                              max={f.max}
                              placeholder={`Ref median: ${f.median}`}
                              value={val}
                              onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                              style={{ borderColor: err ? 'var(--rose)' : undefined }}
                            />
                            {meta.unit && <span className="field-unit">{meta.unit}</span>}
                          </>
                        )}
                      </div>
                      <div className="field-hint">
                        {meta.hint} {f.min !== f.max && `(Range: ${f.min} – ${f.max})`}
                      </div>
                      {err && <div className="field-error">{err}</div>}
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line-soft)' }}>
                  <button type="button" className="btn btn-teal" onClick={handleNext}>
                    Next: Clinical Biomarkers →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div style={{ display: 'grid', gap: 18 }}>
                {step2Features.map((f) => {
                  const meta = getFieldMeta(f.name);
                  const err = fieldErrors[f.name];
                  const val = formValues[f.name];

                  return (
                    <div key={f.name} className="field-group">
                      <label htmlFor={f.name}>{meta.label}</label>
                      <div className="field-wrap">
                        {meta.options ? (
                          <select
                            id={f.name}
                            value={val}
                            onChange={(e) => setFormValues({ ...formValues, [f.name]: Number(e.target.value) })}
                            style={{ borderColor: err ? 'var(--rose)' : undefined }}
                          >
                            {meta.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <input
                              id={f.name}
                              type="number"
                              step={meta.step ?? 0.1}
                              min={f.min}
                              max={f.max}
                              placeholder={`Ref median: ${f.median}`}
                              value={val}
                              onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                              style={{ borderColor: err ? 'var(--rose)' : undefined }}
                            />
                            {meta.unit && <span className="field-unit">{meta.unit}</span>}
                          </>
                        )}
                      </div>
                      <div className="field-hint">
                        {meta.hint} {f.min !== f.max && `(Range: ${f.min} – ${f.max})`}
                      </div>
                      {err && <div className="field-error">{err}</div>}
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line-soft)' }}>
                  <button type="button" className="btn" onClick={handlePrev}>
                    ← Previous Step
                  </button>
                  <button type="button" className="btn btn-teal" onClick={handleNext}>
                    Review & Confirm →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {currentStep === 3 && (
              <div>
                <p style={{ fontSize: 13, color: 'var(--ink-dim)', marginBottom: 20 }}>
                  Please verify all entered clinical values before submitting to the quantum-classical screening pipeline.
                  You can go back to modify any parameter.
                </p>

                <div style={{ overflowX: 'auto', marginBottom: 24, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Clinical Parameter</th>
                        <th>Entered Value</th>
                        <th>Unit</th>
                        <th>Dataset Reference Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((f) => {
                        const meta = getFieldMeta(f.name);
                        const rawVal = formValues[f.name];
                        let displayVal = String(rawVal === '' ? f.median : rawVal);

                        if (meta.options) {
                          const matched = meta.options.find((o) => o.value === Number(rawVal));
                          if (matched) displayVal = matched.label;
                        }

                        return (
                          <tr key={f.name}>
                            <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{meta.label}</td>
                            <td className="mono" style={{ color: 'var(--cyan)' }}>{displayVal}</td>
                            <td className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{meta.unit ?? '—'}</td>
                            <td className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                              {f.min} – {f.max} (median: {f.median})
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {submitError && (
                  <div className="banner banner--error" style={{ marginBottom: 20 }}>
                    <span>⚠️</span>
                    <div>
                      <strong>Prediction Error:</strong> {submitError}
                    </div>
                  </div>
                )}

                <div className="banner banner--info" style={{ marginBottom: 24 }}>
                  <span>🔬</span>
                  <div>
                    This dispatch executes our 6-model ensemble: classical models (Logistic Regression, Random Forest, SVM)
                    and quantum models (QSVM, VQC, QNN) with conformal risk calibration.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn" onClick={handlePrev} disabled={submitting}>
                    ← Edit Inputs
                  </button>
                  <button
                    type="button"
                    className="btn btn-teal"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ minWidth: 200, justifyContent: 'center' }}
                  >
                    {submitting ? 'Running Screening Engine…' : 'Run Risk Screening →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
