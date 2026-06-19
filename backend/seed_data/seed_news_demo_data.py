import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import (
    Response,
    EngagementEvent,
    SurveyAnalyticsSummary
)



SURVEY_ID = 13
QUESTION_ID = 16

OPENED_COUNT = 120
COMPLETED_COUNT = 96
ABANDONED_COUNT = 24

OPTION_COUNTS = {
    45: 48,  # Politics
    46: 30,  # Economy
    47: 24,  # Technology
    48: 18,  # Sports
}

RESET_EXISTING_DATA = True


def get_or_create_summary(db, survey_id):
    summary = (
        db.query(SurveyAnalyticsSummary)
        .filter(SurveyAnalyticsSummary.survey_id == survey_id)
        .first()
    )

    if summary is None:
        summary = SurveyAnalyticsSummary(survey_id=survey_id)
        db.add(summary)
        db.flush()

    return summary


def main():
    db = SessionLocal()

    try:
        if RESET_EXISTING_DATA:
            db.query(Response).filter(
                Response.survey_id == SURVEY_ID
            ).delete()

            db.query(EngagementEvent).filter(
                EngagementEvent.survey_id == SURVEY_ID
            ).delete()

            summary = get_or_create_summary(db, SURVEY_ID)
            summary.opened_count = 0
            summary.completed_count = 0
            summary.abandoned_count = 0
            summary.total_responses = 0

            db.commit()

        for _ in range(OPENED_COUNT):
            db.add(EngagementEvent(
                survey_id=SURVEY_ID,
                event_type="opened"
            ))

        for _ in range(COMPLETED_COUNT):
            db.add(EngagementEvent(
                survey_id=SURVEY_ID,
                event_type="completed"
            ))

        for _ in range(ABANDONED_COUNT):
            db.add(EngagementEvent(
                survey_id=SURVEY_ID,
                event_type="abandoned"
            ))

        response_rows = 0

        for option_id, count in OPTION_COUNTS.items():
            for _ in range(count):
                db.add(Response(
                    survey_id=SURVEY_ID,
                    question_id=QUESTION_ID,
                    option_id=option_id,
                    region=None
                ))

                response_rows += 1

        summary = get_or_create_summary(db, SURVEY_ID)
        summary.opened_count = OPENED_COUNT
        summary.completed_count = COMPLETED_COUNT
        summary.abandoned_count = ABANDONED_COUNT
        summary.total_responses = COMPLETED_COUNT

        db.commit()

        print("News demo data inserted successfully")
        print(f"Survey ID: {SURVEY_ID}")
        print(f"Opened: {OPENED_COUNT}")
        print(f"Completed: {COMPLETED_COUNT}")
        print(f"Abandoned: {ABANDONED_COUNT}")
        print(f"Total responses/users: {COMPLETED_COUNT}")
        print(f"Response rows: {response_rows}")

    finally:
        db.close()


if __name__ == "__main__":
    main()