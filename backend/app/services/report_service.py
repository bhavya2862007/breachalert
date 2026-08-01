from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)

from app.services.security_advisor import generate_security_advice


def generate_pdf(asset, breaches):
    """
    Generate a BreachAlert security report.
    Returns BytesIO buffer.
    """

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    title = Paragraph(
        "<font size=22><b>BreachAlert Security Report</b></font>",
        styles["Title"],
    )

    story.append(title)
    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            f"<b>Generated:</b> {datetime.now().strftime('%d %b %Y %H:%M')}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Asset:</b> {asset.label}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Last Scan:</b> {asset.last_scanned_at}",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 20))

    response_breaches = [
        {
            "name": breach.breach_name,
            "title": breach.breach_title,
            "date": breach.breach_date,
            "pwn_count": breach.pwn_count,
            "data_classes": breach.data_classes,
        }
        for breach in breaches
    ]

    advisor = generate_security_advice(response_breaches)

    story.append(
        Paragraph(
            "<font size=16><b>AI Security Assessment</b></font>",
            styles["Heading2"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Security Score:</b> {advisor['score']}/100",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Risk Level:</b> {advisor['risk']}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            advisor["summary"],
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<font size=16><b>Recommendations</b></font>",
            styles["Heading2"],
        )
    )

    for item in advisor["recommendations"]:
        story.append(
            Paragraph(f"• {item}", styles["Normal"])
        )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "<font size=16><b>Breach Details</b></font>",
            styles["Heading2"],
        )
    )

    if not breaches:

        story.append(
            Paragraph(
                "<font color='green'><b>No breaches detected.</b></font>",
                styles["Normal"],
            )
        )

    else:

        for breach in breaches:

            story.append(
                Paragraph(
                    f"<b>{breach.breach_title}</b>",
                    styles["Heading3"],
                )
            )

            story.append(
                Paragraph(
                    f"Date: {breach.breach_date}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Pwn Count: {breach.pwn_count:,}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    "Exposed Data: "
                    + ", ".join(breach.data_classes),
                    styles["Normal"],
                )
            )

            story.append(Spacer(1, 12))

    doc.build(story)

    buffer.seek(0)

    return buffer