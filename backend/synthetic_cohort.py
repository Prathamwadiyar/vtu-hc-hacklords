"""
Deterministic synthetic cohort generator producing exactly 30 realistic demonstration patients
and their associated screening history, evaluated using AAROGYAM's actual ML pipelines.
"""
from __future__ import annotations

import json
from typing import Any


# 30 Synthetic Patient Profiles:
# 15 Heart Disease primary profiles, 15 Diabetes primary profiles.
# Realistic clinical values, diverse demographics, realistic histories.
SYNTHETIC_30_PATIENTS = [
    # --- 15 Heart Disease Primary Profiles ---
    {
        "id": "PAT-DEMO-01",
        "name": "Elena Rostova",
        "age": 58,
        "gender": "Female",
        "email": "elena.rostova@demo.internal",
        "phone": "+91 98765 43210",
        "medical_history": "Essential hypertension diagnosed 2023. Family history of coronary artery disease.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-15T09:30:00Z",
        "inputs": [
            # Screening 1: Earlier check
            {
                "id": "SCR-2026-001-A",
                "date": "2026-04-10T11:00:00Z",
                "values": {
                    "age": 57, "sex": 0, "cp": 1, "trestbps": 145, "chol": 252,
                    "fbs": 0, "restecg": 0, "thalach": 148, "exang": 0, "oldpeak": 1.2,
                    "slope": 1, "ca": 1, "thal": 2
                }
            },
            # Screening 2: Recent check
            {
                "id": "SCR-2026-001",
                "date": "2026-10-21T10:15:00Z",
                "values": {
                    "age": 58, "sex": 0, "cp": 2, "trestbps": 162, "chol": 284,
                    "fbs": 1, "restecg": 1, "thalach": 138, "exang": 1, "oldpeak": 2.4,
                    "slope": 1, "ca": 2, "thal": 3
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-03",
        "name": "Amina Al-Mansoor",
        "age": 62,
        "gender": "Female",
        "email": "amina.mansoor@demo.internal",
        "phone": "+91 98222 33445",
        "medical_history": "Routine geriatric cardiology follow-up. Normal baseline resting ECG.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-18T14:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-003",
                "date": "2026-10-19T09:40:00Z",
                "values": {
                    "age": 62, "sex": 0, "cp": 0, "trestbps": 118, "chol": 192,
                    "fbs": 0, "restecg": 0, "thalach": 158, "exang": 0, "oldpeak": 0.2,
                    "slope": 0, "ca": 0, "thal": 1
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-05",
        "name": "Sarah O'Connor",
        "age": 39,
        "gender": "Female",
        "email": "sarah.oconnor@demo.internal",
        "phone": "+91 98444 55667",
        "medical_history": "Atypical chest discomfort post-exercise. Workup negative for myocardial infarction.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-20T16:20:00Z",
        "inputs": [
            {
                "id": "SCR-2026-005",
                "date": "2026-10-17T11:10:00Z",
                "values": {
                    "age": 39, "sex": 0, "cp": 1, "trestbps": 135, "chol": 238,
                    "fbs": 0, "restecg": 1, "thalach": 140, "exang": 1, "oldpeak": 1.2,
                    "slope": 1, "ca": 0, "thal": 2
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-07",
        "name": "Rajeshwari Patel",
        "age": 64,
        "gender": "Female",
        "email": "rajeshwari.patel@demo.internal",
        "phone": "+91 98666 77889",
        "medical_history": "Post-menopausal hypercholesterolemia. Moderate exertional dyspnea.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-10T08:15:00Z",
        "inputs": [
            {
                "id": "SCR-2026-007",
                "date": "2026-10-12T10:00:00Z",
                "values": {
                    "age": 64, "sex": 0, "cp": 3, "trestbps": 155, "chol": 310,
                    "fbs": 0, "restecg": 2, "thalach": 130, "exang": 1, "oldpeak": 2.8,
                    "slope": 2, "ca": 2, "thal": 3
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-08",
        "name": "Vikram Malhotra",
        "age": 52,
        "gender": "Male",
        "email": "vikram.malhotra@demo.internal",
        "phone": "+91 98777 88990",
        "medical_history": "Smoker (15 pack-years). Borderline elevated resting blood pressure.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-11T13:40:00Z",
        "inputs": [
            {
                "id": "SCR-2026-008",
                "date": "2026-10-14T09:20:00Z",
                "values": {
                    "age": 52, "sex": 1, "cp": 2, "trestbps": 138, "chol": 245,
                    "fbs": 1, "restecg": 1, "thalach": 144, "exang": 0, "oldpeak": 1.4,
                    "slope": 1, "ca": 1, "thal": 2
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-09",
        "name": "Arjun Singhania",
        "age": 47,
        "gender": "Male",
        "email": "arjun.singhania@demo.internal",
        "phone": "+91 98888 99001",
        "medical_history": "High-stress corporate role. Occasional palpitations after high caffeine intake.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-12T11:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-009",
                "date": "2026-10-13T14:15:00Z",
                "values": {
                    "age": 47, "sex": 1, "cp": 1, "trestbps": 128, "chol": 215,
                    "fbs": 0, "restecg": 0, "thalach": 166, "exang": 0, "oldpeak": 0.4,
                    "slope": 0, "ca": 0, "thal": 1
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-10",
        "name": "Kavita Deshmukh",
        "age": 59,
        "gender": "Female",
        "email": "kavita.deshmukh@demo.internal",
        "phone": "+91 98999 00112",
        "medical_history": "Mild osteopenia, sedentary lifestyle, elevated LDL cholesterol.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-13T15:20:00Z",
        "inputs": [
            {
                "id": "SCR-2026-010",
                "date": "2026-10-15T11:30:00Z",
                "values": {
                    "age": 59, "sex": 0, "cp": 2, "trestbps": 140, "chol": 268,
                    "fbs": 0, "restecg": 1, "thalach": 142, "exang": 1, "oldpeak": 1.6,
                    "slope": 1, "ca": 1, "thal": 2
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-11",
        "name": "Robert MacIntyre",
        "age": 68,
        "gender": "Male",
        "email": "robert.macintyre@demo.internal",
        "phone": "+91 98123 45678",
        "medical_history": "Previous transient ischemic attack 2021. Statin therapy.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-14T09:10:00Z",
        "inputs": [
            {
                "id": "SCR-2026-011",
                "date": "2026-10-16T16:00:00Z",
                "values": {
                    "age": 68, "sex": 1, "cp": 3, "trestbps": 160, "chol": 275,
                    "fbs": 1, "restecg": 2, "thalach": 122, "exang": 1, "oldpeak": 3.0,
                    "slope": 2, "ca": 3, "thal": 3
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-12",
        "name": "Zainab Fatima",
        "age": 42,
        "gender": "Female",
        "email": "zainab.fatima@demo.internal",
        "phone": "+91 98234 56789",
        "medical_history": "Pre-hypertension monitored during second pregnancy. Otherwise healthy.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-15T14:30:00Z",
        "inputs": [
            {
                "id": "SCR-2026-012",
                "date": "2026-10-17T09:00:00Z",
                "values": {
                    "age": 42, "sex": 0, "cp": 0, "trestbps": 120, "chol": 185,
                    "fbs": 0, "restecg": 0, "thalach": 172, "exang": 0, "oldpeak": 0.0,
                    "slope": 0, "ca": 0, "thal": 1
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-13",
        "name": "Karthik Subramanian",
        "age": 55,
        "gender": "Male",
        "email": "karthik.subramanian@demo.internal",
        "phone": "+91 98345 67890",
        "medical_history": "Moderate hypertriglyceridemia, regular walker, non-smoker.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-16T10:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-013",
                "date": "2026-10-18T11:45:00Z",
                "values": {
                    "age": 55, "sex": 1, "cp": 2, "trestbps": 132, "chol": 230,
                    "fbs": 0, "restecg": 1, "thalach": 152, "exang": 0, "oldpeak": 0.8,
                    "slope": 1, "ca": 0, "thal": 2
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-14",
        "name": "Ananya Joshi",
        "age": 60,
        "gender": "Female",
        "email": "ananya.joshi@demo.internal",
        "phone": "+91 98456 78901",
        "medical_history": "Mild mitral valve prolapse with trace regurgitation, asymptomatic.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-17T12:15:00Z",
        "inputs": [
            {
                "id": "SCR-2026-014",
                "date": "2026-10-19T13:30:00Z",
                "values": {
                    "age": 60, "sex": 0, "cp": 1, "trestbps": 130, "chol": 210,
                    "fbs": 0, "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 0.6,
                    "slope": 0, "ca": 0, "thal": 1
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-15",
        "name": "Devendra Rao",
        "age": 71,
        "gender": "Male",
        "email": "devendra.rao@demo.internal",
        "phone": "+91 98567 89012",
        "medical_history": "Chronic stable angina, prior coronary stenting 2019.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-18T08:45:00Z",
        "inputs": [
            {
                "id": "SCR-2026-015",
                "date": "2026-10-20T10:15:00Z",
                "values": {
                    "age": 71, "sex": 1, "cp": 3, "trestbps": 158, "chol": 260,
                    "fbs": 1, "restecg": 2, "thalach": 115, "exang": 1, "oldpeak": 2.6,
                    "slope": 2, "ca": 3, "thal": 3
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-16",
        "name": "Meera Nambiar",
        "age": 36,
        "gender": "Female",
        "email": "meera.nambiar@demo.internal",
        "phone": "+91 98678 90123",
        "medical_history": "Regular cardiovascular fitness test for pilot medical clearance.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-19T11:20:00Z",
        "inputs": [
            {
                "id": "SCR-2026-016",
                "date": "2026-10-21T09:10:00Z",
                "values": {
                    "age": 36, "sex": 0, "cp": 0, "trestbps": 114, "chol": 178,
                    "fbs": 0, "restecg": 0, "thalach": 178, "exang": 0, "oldpeak": 0.0,
                    "slope": 0, "ca": 0, "thal": 1
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-17",
        "name": "Siddharth Varma",
        "age": 49,
        "gender": "Male",
        "email": "siddharth.varma@demo.internal",
        "phone": "+91 98789 01234",
        "medical_history": "Elevated ApoB levels, family history of early myocardial infarction in father.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-20T15:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-017",
                "date": "2026-10-22T14:40:00Z",
                "values": {
                    "age": 49, "sex": 1, "cp": 2, "trestbps": 142, "chol": 270,
                    "fbs": 0, "restecg": 1, "thalach": 146, "exang": 1, "oldpeak": 1.8,
                    "slope": 1, "ca": 1, "thal": 2
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-18",
        "name": "Hannah Lindqvist",
        "age": 53,
        "gender": "Female",
        "email": "hannah.lindqvist@demo.internal",
        "phone": "+91 98890 12345",
        "medical_history": "Mild hypertension controlled on ACE inhibitors, good exercise tolerance.",
        "condition": "Heart Disease",
        "dataset_id": "heart_cleveland",
        "created_at": "2026-10-21T10:40:00Z",
        "inputs": [
            {
                "id": "SCR-2026-018",
                "date": "2026-10-22T16:15:00Z",
                "values": {
                    "age": 53, "sex": 0, "cp": 1, "trestbps": 126, "chol": 218,
                    "fbs": 0, "restecg": 0, "thalach": 160, "exang": 0, "oldpeak": 0.6,
                    "slope": 0, "ca": 0, "thal": 1
                }
            }
        ]
    },

    # --- 15 Diabetes Primary Profiles ---
    {
        "id": "PAT-DEMO-02",
        "name": "Marcus Vance",
        "age": 44,
        "gender": "Male",
        "email": "marcus.vance@demo.internal",
        "phone": "+91 98111 22334",
        "medical_history": "Borderline fasting glucose 2025. Moderate sedentary activity.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-16T11:15:00Z",
        "inputs": [
            {
                "id": "SCR-2026-002",
                "date": "2026-10-20T12:00:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 142, "bloodpressure": 82, "skinthickness": 28,
                    "insulin": 125, "bmi": 31.4, "diabetespedigreefunction": 0.62, "age": 44
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-04",
        "name": "David Chen",
        "age": 51,
        "gender": "Male",
        "email": "david.chen@demo.internal",
        "phone": "+91 98333 44556",
        "medical_history": "Family history of type-2 diabetes mellitus. High BMI, fatty liver grade 1.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-19T10:45:00Z",
        "inputs": [
            # Earlier screening
            {
                "id": "SCR-2026-004-A",
                "date": "2026-03-14T09:30:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 165, "bloodpressure": 86, "skinthickness": 32,
                    "insulin": 180, "bmi": 35.2, "diabetespedigreefunction": 0.76, "age": 50
                }
            },
            # Recent screening
            {
                "id": "SCR-2026-004",
                "date": "2026-10-18T15:20:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 188, "bloodpressure": 90, "skinthickness": 35,
                    "insulin": 210, "bmi": 36.8, "diabetespedigreefunction": 0.88, "age": 51
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-06",
        "name": "Priya Sharma",
        "age": 29,
        "gender": "Female",
        "email": "priya.sharma@demo.internal",
        "phone": "+91 98555 66778",
        "medical_history": "Standard executive wellness check. Marathon runner, optimal metabolic profile.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-21T08:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-006",
                "date": "2026-10-15T14:30:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 88, "bloodpressure": 68, "skinthickness": 18,
                    "insulin": 64, "bmi": 22.1, "diabetespedigreefunction": 0.24, "age": 29
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-19",
        "name": "Sunita Kulkarni",
        "age": 56,
        "gender": "Female",
        "email": "sunita.kulkarni@demo.internal",
        "phone": "+91 98901 23456",
        "medical_history": "History of gestational diabetes during second child. Mild acanthosis nigricans.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-11T10:30:00Z",
        "inputs": [
            {
                "id": "SCR-2026-019",
                "date": "2026-10-13T11:15:00Z",
                "values": {
                    "pregnancies": 2, "glucose": 172, "bloodpressure": 84, "skinthickness": 32,
                    "insulin": 195, "bmi": 34.2, "diabetespedigreefunction": 0.72, "age": 56
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-20",
        "name": "Farhan Akhtar",
        "age": 38,
        "gender": "Male",
        "email": "farhan.akhtar@demo.internal",
        "phone": "+91 98012 34567",
        "medical_history": "Sedentary desk worker, elevated HbA1c (6.1%) on recent screening.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-12T14:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-020",
                "date": "2026-10-14T15:20:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 134, "bloodpressure": 78, "skinthickness": 24,
                    "insulin": 110, "bmi": 29.8, "diabetespedigreefunction": 0.48, "age": 38
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-21",
        "name": "Grace Hopper-Wong",
        "age": 46,
        "gender": "Female",
        "email": "grace.wong@demo.internal",
        "phone": "+91 98124 56789",
        "medical_history": "Polycystic ovary syndrome (PCOS), insulin resistance monitored annually.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-13T09:45:00Z",
        "inputs": [
            {
                "id": "SCR-2026-021",
                "date": "2026-10-15T10:10:00Z",
                "values": {
                    "pregnancies": 1, "glucose": 156, "bloodpressure": 80, "skinthickness": 30,
                    "insulin": 160, "bmi": 32.6, "diabetespedigreefunction": 0.65, "age": 46
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-22",
        "name": "Naveen Reddy",
        "age": 33,
        "gender": "Male",
        "email": "naveen.reddy@demo.internal",
        "phone": "+91 98235 67890",
        "medical_history": "Regular gym attendee, high protein diet, normal blood chemistry.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-14T16:10:00Z",
        "inputs": [
            {
                "id": "SCR-2026-022",
                "date": "2026-10-16T11:00:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 94, "bloodpressure": 72, "skinthickness": 20,
                    "insulin": 75, "bmi": 24.5, "diabetespedigreefunction": 0.30, "age": 33
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-23",
        "name": "Fatima Noor",
        "age": 61,
        "gender": "Female",
        "email": "fatima.noor@demo.internal",
        "phone": "+91 98346 78901",
        "medical_history": "Confirmed type-2 diabetes on metformin 500mg BD. Baseline neuropathy evaluation.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-15T11:20:00Z",
        "inputs": [
            {
                "id": "SCR-2026-023",
                "date": "2026-10-17T14:30:00Z",
                "values": {
                    "pregnancies": 4, "glucose": 196, "bloodpressure": 88, "skinthickness": 38,
                    "insulin": 240, "bmi": 38.4, "diabetespedigreefunction": 0.94, "age": 61
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-24",
        "name": "Deepak Mehta",
        "age": 48,
        "gender": "Male",
        "email": "deepak.mehta@demo.internal",
        "phone": "+91 98457 89012",
        "medical_history": "Moderate metabolic syndrome. Triglycerides 220 mg/dL, HDL 38 mg/dL.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-16T13:30:00Z",
        "inputs": [
            {
                "id": "SCR-2026-024",
                "date": "2026-10-18T09:50:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 148, "bloodpressure": 84, "skinthickness": 26,
                    "insulin": 135, "bmi": 30.5, "diabetespedigreefunction": 0.54, "age": 48
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-25",
        "name": "Maya Krishnan",
        "age": 27,
        "gender": "Female",
        "email": "maya.krishnan@demo.internal",
        "phone": "+91 98568 90123",
        "medical_history": "Pre-employment health physical. Vegetarian diet, no known chronic conditions.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-17T09:15:00Z",
        "inputs": [
            {
                "id": "SCR-2026-025",
                "date": "2026-10-19T10:40:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 84, "bloodpressure": 66, "skinthickness": 16,
                    "insulin": 58, "bmi": 21.4, "diabetespedigreefunction": 0.22, "age": 27
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-26",
        "name": "Tariq Mansuri",
        "age": 54,
        "gender": "Male",
        "email": "tariq.mansuri@demo.internal",
        "phone": "+91 98679 01234",
        "medical_history": "Hypertensive, pre-diabetic fasting blood sugars, mild peripheral edema.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-18T10:50:00Z",
        "inputs": [
            {
                "id": "SCR-2026-026",
                "date": "2026-10-20T11:25:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 162, "bloodpressure": 88, "skinthickness": 30,
                    "insulin": 175, "bmi": 33.1, "diabetespedigreefunction": 0.68, "age": 54
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-27",
        "name": "Ritu Sengupta",
        "age": 41,
        "gender": "Female",
        "email": "ritu.sengupta@demo.internal",
        "phone": "+91 98780 12345",
        "medical_history": "Borderline OGTT 2 hours post-load (155 mg/dL). Prescribed dietary modifications.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-19T14:10:00Z",
        "inputs": [
            {
                "id": "SCR-2026-027",
                "date": "2026-10-21T15:00:00Z",
                "values": {
                    "pregnancies": 1, "glucose": 128, "bloodpressure": 76, "skinthickness": 22,
                    "insulin": 98, "bmi": 27.4, "diabetespedigreefunction": 0.42, "age": 41
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-28",
        "name": "Harish Chandra",
        "age": 67,
        "gender": "Male",
        "email": "harish.chandra@demo.internal",
        "phone": "+91 98891 23456",
        "medical_history": "Longstanding type-2 diabetes mellitus with early diabetic retinopathy.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-20T11:45:00Z",
        "inputs": [
            {
                "id": "SCR-2026-028",
                "date": "2026-10-22T09:30:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 205, "bloodpressure": 92, "skinthickness": 36,
                    "insulin": 260, "bmi": 37.9, "diabetespedigreefunction": 0.98, "age": 67
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-29",
        "name": "Leila Benali",
        "age": 35,
        "gender": "Female",
        "email": "leila.benali@demo.internal",
        "phone": "+91 98902 34567",
        "medical_history": "Postpartum metabolic review at 6 months. Weight retention 8 kg post-delivery.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-21T13:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-029",
                "date": "2026-10-22T14:10:00Z",
                "values": {
                    "pregnancies": 1, "glucose": 118, "bloodpressure": 74, "skinthickness": 26,
                    "insulin": 88, "bmi": 28.2, "diabetespedigreefunction": 0.38, "age": 35
                }
            }
        ]
    },
    {
        "id": "PAT-DEMO-30",
        "name": "Gurpreet Singh",
        "age": 45,
        "gender": "Male",
        "email": "gurpreet.singh@demo.internal",
        "phone": "+91 98013 45678",
        "medical_history": "Routine preventive executive screening. Moderate physical fitness.",
        "condition": "Diabetes",
        "dataset_id": "diabetes_pima",
        "created_at": "2026-10-22T09:00:00Z",
        "inputs": [
            {
                "id": "SCR-2026-030",
                "date": "2026-10-22T16:45:00Z",
                "values": {
                    "pregnancies": 0, "glucose": 104, "bloodpressure": 76, "skinthickness": 22,
                    "insulin": 82, "bmi": 25.8, "diabetespedigreefunction": 0.35, "age": 45
                }
            }
        ]
    },
]
