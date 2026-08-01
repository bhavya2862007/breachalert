from typing import List


def generate_security_advice(breaches: List[dict]) -> dict:
    if not breaches:
        return {
            "score": 100,
            "risk": "Low",
            "summary": (
                "Great news! No known breaches were found for this email."
            ),
            "recommendations": [
                "Keep using unique passwords.",
                "Enable Multi-Factor Authentication.",
                "Continue monitoring your accounts regularly.",
            ],
        }

    score = max(0, 100 - len(breaches) * 20)

    risk = (
        "Low"
        if score >= 80
        else "Medium"
        if score >= 50
        else "High"
    )

    recommendations = [
        "Change the password for affected accounts immediately.",
        "Enable Multi-Factor Authentication (MFA).",
        "Avoid reusing passwords across websites.",
        "Use a password manager to generate strong passwords.",
        "Monitor your accounts for suspicious activity.",
    ]

    return {
        "score": score,
        "risk": risk,
        "summary": (
            f"{len(breaches)} known breach(s) were detected. "
            "If the same password was reused elsewhere, "
            "those accounts may also be at risk."
        ),
        "recommendations": recommendations,
    }