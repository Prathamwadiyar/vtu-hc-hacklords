"""
Service layer for demo patients, clinical screenings, and time-limited record shares.
Decouples business logic from HTTP endpoints and database queries.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from db import generate_share_token, get_db, hash_token


class PatientService:
    @staticmethod
    def list_patients() -> list[dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT p.*, COUNT(s.id) AS screening_count,
                   MAX(s.created_at) AS last_screening_at
            FROM demo_patients p
            LEFT JOIN screening_records s ON p.id = s.patient_id
            GROUP BY p.id
            ORDER BY p.name ASC
            """
        )
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    @staticmethod
    def get_patient(patient_id: str) -> Optional[dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM demo_patients WHERE id = ?", (patient_id,))
        row = cur.fetchone()
        if not row:
            return None
        return dict(row)

    @staticmethod
    def get_patient_screenings(patient_id: str) -> list[dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT * FROM screening_records
            WHERE patient_id = ?
            ORDER BY created_at DESC
            """,
            (patient_id,),
        )
        screenings = []
        for r in cur.fetchall():
            item = dict(r)
            item["input_parameters"] = json.loads(item["input_parameters"])
            item["model_consensus"] = json.loads(item["model_consensus"])
            item["explanation"] = json.loads(item["explanation"]) if item.get("explanation") else []
            screenings.append(item)
        return screenings


class ScreeningService:
    @staticmethod
    def get_screening(screening_id: str) -> Optional[dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT s.*, p.name AS patient_name, p.age AS patient_age, p.gender AS patient_gender
            FROM screening_records s
            JOIN demo_patients p ON s.patient_id = p.id
            WHERE s.id = ?
            """,
            (screening_id,),
        )
        row = cur.fetchone()
        if not row:
            return None
        item = dict(row)
        item["input_parameters"] = json.loads(item["input_parameters"])
        item["model_consensus"] = json.loads(item["model_consensus"])
        item["explanation"] = json.loads(item["explanation"]) if item.get("explanation") else []
        return item

    @staticmethod
    def save_screening(
        patient_id: str,
        condition: str,
        dataset_id: str,
        input_parameters: dict[str, Any],
        prediction_result: dict[str, Any],
    ) -> dict[str, Any]:
        conn = get_db()
        screening_id = f"SCR-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{json.dumps(input_parameters).__hash__() % 10000:04d}"
        created_at = datetime.now(timezone.utc).isoformat()

        prob = float(prediction_result.get("probability", 0.0))
        risk_tier = prediction_result.get("risk", {}).get("tier", "Moderate")
        conformal = prediction_result.get("conformal", {})
        conformal_status = conformal.get("status", "committed")
        conformal_confidence = float(conformal.get("confidence_level", 95.0))
        prediction_label = prediction_result.get("prediction", "Evaluated")
        model_consensus = prediction_result.get("models", {})
        explanation = prediction_result.get("explanation", [])
        latency_ms = float(prediction_result.get("latency_ms", 0.0))

        with conn:
            conn.execute(
                """
                INSERT INTO screening_records (
                    id, patient_id, condition, dataset_id, input_parameters,
                    probability, risk_tier, conformal_status, conformal_confidence,
                    prediction_label, model_consensus, explanation, latency_ms, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    screening_id,
                    patient_id,
                    condition,
                    dataset_id,
                    json.dumps(input_parameters),
                    prob,
                    risk_tier,
                    conformal_status,
                    conformal_confidence,
                    prediction_label,
                    json.dumps(model_consensus),
                    json.dumps(explanation),
                    latency_ms,
                    created_at,
                ),
            )

        return ScreeningService.get_screening(screening_id)  # type: ignore


class ProfessionalService:
    @staticmethod
    def list_records(
        condition: Optional[str] = None,
        risk_tier: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> dict[str, Any]:
        conn = get_db()
        cur = conn.cursor()

        query = """
            SELECT s.*, p.name AS patient_name, p.age AS patient_age, p.gender AS patient_gender
            FROM screening_records s
            JOIN demo_patients p ON s.patient_id = p.id
            WHERE 1=1
        """
        params: list[Any] = []

        if condition and condition != "all":
            query += " AND s.condition = ?"
            params.append(condition)

        if risk_tier and risk_tier != "all":
            query += " AND s.risk_tier = ?"
            params.append(risk_tier)

        if search:
            query += " AND (p.name LIKE ? OR s.id LIKE ? OR s.patient_id LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])

        # Get total matching
        count_query = f"SELECT COUNT(*) AS total FROM ({query})"
        cur.execute(count_query, params)
        total = cur.fetchone()["total"]

        query += " ORDER BY s.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cur.execute(query, params)
        records = []
        for r in cur.fetchall():
            item = dict(r)
            item["input_parameters"] = json.loads(item["input_parameters"])
            item["model_consensus"] = json.loads(item["model_consensus"])
            item["explanation"] = json.loads(item["explanation"]) if item.get("explanation") else []
            records.append(item)

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "records": records,
        }


class SharingService:
    @staticmethod
    def create_share(record_id: str, duration_minutes: int = 15) -> dict[str, Any]:
        # Validate that the record exists
        record = ScreeningService.get_screening(record_id)
        if not record:
            raise ValueError(f"Screening record {record_id} does not exist.")

        raw_token, token_hash = generate_share_token()
        share_id = f"SHR-{secrets_hex(6).upper()}"
        now = datetime.now(timezone.utc)
        expires_at = (now + timedelta(minutes=duration_minutes)).isoformat()
        created_at = now.isoformat()

        conn = get_db()
        with conn:
            conn.execute(
                """
                INSERT INTO record_shares (
                    id, record_id, token_hash, expires_at, is_revoked, access_count, created_at
                ) VALUES (?, ?, ?, ?, 0, 0, ?)
                """,
                (share_id, record_id, token_hash, expires_at, created_at),
            )

        return {
            "share_id": share_id,
            "record_id": record_id,
            "token": raw_token,
            "expires_at": expires_at,
            "duration_minutes": duration_minutes,
            "share_url": f"/shared/{raw_token}",
        }

    @staticmethod
    def resolve_shared_record(raw_token: str) -> Optional[dict[str, Any]]:
        token_hash = hash_token(raw_token)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT * FROM record_shares
            WHERE token_hash = ?
            """,
            (token_hash,),
        )
        share = cur.fetchone()
        if not share:
            return None

        share_dict = dict(share)
        if share_dict["is_revoked"]:
            return {"error": "Token has been revoked by the patient", "status": 410}

        now = datetime.now(timezone.utc)
        expires_at = datetime.fromisoformat(share_dict["expires_at"])
        if now > expires_at:
            return {"error": "Sharing link has expired", "status": 410}

        # Increment access count
        with conn:
            conn.execute(
                "UPDATE record_shares SET access_count = access_count + 1 WHERE id = ?",
                (share_dict["id"],),
            )

        # Retrieve and return sanitized record
        rec = ScreeningService.get_screening(share_dict["record_id"])
        if not rec:
            return {"error": "Associated record is no longer available", "status": 404}

        return {
            "share": {
                "id": share_dict["id"],
                "expires_at": share_dict["expires_at"],
                "access_count": share_dict["access_count"] + 1,
            },
            "record": rec,
        }

    @staticmethod
    def revoke_share(share_id: str) -> bool:
        conn = get_db()
        with conn:
            cur = conn.execute(
                "UPDATE record_shares SET is_revoked = 1 WHERE id = ?",
                (share_id,),
            )
            return cur.rowcount > 0


def secrets_hex(nbytes: int) -> str:
    import secrets
    return secrets.token_hex(nbytes)
