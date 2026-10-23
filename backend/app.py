"""
Aarogyam API + static host for the React front end.
"""
from __future__ import annotations

import io
import json
import time
from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import pandas as pd

from core import Aarogyam
from platform_core import Platform
from db import init_db
from services import PatientService, ScreeningService, ProfessionalService, SharingService

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "web" / "dist"
DATA = ROOT / "backend" / "data"

# static_folder is left unset on purpose: with static_url_path="" Flask's own
# static route registers as /<path:filename> and shadows the SPA catch-all
# below, so deep links such as /predict would 404 instead of loading the app.
app = Flask(__name__, static_folder=None)
CORS(app)

print("initializing demonstration SQLite database ...")
init_db(seed=True)

print("loading model bundles ...")
_t0 = time.time()
PLATFORM = Platform()
print(f"  {len(PLATFORM.pipelines)} dataset pipelines: "
      f"{', '.join(PLATFORM.pipelines)}")
MODEL = Aarogyam()
# Build the SHAP explainer up front; otherwise the first request pays for it.
MODEL.predict({"name": "NM_007294.4(BRCA1):c.181T>G (p.Cys61Gly)"})
print(f"ready in {time.time() - _t0:.1f}s")

_METRICS = json.loads((DATA / "metrics.json").read_text())
_PLATFORM = json.loads((DATA / "platform.json").read_text())
_VUS = json.loads((DATA / "vus_scored.json").read_text()) if (DATA / "vus_scored.json").exists() else {"variants": []}
_EXAMPLES = json.loads((DATA / "examples.json").read_text()) if (DATA / "examples.json").exists() else []

# Uploaded tables live in memory only, for the duration of the process.
_UPLOADS: dict[str, "pd.DataFrame"] = {}


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "models": ["rf", "svm", "qsvm", "vqc", "hybrid"]})


@app.get("/api/metrics")
def metrics():
    return jsonify(_METRICS)


@app.get("/api/examples")
def examples():
    return jsonify(_EXAMPLES)


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    if not (payload.get("name") or payload.get("hgvs")):
        return jsonify({"error": "Provide an HGVS variant name, e.g. "
                                 "NM_007294.4(BRCA1):c.181T>G (p.Cys61Gly)"}), 400
    t0 = time.time()
    try:
        result = MODEL.predict(payload, explain=payload.get("explain", True))
    except Exception as exc:                       # noqa: BLE001
        return jsonify({"error": f"Could not score that variant: {exc}"}), 400
    result["latency_ms"] = round((time.time() - t0) * 1000, 1)
    return jsonify(result)


@app.get("/api/vus")
def vus():
    limit = min(int(request.args.get("limit", 100)), 500)
    gene = request.args.get("gene")
    items = _VUS.get("variants", [])
    if gene in ("BRCA1", "BRCA2"):
        items = [v for v in items if v["gene"] == gene]
    return jsonify({"summary": _VUS.get("summary", {}),
                    "total": len(items), "variants": items[:limit]})


@app.post("/api/batch")
def batch():
    if "file" not in request.files:
        return jsonify({"error": "Upload a CSV file under the 'file' field"}), 400
    raw = request.files["file"].read()
    if len(raw) > 8 * 1024 * 1024:
        return jsonify({"error": "Batch file is larger than 8 MB limit"}), 400
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:                        # noqa: BLE001
        return jsonify({"error": f"Could not read the CSV: {exc}"}), 400
    if len(df) > 500:
        return jsonify({"error": "Batch limit is 500 rows"}), 400

    col = next((c for c in df.columns if c.lower() in
                ("name", "hgvs", "variant", "variant_name")), None)
    if col is None:
        return jsonify({"error": "CSV needs a 'name' column of HGVS variant "
                                 "descriptions"}), 400

    rows = []
    for i, raw in enumerate(df[col].astype(str)):
        try:
            r = MODEL.predict({"name": raw}, explain=False)
            rows.append({
                "row": i + 1, "name": raw,
                "gene": r["annotation"]["gene"],
                "consequence": r["annotation"]["consequence"],
                "prediction": r["prediction"],
                "pathogenic_probability": r["pathogenic_probability"],
                "conformal": r["conformal"]["status"],
                "uncertainty": r["uncertainty"]["flag"],
            })
        except Exception as exc:                    # noqa: BLE001
            rows.append({"row": i + 1, "name": raw, "error": str(exc)[:120]})
    return jsonify({"total": len(rows), "results": rows})


# ---------------------------------------------------------------------------
# platform: many diseases, one pipeline
# ---------------------------------------------------------------------------

@app.get("/api/platform")
def platform_overview():
    """Catalogue and headline benchmark for every bundled dataset."""
    slim = {
        "generated": _PLATFORM["generated"],
        "order": _PLATFORM["order"],
        "catalogue": _PLATFORM["catalogue"],
        "comparison": _PLATFORM["comparison"],
    }
    return jsonify(slim)


@app.get("/api/platform/<dataset_id>")
def platform_dataset(dataset_id: str):
    rec = _PLATFORM["datasets"].get(dataset_id)
    if rec is None:
        return jsonify({"error": f"unknown dataset {dataset_id}"}), 404
    return jsonify(rec)


@app.get("/api/platform/<dataset_id>/schema")
def platform_schema(dataset_id: str):
    try:
        return jsonify(PLATFORM.get(dataset_id).schema())
    except KeyError:
        return jsonify({"error": f"unknown dataset {dataset_id}"}), 404


@app.post("/api/platform/<dataset_id>/predict")
def platform_predict(dataset_id: str):
    try:
        pipe = PLATFORM.get(dataset_id)
    except KeyError:
        return jsonify({"error": f"unknown dataset {dataset_id}"}), 404
    body = request.get_json(silent=True) or {}
    threshold = float(body.get("threshold", 0.5))
    try:
        return jsonify(pipe.predict(body.get("values", {}), threshold=threshold,
                                    explain=body.get("explain", True)))
    except Exception as exc:                               # noqa: BLE001
        return jsonify({"error": f"could not score that row: {exc}"}), 400


# ---------------------------------------------------------------------------
# studio: upload a dataset and train the same stack on it
# ---------------------------------------------------------------------------

def _read_upload(file_storage) -> pd.DataFrame:
    raw = file_storage.read()
    if len(raw) > 8 * 1024 * 1024:
        raise ValueError("file is larger than 8 MB")
    return pd.read_csv(io.BytesIO(raw))


@app.post("/api/studio/profile")
def studio_profile():
    """Inspect an uploaded table: columns, missingness, candidate targets."""
    if "file" not in request.files:
        return jsonify({"error": "attach a CSV under the 'file' field"}), 400
    try:
        df = _read_upload(request.files["file"])
    except Exception as exc:                               # noqa: BLE001
        return jsonify({"error": f"could not read the CSV: {exc}"}), 400
    if len(df) > 20000:
        df = df.sample(20000, random_state=0)
    _UPLOADS[request.form.get("id", "last")] = df
    profile = PLATFORM.profile(df)
    profile["id"] = request.form.get("id", "last")
    return jsonify(profile)


@app.post("/api/studio/train")
def studio_train():
    """Run the full hybrid pipeline on the uploaded table."""
    body = request.get_json(silent=True) or {}
    key = body.get("id", "last")
    df = _UPLOADS.get(key)
    if df is None:
        return jsonify({"error": "upload a file first"}), 400
    target = body.get("target")
    if not target:
        return jsonify({"error": "choose a target column"}), 400
    try:
        n_qubits = max(4, min(int(body.get("n_qubits", 6)), 10))
        result = PLATFORM.train_uploaded(
            df, target=target,
            name=body.get("name", "Uploaded dataset"),
            n_qubits=n_qubits)
    except Exception as exc:                               # noqa: BLE001
        return jsonify({"error": str(exc)}), 400
    return jsonify(result)


# ---------------------------------------------------------------------------
# stage 2: patient, screening workflow, professional, and record sharing APIs
# ---------------------------------------------------------------------------

@app.get("/api/patients")
def get_patients():
    """Retrieve all synthetic demo patient profiles."""
    try:
        patients = PatientService.list_patients()
        return jsonify({"total": len(patients), "patients": patients})
    except Exception as exc:
        return jsonify({"error": f"Failed to retrieve patients: {exc}"}), 500


@app.get("/api/patients/<patient_id>")
def get_patient(patient_id: str):
    """Retrieve a single synthetic patient profile."""
    patient = PatientService.get_patient(patient_id)
    if not patient:
        return jsonify({"error": f"Patient {patient_id} not found"}), 404
    return jsonify(patient)


@app.get("/api/patients/<patient_id>/screenings")
def get_patient_screenings(patient_id: str):
    """Retrieve all screening records associated with a patient."""
    patient = PatientService.get_patient(patient_id)
    if not patient:
        return jsonify({"error": f"Patient {patient_id} not found"}), 404
    screenings = PatientService.get_patient_screenings(patient_id)
    return jsonify({
        "patient_id": patient_id,
        "total": len(screenings),
        "screenings": screenings,
    })


@app.get("/api/screenings/<screening_id>")
def get_screening_detail(screening_id: str):
    """Retrieve details of an individual screening record."""
    screening = ScreeningService.get_screening(screening_id)
    if not screening:
        return jsonify({"error": f"Screening record {screening_id} not found"}), 404
    return jsonify(screening)


@app.post("/api/screenings/submit")
def submit_and_save_screening():
    """
    Screening orchestration endpoint: validates inputs, evaluates models via
    the existing dataset pipeline, and saves the verified record to SQLite.
    """
    body = request.get_json(silent=True) or {}
    dataset_id = body.get("dataset_id")
    if not dataset_id:
        return jsonify({"error": "Field 'dataset_id' is required"}), 400

    try:
        pipe = PLATFORM.get(dataset_id)
    except KeyError:
        return jsonify({"error": f"Unknown dataset '{dataset_id}'"}), 404

    values = body.get("values", {})
    if not isinstance(values, dict) or not values:
        return jsonify({"error": "Field 'values' must be a non-empty dictionary"}), 400

    threshold = float(body.get("threshold", 0.5))
    patient_id = body.get("patient_id", "PAT-DEMO-01")

    # Run actual model prediction using existing pipeline
    try:
        prediction = pipe.predict(values, threshold=threshold, explain=body.get("explain", True))
    except Exception as exc:
        return jsonify({"error": f"Inference engine failed: {exc}"}), 400

    # Save to SQLite database
    condition = "Heart Disease" if "heart" in dataset_id.lower() else "Diabetes" if "diab" in dataset_id.lower() else dataset_id
    try:
        saved_record = ScreeningService.save_screening(
            patient_id=patient_id,
            condition=condition,
            dataset_id=dataset_id,
            input_parameters=values,
            prediction_result=prediction,
        )
    except Exception as exc:
        # Prediction succeeded, but storage encountered an issue; return prediction with warning
        prediction["storage_warning"] = f"Prediction succeeded but record storage failed: {exc}"
        return jsonify(prediction), 200

    return jsonify({
        "status": "success",
        "record_id": saved_record["id"],
        "record": saved_record,
        "prediction": prediction,
    }), 201


@app.get("/api/professional/patients")
def professional_patients():
    """Listing of demo patients for clinicians."""
    patients = PatientService.list_patients()
    return jsonify({"total": len(patients), "patients": patients})


@app.get("/api/professional/records")
def professional_records():
    """Cohort records listing with filtering by condition, risk tier, and search."""
    condition = request.args.get("condition")
    risk_tier = request.args.get("risk_tier")
    search = request.args.get("search")
    limit = min(int(request.args.get("limit", 50)), 100)
    offset = max(int(request.args.get("offset", 0)), 0)

    results = ProfessionalService.list_records(
        condition=condition,
        risk_tier=risk_tier,
        search=search,
        limit=limit,
        offset=offset,
    )
    return jsonify(results)


@app.get("/api/professional/records/<record_id>")
def professional_record_detail(record_id: str):
    """Detailed record retrieval for healthcare professionals."""
    rec = ScreeningService.get_screening(record_id)
    if not rec:
        return jsonify({"error": f"Record {record_id} not found"}), 404
    return jsonify(rec)


@app.post("/api/records/<record_id>/share")
def create_record_share(record_id: str):
    """
    Generate an ephemeral, cryptographically secure QR token for a screening record.
    Only token hash is persisted in the database.
    """
    body = request.get_json(silent=True) or {}
    duration = int(body.get("duration_minutes", 15))
    if duration < 1 or duration > 1440:
        return jsonify({"error": "Duration must be between 1 and 1440 minutes"}), 400

    try:
        share = SharingService.create_share(record_id, duration_minutes=duration)
        return jsonify(share), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 404
    except Exception as exc:
        return jsonify({"error": f"Could not create share token: {exc}"}), 500


@app.get("/api/shared/<token>")
def resolve_shared_record(token: str):
    """Resolve an opaque share token to view a shared record."""
    if not token or len(token) < 16:
        return jsonify({"error": "Invalid token format"}), 400

    result = SharingService.resolve_shared_record(token)
    if not result:
        return jsonify({"error": "Share link is invalid or does not exist"}), 404
    if "error" in result:
        return jsonify({"error": result["error"]}), result.get("status", 400)

    # Avoid browser caching of sensitive shared health records
    response = jsonify(result)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
    response.headers["Pragma"] = "no-cache"
    return response


@app.delete("/api/shares/<share_id>")
def revoke_share(share_id: str):
    """Revoke an active sharing token."""
    revoked = SharingService.revoke_share(share_id)
    if not revoked:
        return jsonify({"error": f"Share {share_id} not found"}), 404
    return jsonify({"status": "revoked", "share_id": share_id})


@app.get("/")
@app.get("/<path:path>")
def spa(path: str = ""):
    """Serve built assets, and fall back to index.html so client routes work."""
    if not (DIST / "index.html").exists():
        return jsonify({"error": "Front end not built. Run `npm run build` in web/."}), 404
    if path:
        candidate = (DIST / path).resolve()
        if candidate.is_file() and candidate.is_relative_to(DIST.resolve()):
            return send_from_directory(DIST, path)
    return send_from_directory(DIST, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
