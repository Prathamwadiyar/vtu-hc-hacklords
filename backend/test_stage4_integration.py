"""
Stage 4 End-to-End System Integration, Security, and API Contract Test Suite.
Validates the complete patient journey, professional cohort queries, cryptographic
QR sharing token lifecycle (creation, resolution, revocation, expiry), model prediction
integrity, and boundary security constraints.
"""
from __future__ import annotations

import io
import json
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import app
from db import init_db, get_db, hash_token


class Stage4IntegrationAndReliabilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db(seed=True)
        cls.client = app.test_client()

    # ------------------------------------------------------------------------
    # 1. API Contract Validation Across Core & Platform Endpoints
    # ------------------------------------------------------------------------
    def test_01_core_and_platform_contracts(self):
        """Verify contract structure, status codes, and JSON schemas of core endpoints."""
        # /api/health
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        body = res.get_json()
        self.assertEqual(body["status"], "ok")
        self.assertIn("models", body)

        # /api/metrics
        res = self.client.get("/api/metrics")
        self.assertEqual(res.status_code, 200)
        metrics = res.get_json()
        self.assertIn("models", metrics)
        self.assertIn("dataset", metrics)

        # /api/examples
        res = self.client.get("/api/examples")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.get_json(), list)

        # /api/platform
        res = self.client.get("/api/platform")
        self.assertEqual(res.status_code, 200)
        platform_info = res.get_json()
        self.assertIn("catalogue", platform_info)
        self.assertIn("comparison", platform_info)
        self.assertEqual(len(platform_info["catalogue"]), 5)

        # /api/platform/heart_cleveland/schema
        res = self.client.get("/api/platform/heart_cleveland/schema")
        self.assertEqual(res.status_code, 200)
        schema = res.get_json()
        self.assertIn("features", schema)
        self.assertEqual(len(schema["features"]), 13)

        # /api/platform/diabetes_pima/schema
        res = self.client.get("/api/platform/diabetes_pima/schema")
        self.assertEqual(res.status_code, 200)
        schema = res.get_json()
        self.assertIn("features", schema)
        self.assertEqual(len(schema["features"]), 8)

        # Unknown dataset returns 404
        res_unknown = self.client.get("/api/platform/nonexistent_dataset/schema")
        self.assertEqual(res_unknown.status_code, 404)

    # ------------------------------------------------------------------------
    # 2. Patient Journey End-to-End Workflow
    # ------------------------------------------------------------------------
    def test_02_patient_journey_workflow(self):
        """
        Simulate complete patient journey:
        1. Fetch patient profile & baseline history
        2. Submit new screening for Heart Disease
        3. Verify calibrated risk prediction, conformal status, and SHAP features
        4. Confirm record is saved to SQLite and appears in patient's screening list
        """
        # Step 1: Fetch patient profile
        res_patient = self.client.get("/api/patients/PAT-DEMO-01")
        self.assertEqual(res_patient.status_code, 200)
        patient = res_patient.get_json()
        self.assertEqual(patient["id"], "PAT-DEMO-01")
        self.assertEqual(patient["name"], "Elena Rostova")

        # Step 2: Submit Heart Disease screening
        payload = {
            "dataset_id": "heart_cleveland",
            "patient_id": "PAT-DEMO-01",
            "threshold": 0.5,
            "values": {
                "age": 58, "sex": 0, "cp": 1, "trestbps": 136, "chol": 224,
                "fbs": 0, "restecg": 0, "thalach": 162, "exang": 0, "oldpeak": 0.8,
                "slope": 0, "ca": 0, "thal": 1
            }
        }
        res_submit = self.client.post("/api/screenings/submit", json=payload)
        self.assertEqual(res_submit.status_code, 201)
        sub_data = res_submit.get_json()
        self.assertEqual(sub_data["status"], "success")
        record_id = sub_data["record_id"]
        pred = sub_data["prediction"]

        # Step 3: Validate prediction structure & bounds
        self.assertIn("probability", pred)
        self.assertGreaterEqual(pred["probability"], 0.0)
        self.assertLessEqual(pred["probability"], 1.0)
        self.assertIn("risk", pred)
        self.assertIn(pred["risk"]["tier"], ["Very low", "Low", "Moderate", "High", "Very high"])
        self.assertIn("conformal", pred)
        self.assertIn(pred["conformal"]["status"], ["committed", "abstain"])

        # Models consensus check (6 models + hybrid)
        models = pred["models"]
        for m in ["logistic_regression", "random_forest", "svm", "qsvm", "vqc", "qnn", "hybrid"]:
            self.assertIn(m, models)
            self.assertGreaterEqual(models[m], 0.0)
            self.assertLessEqual(models[m], 1.0)

        # SHAP explanation check
        self.assertIn("explanation", pred)
        self.assertIsInstance(pred["explanation"], list)
        self.assertGreater(len(pred["explanation"]), 0)
        for exp in pred["explanation"]:
            self.assertIn("feature", exp)
            self.assertIn("contribution", exp)

        # Step 4: Verify record appears in patient screening history
        res_history = self.client.get("/api/patients/PAT-DEMO-01/screenings")
        self.assertEqual(res_history.status_code, 200)
        history = res_history.get_json()["screenings"]
        created_ids = [r["id"] for r in history]
        self.assertIn(record_id, created_ids)

        # Verify individual screening detail endpoint
        res_detail = self.client.get(f"/api/screenings/{record_id}")
        self.assertEqual(res_detail.status_code, 200)
        detail = res_detail.get_json()
        self.assertEqual(detail["id"], record_id)
        self.assertEqual(detail["patient_id"], "PAT-DEMO-01")
        self.assertEqual(detail["patient_name"], "Elena Rostova")

    # ------------------------------------------------------------------------
    # 3. Professional Cohort & Filtering Testing
    # ------------------------------------------------------------------------
    def test_03_professional_portal_cohort_queries(self):
        """Test professional cohort retrieval, multi-parameter filtering, and pagination."""
        res = self.client.get("/api/professional/records?limit=50&offset=0")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("records", data)
        self.assertIn("total", data)
        self.assertGreaterEqual(data["total"], 6)

        # Filter by Diabetes
        res_diab = self.client.get("/api/professional/records?condition=Diabetes")
        self.assertEqual(res_diab.status_code, 200)
        for r in res_diab.get_json()["records"]:
            self.assertEqual(r["condition"], "Diabetes")

        # Filter by Risk Tier
        res_high = self.client.get("/api/professional/records?risk_tier=High")
        self.assertEqual(res_high.status_code, 200)
        for r in res_high.get_json()["records"]:
            self.assertEqual(r["risk_tier"], "High")

        # Search by ID or Name
        res_search = self.client.get("/api/professional/records?search=Marcus")
        self.assertEqual(res_search.status_code, 200)
        records = res_search.get_json()["records"]
        self.assertGreaterEqual(len(records), 1)
        self.assertIn("Marcus", records[0]["patient_name"])

    # ------------------------------------------------------------------------
    # 4. QR Sharing Security & Cryptographic Token Lifecycle
    # ------------------------------------------------------------------------
    def test_04_qr_share_complete_security_lifecycle(self):
        """
        Verify:
        - Opaque CSPRNG tokens
        - SHA-256 storage
        - Cache-Control: no-store on sensitive shared data
        - Token revocation triggers HTTP 410
        - Expiration handling triggers HTTP 410
        - Invalid/tampered token format triggers HTTP 400 or 404
        """
        # 1. Create a 15-minute share for existing demo record
        res_share = self.client.post("/api/records/SCR-2026-001/share", json={"duration_minutes": 15})
        self.assertEqual(res_share.status_code, 201)
        data = res_share.get_json()
        raw_token = data["token"]
        share_id = data["share_id"]

        # Token must be at least 32 characters URL-safe
        self.assertGreaterEqual(len(raw_token), 32)
        self.assertTrue(share_id.startswith("SHR-"))

        # Verify only SHA-256 hash is in SQLite, NOT raw_token
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM record_shares WHERE id = ?", (share_id,))
        row = cur.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row["token_hash"], hash_token(raw_token))
        # Ensure raw token does NOT appear anywhere in the database row
        self.assertNotIn(raw_token, str(dict(row)))

        # 2. Resolve share
        res_resolve = self.client.get(f"/api/shared/{raw_token}")
        self.assertEqual(res_resolve.status_code, 200)
        res_body = res_resolve.get_json()
        self.assertEqual(res_body["record"]["id"], "SCR-2026-001")
        self.assertIn("Cache-Control", res_resolve.headers)
        self.assertIn("no-store", res_resolve.headers["Cache-Control"])

        # 3. Revoke share and verify access is immediately blocked
        res_rev = self.client.delete(f"/api/shares/{share_id}")
        self.assertEqual(res_rev.status_code, 200)
        self.assertEqual(res_rev.get_json()["status"], "revoked")

        res_blocked = self.client.get(f"/api/shared/{raw_token}")
        self.assertEqual(res_blocked.status_code, 410)
        self.assertIn("revoked", res_blocked.get_json()["error"])

        # 4. Expiration handling: artificially create an expired share in DB with unique token
        import secrets
        expired_token = f"TEST_EXPIRED_TOKEN_{secrets.token_hex(16)}"
        expired_hash = hash_token(expired_token)
        expired_share_id = f"SHR-EXP-{secrets.token_hex(6)}"
        past_time = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
        with conn:
            conn.execute(
                """
                INSERT INTO record_shares (
                    id, record_id, token_hash, expires_at, is_revoked, access_count, created_at
                ) VALUES (?, 'SCR-2026-001', ?, ?, 0, 0, ?)
                """,
                (expired_share_id, expired_hash, past_time, past_time)
            )

        res_expired = self.client.get(f"/api/shared/{expired_token}")
        self.assertEqual(res_expired.status_code, 410)
        self.assertIn("expired", res_expired.get_json()["error"])

        # 5. Invalid / Malformed / Nonexistent token rejection
        res_malformed = self.client.get("/api/shared/short")
        self.assertEqual(res_malformed.status_code, 400)

        res_nonexistent = self.client.get("/api/shared/AAROGYAM_NONEXISTENT_VALID_LENGTH_TOKEN_99999")
        self.assertEqual(res_nonexistent.status_code, 404)

    # ------------------------------------------------------------------------
    # 5. Studio Upload & Batch Processing Boundary Security
    # ------------------------------------------------------------------------
    def test_05_upload_and_batch_limits(self):
        """Test file size limits and boundary validation on batch and studio endpoints."""
        # 1. /api/batch without file
        res = self.client.post("/api/batch")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Upload a CSV file", res.get_json()["error"])

        # 2. /api/batch with valid CSV
        csv_content = b"name\nNM_007294.4(BRCA1):c.181T>G (p.Cys61Gly)\n"
        data = {"file": (io.BytesIO(csv_content), "variants.csv")}
        res_batch = self.client.post("/api/batch", data=data, content_type="multipart/form-data")
        self.assertEqual(res_batch.status_code, 200)
        batch_out = res_batch.get_json()
        self.assertEqual(batch_out["total"], 1)
        self.assertEqual(batch_out["results"][0]["name"], "NM_007294.4(BRCA1):c.181T>G (p.Cys61Gly)")

        # 3. Oversized file protection (simulate > 8 MB)
        oversized = b"a" * (9 * 1024 * 1024)
        data_over = {"file": (io.BytesIO(oversized), "oversized.csv")}
        res_over = self.client.post("/api/batch", data=data_over, content_type="multipart/form-data")
        self.assertEqual(res_over.status_code, 400)
        self.assertIn("8 MB", res_over.get_json()["error"])


if __name__ == "__main__":
    unittest.main()
