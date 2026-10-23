import unittest
import json
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import app
from db import init_db, get_db

class Stage2BackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db(seed=True)
        cls.client = app.test_client()

    def test_01_health_and_backwards_compatibility(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "ok")

        # Test metrics
        res = self.client.get("/api/metrics")
        self.assertEqual(res.status_code, 200)

        # Test platform overview
        res = self.client.get("/api/platform")
        self.assertEqual(res.status_code, 200)
        self.assertIn("catalogue", res.get_json())

    def test_02_patients_api(self):
        res = self.client.get("/api/patients")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data["total"], 6)
        first_patient = data["patients"][0]
        self.assertIn("id", first_patient)
        self.assertIn("name", first_patient)

        # Single patient
        p_id = first_patient["id"]
        res_single = self.client.get(f"/api/patients/{p_id}")
        self.assertEqual(res_single.status_code, 200)
        self.assertEqual(res_single.get_json()["id"], p_id)

        # Nonexistent patient
        res_404 = self.client.get("/api/patients/NONEXISTENT-99")
        self.assertEqual(res_404.status_code, 404)

    def test_03_patient_screenings_history(self):
        res = self.client.get("/api/patients/PAT-DEMO-01/screenings")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["patient_id"], "PAT-DEMO-01")
        self.assertIsInstance(data["screenings"], list)
        self.assertGreaterEqual(len(data["screenings"]), 1)

    def test_04_screening_submission_workflow(self):
        # Valid Heart disease submission
        payload = {
            "dataset_id": "heart_cleveland",
            "patient_id": "PAT-DEMO-02",
            "threshold": 0.5,
            "values": {
                "age": 55, "sex": 1, "cp": 2, "trestbps": 140, "chol": 240,
                "fbs": 0, "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 1.2,
                "slope": 1, "ca": 0, "thal": 2
            }
        }
        res = self.client.post("/api/screenings/submit", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("record_id", data)
        self.assertIn("prediction", data)
        self.assertIn("probability", data["prediction"])

        # Invalid payload (empty values)
        res_bad = self.client.post("/api/screenings/submit", json={"dataset_id": "heart_cleveland", "values": {}})
        self.assertEqual(res_bad.status_code, 400)

        # Unknown dataset
        res_unknown = self.client.post("/api/screenings/submit", json={"dataset_id": "unknown_dataset", "values": {"a": 1}})
        self.assertEqual(res_unknown.status_code, 404)

    def test_05_professional_records_and_search(self):
        res = self.client.get("/api/professional/records")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total", data)
        self.assertGreaterEqual(data["total"], 6)

        # Filter by condition
        res_heart = self.client.get("/api/professional/records?condition=Heart%20Disease")
        self.assertEqual(res_heart.status_code, 200)
        for r in res_heart.get_json()["records"]:
            self.assertEqual(r["condition"], "Heart Disease")

        # Search by patient name
        res_search = self.client.get("/api/professional/records?search=Elena")
        self.assertEqual(res_search.status_code, 200)
        self.assertGreaterEqual(res_search.get_json()["total"], 1)

    def test_06_qr_share_lifecycle(self):
        # 1. Create share for existing record
        res_share = self.client.post("/api/records/SCR-2026-001/share", json={"duration_minutes": 15})
        self.assertEqual(res_share.status_code, 201)
        data = res_share.get_json()
        self.assertIn("token", data)
        self.assertIn("share_id", data)
        raw_token = data["token"]
        share_id = data["share_id"]

        # 2. Resolve share
        res_resolve = self.client.get(f"/api/shared/{raw_token}")
        self.assertEqual(res_resolve.status_code, 200)
        res_data = res_resolve.get_json()
        self.assertEqual(res_data["record"]["id"], "SCR-2026-001")
        self.assertEqual(res_resolve.headers.get("Cache-Control"), "no-store, no-cache, must-revalidate, private")

        # 3. Revoke share
        res_revoke = self.client.delete(f"/api/shares/{share_id}")
        self.assertEqual(res_revoke.status_code, 200)
        self.assertEqual(res_revoke.get_json()["status"], "revoked")

        # 4. Resolve revoked share -> should be 410
        res_after_revoke = self.client.get(f"/api/shared/{raw_token}")
        self.assertEqual(res_after_revoke.status_code, 410)

if __name__ == "__main__":
    unittest.main()
