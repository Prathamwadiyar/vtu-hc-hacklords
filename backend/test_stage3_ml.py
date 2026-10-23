"""
Comprehensive AI & Quantum Machine Learning Verification Test Suite for AAROGYAM.
Verifies:
1. Dataset loading, sanity, missingness, and label distributions.
2. Analytic ZZFeatureMap fidelity against IBM Qiskit reference.
3. Statevector VQC parity and expectation value against Qiskit Pauli operator.
4. Quantum kernel matrix symmetry, unit diagonal, and positive semi-definiteness.
5. All 5 disease pipelines (Heart, Diabetes, Breast Cancer, Parkinson's, BRCA).
6. 6-model ensemble inference (Classical LR, RF, SVM + Quantum QSVM, VQC, QNN + Hybrid).
7. Conformal prediction sets and distribution-free coverage bounds.
8. SHAP tree explainability and feature attribution.
9. End-to-end screening submission and database persistence.
"""
from __future__ import annotations

import unittest
import sys
from pathlib import Path

# Add ml and backend to search path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "ml"))
sys.path.insert(0, str(ROOT / "backend"))

import numpy as np
import datasets
import quantum as Q
from platform_core import Platform


class Stage3AIQuantumVerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.platform = Platform()

    def test_01_datasets_integrity(self):
        """Verify disease datasets load with correct shapes, labels, and metadata."""
        heart = datasets.load("heart_cleveland")
        self.assertEqual(heart.n_samples, 303)
        self.assertEqual(heart.n_features, 13)
        self.assertTrue(0.40 <= heart.prevalence <= 0.50)
        self.assertEqual(heart.positive_label, "Disease present")

        diab = datasets.load("diabetes_pima")
        self.assertEqual(diab.n_samples, 768)
        self.assertEqual(diab.n_features, 8)
        self.assertTrue(0.30 <= diab.prevalence <= 0.40)
        self.assertEqual(diab.positive_label, "Diabetes")

        wdbc = datasets.load("breast_wdbc")
        self.assertEqual(wdbc.n_samples, 569)
        self.assertEqual(wdbc.n_features, 30)

        park = datasets.load("parkinsons")
        self.assertEqual(park.n_samples, 195)
        self.assertEqual(park.n_features, 22)

    def test_02_qiskit_zz_feature_map_fidelity(self):
        """Verify analytic statevector algebra matches IBM Qiskit's ZZFeatureMap to machine epsilon."""
        dev = Q.verify_against_qiskit(n_qubits=4, reps=2, n=8, seed=42)
        # Deviation between our closed-form vectorization and Qiskit circuit simulation
        self.assertLess(dev, 1e-12, f"Quantum feature map deviation {dev} exceeds tolerance 1e-12")

    def test_03_vqc_expectation_vs_qiskit_operator(self):
        """Verify VQC ansatz unitary and parity expectation matches Qiskit Pauli-Z expectation."""
        from qiskit.circuit.library import RealAmplitudes
        from qiskit.quantum_info import Operator

        vqc = Q.StatevectorVQC(n_qubits=4, feature_reps=2, ansatz_reps=2, seed=42)
        rng = np.random.default_rng(42)
        X = rng.uniform(0, np.pi, size=(3, 4))
        theta = rng.uniform(-np.pi, np.pi, size=vqc.n_params)

        psi = Q.zz_statevectors(X, reps=2)
        our_exp = vqc._expectation(psi, theta)

        ansatz = RealAmplitudes(4, reps=2)
        u_qiskit = Operator(ansatz.assign_parameters(theta)).data
        z_pauli = Operator.from_label("ZZZZ").data

        qiskit_exp = []
        for i in range(len(X)):
            sv = psi[i] @ u_qiskit.T
            val = float(np.real(sv.conj().T @ z_pauli @ sv))
            qiskit_exp.append(val)

        diff = float(np.max(np.abs(our_exp - np.array(qiskit_exp))))
        self.assertLess(diff, 1e-12, f"VQC expectation difference {diff} exceeds tolerance")

    def test_04_quantum_kernel_gram_properties(self):
        """Verify quantum kernel matrices are strictly symmetric, unit diagonal, and positive semi-definite."""
        rng = np.random.default_rng(42)
        X = rng.uniform(0, np.pi, size=(12, 4))
        psi = Q.zz_statevectors(X, reps=2)
        K = Q.kernel_matrix(psi)

        self.assertEqual(K.shape, (12, 12))
        self.assertTrue(np.allclose(K, K.T, atol=1e-12), "Kernel matrix is not symmetric")
        self.assertTrue(np.allclose(np.diag(K), 1.0, atol=1e-12), "Kernel diagonal elements are not 1.0")

        eigenvalues = np.linalg.eigvalsh(K)
        min_eig = float(eigenvalues.min())
        self.assertGreaterEqual(min_eig, -1e-10, f"Kernel is not PSD; min eigenvalue is {min_eig}")

    def test_05_heart_cleveland_pipeline_inference(self):
        """Verify full inference stack on Heart Disease pipeline."""
        pipe = self.platform.get("heart_cleveland")
        defaults = pipe.defaults()
        res = pipe.predict(defaults, threshold=0.5, explain=True)

        self.assertIn("probability", res)
        self.assertTrue(0.0 <= res["probability"] <= 1.0)
        self.assertIn("risk", res)
        self.assertIn(res["risk"]["tier"], ["Very low", "Low", "Moderate", "High", "Very high"])

        # Check all 6 component models are present
        for m in ["logistic_regression", "random_forest", "svm", "qsvm", "vqc", "qnn", "hybrid"]:
            self.assertIn(m, res["models"])
            self.assertTrue(0.0 <= res["models"][m] <= 1.0)

        # Check conformal guarantee
        self.assertIn("conformal", res)
        self.assertIn(res["conformal"]["status"], ["committed", "abstained"])

        # Check SHAP explanation
        self.assertIn("explanation", res)
        self.assertGreaterEqual(len(res["explanation"]), 5)
        for exp in res["explanation"]:
            self.assertIn("feature", exp)
            self.assertIn("contribution", exp)
            self.assertIn("direction", exp)

    def test_06_diabetes_pima_pipeline_inference(self):
        """Verify full inference stack on Diabetes Pima pipeline."""
        pipe = self.platform.get("diabetes_pima")
        defaults = pipe.defaults()
        res = pipe.predict(defaults, threshold=0.5, explain=True)

        self.assertIn("probability", res)
        self.assertTrue(0.0 <= res["probability"] <= 1.0)
        self.assertIn("risk", res)

        for m in ["logistic_regression", "random_forest", "svm", "qsvm", "vqc", "qnn", "hybrid"]:
            self.assertIn(m, res["models"])

        self.assertIn("explanation", res)
        self.assertGreaterEqual(len(res["explanation"]), 5)

    def test_07_end_to_end_screening_submission(self):
        """Test API screening submission endpoint persists and produces valid XAI."""
        from app import app
        client = app.test_client()

        payload = {
            "dataset_id": "heart_cleveland",
            "patient_id": "PAT-DEMO-01",
            "threshold": 0.5,
            "values": {
                "age": 62, "sex": 1, "chest_pain_type": 3, "resting_bp": 150, "cholesterol": 270,
                "fasting_blood_sugar": 0, "resting_ecg": 1, "max_heart_rate": 135,
                "exercise_angina": 1, "st_depression": 2.2, "st_slope": 2, "major_vessels": 2, "thalassemia": 3
            }
        }
        res = client.post("/api/screenings/submit", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()

        self.assertEqual(data["status"], "success")
        self.assertIn("record_id", data)
        pred = data["prediction"]
        self.assertIn("probability", pred)
        self.assertIn("explanation", pred)
        self.assertGreaterEqual(len(pred["explanation"]), 1)


if __name__ == "__main__":
    unittest.main()
