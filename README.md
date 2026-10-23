<div align="center">

# HackLords

**VTU-QFF-HC-0010** &nbsp;|&nbsp; Tier: **Both**

### AAROGYAM — Quantum-Assisted Early Health Risk Intelligence Platform

</div>

---

<div align="center">

| | |
| :--- | :--- |
| **Team** | HackLords |
| **Team ID** | VTU-QFF-HC-0010 |
| **Tier** | Both (Online & Offline) |
| **Live Web App** | **[https://aarogyamhl.vercel.app/](https://aarogyamhl.vercel.app/)** |
| **Video Demonstration** | **[Watch on YouTube (Demo Walkthrough)](https://youtu.be/HBQTm-y_lWI)** |
| **Presentation Deck** | **[AAROGYAM_QiskitFallFest_Deck.pptx](docs/AAROGYAM_QiskitFallFest_Deck.pptx)** |
| **Repository** | [vtu-hc-hacklords](https://github.com/vtu-qiskit-fall-fest-2026/vtu-hc-hacklords.git) |
| **Organisation** | [vtu-qiskit-fall-fest-2026](https://github.com/vtu-qiskit-fall-fest-2026) |
| **Event** | VTU-QFF Hackathon — VTU-Qiskit Fall Fest 2026 |

</div>

---

## 🚀 What Makes AAROGYAM Different?

> **"We don't just predict health risks. We explore how quantum intelligence can make risk assessment more transparent, comparative, and actionable."**

Most conventional healthcare AI tools function as closed black boxes—running a single classical classifier, producing uncalibrated probability scores, and failing to provide comparative transparency or dual-portal workflows. 

**AAROGYAM** bridges parameterised quantum statevector simulation via **IBM Qiskit** with validated clinical workflows, rigorous head-to-head benchmarking against classical algorithms, explainable feature attribution, and dual dedicated interfaces for patients and healthcare providers.

### ⚖️ Conventional Healthcare AI vs. AAROGYAM

| Dimension / Capability | Conventional Healthcare AI | AAROGYAM Platform | Codebase & Implementation Status |
| :--- | :--- | :--- | :--- |
| **1. Hybrid Quantum-Classical AI** | Strictly classical neural nets, tree models, or standard logistic regression. | Hybrid pipeline pairing classical baselines with **IBM Qiskit** circuits ($ZZFeatureMap$, VQC, Data Re-uploading QNN). | **Live** (`ml/quantum.py`, Qiskit statevector simulation) |
| **2. Quantum vs Classical Benchmarking** | Single-model deployment with no comparative architectural context. | Systematic 6-model benchmark suite (3 classical vs 3 quantum) comparing accuracy, balanced accuracy, F1, sensitivity, and runtime. | **Live** (`ml/pipeline.py`, `/platform` & `/studio` views) |
| **3. Explainable AI Risk Predictions** | Opaque black-box risk numbers with little or no feature-level attribution. | **SHAP feature attribution** waterfall charts, top contributing clinical factors, and patient-friendly natural language rationales. | **Live** (`ml/pipeline.py`, `web/src/components/ShapChart.tsx`) |
| **4. Multi-Disease Risk Assessment** | Siloed, single-task point solutions (e.g., only diabetes or only heart risk). | Unified multi-cohort architecture across 5 clinical domains: Breast Cancer Genomics, Cardiovascular Disease, Diabetes, Parkinson's, and Liver Disease. | **Live** (`data/bundled/`, synthetic cohorts, multi-disease screening) |
| **5. Separate Patient & Clinician Portals** | One-size-fits-all generic interface that overwhelms patients or under-informs doctors. | **Dual dedicated experiences**: Patient Portal (jargon-free screening, QR sharing, lifestyle guidance) + Clinician CDS Dashboard (conformal sets, threshold sweeps, triage). | **Live** (`/patient` & `/professional` portals with instant switching) |
| **6. Intelligent Risk Stratification** | Binary 0/1 outcome with uncalibrated probabilities and high false positives. | **5-Tier Clinical Risk Ladder** (Very Low → Very High) combined with **Split Conformal Prediction** coverage guarantees and model abstention on high uncertainty. | **Live** (`backend/platform_core.py`, conformal score thresholds) |
| **7. Interactive Health Analytics** | Static PDF summaries, basic tabular data, or passive metric cards. | Dynamic **3D DNA Double Helix (Three.js/R3F)**, interactive Bloch Sphere state visualisations, real-time threshold tuners, and dynamic ROC/PR curves. | **Live** (`web/src/components/HelixScene.tsx`, `BlochSpheres.tsx`, SVG charts) |
| **8. Preventive & Early Risk Identification** | Reactive diagnostics focused on confirmed, late-stage symptomatic pathology. | Proactive early risk biomarker identification, Grantham chemical distance variant scoring, and preventive clinical follow-up recommendations. | **Live** (`ml/features.py`, ClinVar HGVS parsing, tailored follow-up tiers) |

*Note: In line with honest scientific benchmarking, AAROGYAM evaluates quantum feature spaces transparently without claiming artificial quantum supremacy on small classical datasets; where quantum kernels achieve geometric advantage they are weighted favorably, and where exponential concentration occurs, classical estimators provide a safe calibrated fallback.*

---

### 💡 Our Innovation

1. **⚛️ Quantum Intelligence:**  
   Tabular and genomic markers are mapped into high-dimensional quantum Hilbert spaces using parameterised $ZZFeatureMap$ entangling unitary transformations in IBM Qiskit. Analytical statevector inner products compute exact Gram matrices ($K_{ij} = |\langle\psi(x_i)|\psi(x_j)\rangle|^2$), capturing non-linear feature interactions inaccessible to linear classical kernels.

2. **🔍 Explainable Predictions:**  
   Every prediction is paired with SHAP (SHapley Additive exPlanations) values to isolate which clinical biomarkers drove risk elevation. Rather than forcing users to trust an opaque score, AAROGYAM breaks down exact percentage contributions (e.g., Fasting Glucose, Grantham Variant Severity, ST-depression slope).

3. **🎯 Actionable Risk Insights:**  
   Risk scores are mapped into clinical action tiers with split conformal prediction intervals ($1 - \alpha = 90\%$ coverage guarantee). When data points fall near the decision boundary, the system explicitly flags predictive uncertainty and prompts clinician verification rather than making a dangerous guess.

---

## 📌 Table of Contents

- [🚀 What Makes AAROGYAM Different?](#-what-makes-aarogyam-different)
- [👥 Team Members](#-team-members-github-ids)
- [❓ Problem Statement](#-problem-statement)
- [💡 Proposed Solution](#-proposed-solution)
- [🧩 Approach & Architecture](#-approach--architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 How to Run](#-how-to-run)
- [🔁 How to Push Code](#-how-to-push-code)
- [✅ Submission Checklist](#-submission-checklist)
- [📚 Resources & Citations](#-resources--citations)
- [📄 License](#-license)

---

## 👥 Team Members (GitHub IDs)

| # | Name | GitHub Username | Role | Contact |
| :-- | :--- | :--- | :--- | :--- |
| 1 | **Pranali Basarikatti** | `@pranalib2026-cmyk` | Team Lead & Full-Stack / ML | +91 96636 67098 |
| 2 | **Pratham Wadiyar** | `@prathamwadiyar` | Quantum & Backend Engineer | +91 95133 66591 |
| 3 | **Shreya Bhadrashetti** | `@shreyabhadrashetti` | Frontend & UI/UX Developer | +91 97439 44399 |

---

## ❓ Problem Statement

**Problem:**  
Early-stage diagnosis of complex chronic diseases (cardiovascular conditions, oncological malignancies, metabolic dysfunction, and neurodegenerative disorders) is frequently hindered by high-dimensional, noisy, or collinear multimodal medical data. Standard clinical models often overfit or make uncalibrated overconfident predictions when biological data is ambiguous or scarce.

**Why it matters:**  
Detecting pathological markers before symptoms become irreversible dramatically improves patient survival rates and reduces healthcare costs. However, healthcare practitioners cannot rely on black-box predictions; clinical adoption demands calibrated decision support, explainable biomarkers, and guaranteed abstention when uncertainty is elevated.

**Track / Category:**  
**Tier: Both** · Healthcare & Life Sciences · Quantum Machine Learning (Qiskit)

---

## 💡 Proposed Solution

**Solution:**  
**AAROGYAM** is an end-to-end Quantum-Assisted Early Health Risk Intelligence Platform combining classical machine learning (Logistic Regression, Random Forest, RBF SVM) with parameterised quantum circuits in IBM Qiskit (Quantum Kernel SVM via ZZFeatureMap, Variational Quantum Classifier, and Data Re-uploading QNN with SPSA optimisation). 

**Key idea:**  
Closed-form analytical quantum statevector kernels ($K = |\Psi \Psi^\dagger|^2$) paired with validation-weighted hybrid ensembles, split conformal prediction sets with finite-sample coverage guarantees, and instant browser-side demo intelligence.

**Why this works:**  
The platform evaluates quantum kernel geometries across 5 clinical disease cohorts (genomics, hemodynamics, laboratory blood panels, acoustic time-series, and fine-needle aspirates). Where quantum feature spaces yield genuine Hilbert space separation, quantum models provide superior sensitivity; where exponential concentration occurs, the hybrid engine dynamically down-weights quantum contributions, guaranteeing safety and diagnostic reliability.

---

## 🧩 Approach & Architecture

```mermaid
flowchart TD
    A["Raw Clinical & Biomarker Inputs<br/>(Genomics, Blood, ECG, Voice, Uploaded CSV)"] --> B["Automated Preprocessing & Cleansing<br/>(Imputation, Tail-clipping, Standardization)"]
    B --> C["Feature Selection & Dimensionality Reduction<br/>(Mutual Information + PCA to N Qubits)"]
    
    C --> D1["Classical ML Baselines<br/>(Logistic Regression, RF, RBF SVM)"]
    C --> D2["Quantum Encoding Engine<br/>(ZZFeatureMap with All-to-All Entanglement)"]
    
    D2 --> E1["Quantum Kernel SVM (QSVM)<br/>Analytical Gram Matrix K = |Ψ Ψ†|²"]
    D2 --> E2["Variational Quantum Classifier (VQC)<br/>RealAmplitudes Ansatz + COBYLA"]
    D2 --> E3["Data Re-uploading QNN<br/>Hardware-ready SPSA Optimiser"]
    
    D1 --> F["Validation-Weighted Hybrid Ensemble"]
    E1 --> F
    E2 --> F
    E3 --> F
    
    F --> G1["Five-Tier Clinical Risk Ladder<br/>(Very Low → Very High)"]
    F --> G2["Split Conformal Prediction<br/>(Distribution-Free Coverage & Abstention)"]
    F --> G3["SHAP Feature Attribution<br/>(Biological Explainability)"]
    
    G1 --> H["Interactive Healthcare Portals<br/>(Patient Portal, Clinical CDS, Dataset Studio)"]
    G2 --> H
    G3 --> H
```

### Pipeline Flow:
1. **Input & Ingestion:** Diverse clinical formats—including ClinVar HGVS genomic notation, Cleveland heart hemodynamic parameters, Pima diabetes metrics, and user CSV uploads.
2. **Preprocessing:** Outlier clipping, median imputation, leak-free variant-level partitioning, and Mutual Information ranking.
3. **Quantum Core:** Tabular components are scaled to $[0, \pi]$ and encoded into an entangled $N$-qubit register using a closed-form analytical $ZZFeatureMap$.
4. **Ensemble & Calibration:** A 6-model benchmark suite (3 classical, 3 quantum) evaluated with threshold sweeps for screening sensitivity vs. confirmation specificity.
5. **Decision Support & Delivery:** Patient screening portal with QR health record sharing, Clinical Decision Support dashboard with 30 synthetic cohorts, and in-browser Dataset Studio with real-time profiling.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Quantum Framework** | **IBM Qiskit `>=2.0`**, `qiskit-machine-learning` | ZZFeatureMap encoding, statevector algebra, VQC, QNN |
| **Classical ML / AI** | `scikit-learn`, `numpy`, `pandas`, `scipy` | Data preprocessing, Random Forest, SVM, evaluation metrics |
| **Explainable AI (XAI)**| `shap` (TreeExplainer & KernelExplainer) | Clinically actionable feature contribution attribution |
| **Backend & APIs** | Python 3.12, **Flask 3.0**, `flask-cors`, Gunicorn | REST endpoints, SQLite demonstration database, session studio |
| **Frontend UI/UX** | **React 19**, **TypeScript**, **Vite 8**, Vanilla CSS | Responsive healthcare interface, light theme, CSS variables |
| **Visualisation** | **Three.js**, **React Three Fiber (R3F)**, GSAP | Interactive 3D DNA Double Helix, Bloch Spheres, dynamic SVG charts |
| **Offline Resilience** | JSON-backed deterministic mock bundles | 100% offline demonstration mode with zero external dependency |

---

## 📁 Project Structure

```text
vtu-hc-hacklords/
├── README.md                      # Complete project documentation & submission
├── Dockerfile                     # Multi-stage production container (Node + Python 3.12)
├── render.yaml                    # Automated 1-click cloud deployment blueprint
├── requirements.txt               # Full development dependencies
├── requirements-runtime.txt       # Production runtime dependencies
├── backend/                       # Python Flask API & Healthcare Services
│   ├── app.py                     # REST API endpoints & static SPA server
│   ├── db.py                      # SQLite healthcare schema & table definitions
│   ├── services.py                # Patient, Screening, Professional & QR share services
│   ├── synthetic_cohort.py        # 30-patient deterministic generator & clinical records
│   ├── platform_core.py           # Multi-dataset evaluation & runtime inference
│   └── test_stage4_integration.py # Automated end-to-end integration test suite
├── ml/                            # Machine Learning & Quantum Simulation Core
│   ├── pipeline.py                # Dataset-agnostic preprocessing & feature selection
│   ├── quantum.py                 # Analytical ZZFeatureMap, QSVM, VQC, and QNN
│   ├── features.py                # HGVS genomic parsing & Grantham chemical distance
│   └── build_dataset.py           # ClinVar de-duplication & variant-level splits
├── data/bundled/                  # Bundled clinical benchmark datasets
├── web/                           # Modern React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/            # Nav, Footer, HelixScene (3D), BlochSpheres, Stat
│   │   ├── lib/                   # api.ts (with offline demo fallback), mockData.json
│   │   ├── pages/                 # Patient, Clinical, Studio, Detect, Method, Screening
│   │   └── styles/global.css      # Custom light-theme design system tokens
│   └── package.json
└── docs/                          # In-depth scientific reports & architecture diagrams
```

---

## 🚀 How to Run

### Prerequisites
- **Python 3.11+** (Python 3.12 recommended)
- **Node.js 20+** & `npm`
- **Git**

---

### Method A: Quick Local Run (Frontend + Built-in Demo Mode)

To run the web interface immediately with full offline interactive demo capabilities:

```bash
# 1. Clone repository
git clone https://github.com/vtu-qiskit-fall-fest-2026/vtu-hc-hacklords.git
cd vtu-hc-hacklords/web

# 2. Install dependencies & run Vite
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser. All screening workflows, 30 patients, charts, and quantum detection features work out of the box.

---

### Method B: Full-Stack Run (Flask Backend + Qiskit Engine + React)

```bash
# 1. Setup Python Virtual Environment
python -m venv .venv
source .venv/bin/activate       # Linux / macOS
# .venv\Scripts\activate        # Windows PowerShell

# 2. Install Python dependencies
pip install -r requirements-runtime.txt

# 3. Start Flask Backend (Port 5001)
python backend/app.py

# 4. In a separate terminal, launch Web Frontend (Port 5173)
cd web
npm install
npm run dev
```

---

### Method C: Docker Container Run

```bash
docker build -t aarogyam .
docker run -p 8000:8000 aarogyam
```
Navigate to **`http://localhost:8000`**.

---

## 🔁 How to Push Code

```bash
# 1. Fetch latest changes
git checkout main
git pull target main

# 2. Create feature branch
git checkout -b feature/quantum-enhancement

# 3. Commit your modifications
git add .
git commit -m "feat: enhance quantum kernel diagnostics"

# 4. Push and open pull request
git push -u target feature/quantum-enhancement
```

---

## ✅ Submission Checklist

- [x] Repository created and **public**
- [x] All team members added as **collaborators** and listed in README
- [x] `README.md` updated with comprehensive project details and quantum methodology
- [x] Team members listed under [Team Members](#-team-members-github-ids)
- [x] Complete quantum machine learning pipeline committed (QSVM, VQC, QNN)
- [x] Zero-dependency Offline Demo Mode for hackathon jury evaluation
- [x] Production Docker container & 1-click cloud deployment config verified
- [x] Video walkthrough submitted: **[https://youtu.be/HBQTm-y_lWI](https://youtu.be/HBQTm-y_lWI)**
- [x] Code pushed to `main` and verified with automated test suites

---

## 📚 Resources & Citations

1. **Havlíček et al.** *Supervised learning with quantum-enhanced feature spaces.* Nature 567, 2019.
2. **Schuld & Killoran.** *Quantum machine learning in feature Hilbert spaces.* PRL 122, 2019.
3. **Pérez-Salinas et al.** *Data re-uploading for a universal quantum classifier.* Quantum 4, 2020.
4. **Thanasilp et al.** *Exponential concentration in quantum kernel methods.* Nature Communications 15, 2024.
5. **Angelopoulos & Bates.** *A gentle introduction to conformal prediction.* 2021.
6. **Lundberg & Lee.** *A unified approach to interpreting model predictions.* NeurIPS, 2017.
7. **IBM Qiskit Documentation:** [https://docs.quantum.ibm.com/](https://docs.quantum.ibm.com/)

---

## 📄 License

Released under the [MIT License](LICENSE). See `LICENSE` for details.

---

<div align="center">

**HackLords** · Team ID `VTU-QFF-HC-0010` · Tier `Both`  
Built with ⚛️ IBM Qiskit for the **VTU-Qiskit Fall Fest 2026**

[⬆ Back to Top](#hacklords)

</div>
