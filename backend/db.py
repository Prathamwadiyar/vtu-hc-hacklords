"""
Database models and SQLite connection for AAROGYAM demo records.
Provides thread-safe connections, schema initialization, and deterministic seed data.
"""
from __future__ import annotations

import hashlib
import json
import secrets
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

DB_PATH = Path(__file__).resolve().parent / "aarogyam_demo.db"
_local = threading.local()


def get_db() -> sqlite3.Connection:
    """Get a thread-local SQLite connection with Row factory enabled."""
    if not hasattr(_local, "conn") or _local.conn is None:
        conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        _local.conn = conn
    return _local.conn


def init_db(seed: bool = True) -> None:
    """Initialize database tables, indexes, and initial synthetic demo data."""
    conn = get_db()
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS demo_patients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            medical_history TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS screening_records (
            id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            condition TEXT NOT NULL,
            dataset_id TEXT NOT NULL,
            input_parameters TEXT NOT NULL,
            probability REAL NOT NULL,
            risk_tier TEXT NOT NULL,
            conformal_status TEXT NOT NULL,
            conformal_confidence REAL,
            prediction_label TEXT NOT NULL,
            model_consensus TEXT NOT NULL,
            explanation TEXT,
            latency_ms REAL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES demo_patients(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_screenings_patient ON screening_records(patient_id);
        CREATE INDEX IF NOT EXISTS idx_screenings_condition ON screening_records(condition);
        CREATE INDEX IF NOT EXISTS idx_screenings_created ON screening_records(created_at);

        CREATE TABLE IF NOT EXISTS record_shares (
            id TEXT PRIMARY KEY,
            record_id TEXT NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TEXT NOT NULL,
            is_revoked INTEGER NOT NULL DEFAULT 0,
            access_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (record_id) REFERENCES screening_records(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_shares_token_hash ON record_shares(token_hash);
        CREATE INDEX IF NOT EXISTS idx_shares_record ON record_shares(record_id);
        """)

    if seed:
        seed_demo_data(conn)


def seed_demo_data(conn: sqlite3.Connection) -> None:
    """Populate deterministic synthetic cohort of 30 patients and evaluated records."""
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS count FROM demo_patients")
    existing_count = cur.fetchone()["count"]
    if existing_count >= 30:
        return

    from synthetic_cohort import SYNTHETIC_30_PATIENTS
    from platform_core import Platform

    platform = Platform()
    pipes = {
        "heart_cleveland": platform.get("heart_cleveland"),
        "diabetes_pima": platform.get("diabetes_pima"),
    }

    with conn:
        for p in SYNTHETIC_30_PATIENTS:
            # Check if patient already exists
            cur.execute("SELECT id FROM demo_patients WHERE id = ?", (p["id"],))
            if not cur.fetchone():
                conn.execute(
                    """
                    INSERT INTO demo_patients (id, name, age, gender, email, phone, medical_history, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (p["id"], p["name"], p["age"], p["gender"], p["email"], p["phone"], p["medical_history"], p["created_at"])
                )

            # Insert patient screenings
            pipe = pipes.get(p["dataset_id"])
            for item in p.get("inputs", []):
                cur.execute("SELECT id FROM screening_records WHERE id = ?", (item["id"],))
                if not cur.fetchone() and pipe is not None:
                    # Run actual prediction via platform pipeline
                    res = pipe.predict(item["values"], threshold=0.5, explain=True)
                    prob = float(res.get("probability", 0.0))
                    risk_tier = res.get("risk", {}).get("tier", "Moderate")
                    conformal = res.get("conformal", {})
                    conformal_status = conformal.get("status", "committed")
                    conformal_confidence = float(conformal.get("confidence_level", 95.0))
                    prediction_label = res.get("prediction", "Evaluated")
                    models = res.get("models", {})
                    explanation = res.get("explanation", [])
                    latency_ms = float(res.get("latency_ms", 95.0))

                    conn.execute(
                        """
                        INSERT INTO screening_records (
                            id, patient_id, condition, dataset_id, input_parameters,
                            probability, risk_tier, conformal_status, conformal_confidence,
                            prediction_label, model_consensus, explanation, latency_ms, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            item["id"],
                            p["id"],
                            p["condition"],
                            p["dataset_id"],
                            json.dumps(item["values"]),
                            prob,
                            risk_tier,
                            conformal_status,
                            conformal_confidence,
                            prediction_label,
                            json.dumps(models),
                            json.dumps(explanation),
                            latency_ms,
                            item["date"],
                        )
                    )


def hash_token(raw_token: str) -> str:
    """SHA-256 hash for secure token storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_share_token() -> tuple[str, str]:
    """Generates a cryptographically secure token and its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(32)
    return raw_token, hash_token(raw_token)
