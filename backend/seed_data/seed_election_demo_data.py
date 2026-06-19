import random
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import (
    Survey,
    Response,
    EngagementEvent,
    SurveyAnalyticsSummary
)


SURVEY_ID = 12
NUMBER_OF_USERS = 120

REGIONS = [
    "Center District",
    "Northern District",
    "Southern District",
    "Jerusalem District"
]

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


def choose_option(question, region):
    option_texts = {
        option.text: option
        for option in question.options
    }

    if "Prime Minister" in question.text:
        if region == "Center District":
            weights = {
                "Naftali Bennett": 42,
                "Benjamin Netanyahu": 35,
                "Benny Gantz": 10,
                "Undecided": 13
            }
        elif region == "Southern District":
            weights = {
                "Benjamin Netanyahu": 46,
                "Naftali Bennett": 34,
                "Benny Gantz": 7,
                "Undecided": 13
            }
        elif region == "Northern District":
            weights = {
                "Naftali Bennett": 38,
                "Benjamin Netanyahu": 36,
                "Benny Gantz": 10,
                "Undecided": 16
            }
        else:
            weights = {
                "Benjamin Netanyahu": 44,
                "Naftali Bennett": 33,
                "Benny Gantz": 8,
                "Undecided": 15
            }

    else:
        if region == "Center District":
            weights = {
                "Cost of living": 38,
                "Security and defense": 30,
                "Healthcare": 17,
                "Education": 15
            }
        elif region == "Southern District":
            weights = {
                "Security and defense": 44,
                "Cost of living": 30,
                "Education": 14,
                "Healthcare": 12
            }
        elif region == "Northern District":
            weights = {
                "Cost of living": 35,
                "Security and defense": 32,
                "Education": 18,
                "Healthcare": 15
            }
        else:
            weights = {
                "Security and defense": 40,
                "Cost of living": 28,
                "Education": 17,
                "Healthcare": 15
            }

    available_options = []
    available_weights = []

    for text, weight in weights.items():
        if text in option_texts:
            available_options.append(option_texts[text])
            available_weights.append(weight)

    return random.choices(
        available_options,
        weights=available_weights,
        k=1
    )[0]


def main():
    db = SessionLocal()

    try:
        survey = (
            db.query(Survey)
            .filter(Survey.id == SURVEY_ID)
            .first()
        )

        if survey is None:
            print(f"Survey {SURVEY_ID} not found")
            return

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

        summary = get_or_create_summary(db, SURVEY_ID)

        opened_count = NUMBER_OF_USERS
        completed_count = int(NUMBER_OF_USERS * 0.82)
        abandoned_count = opened_count - completed_count

        for _ in range(opened_count):
            db.add(EngagementEvent(
                survey_id=SURVEY_ID,
                event_type="opened"
            ))

        for _ in range(completed_count):
            db.add(EngagementEvent(
                survey_id=SURVEY_ID,
                event_type="completed"
            ))

        for _ in range(abandoned_count):
            db.add(EngagementEvent(
                survey_id=SURVEY_ID,
                event_type="abandoned"
            ))

        response_rows = 0

        for _ in range(completed_count):
            region = random.choice(REGIONS)

            for question in survey.questions:
                selected_option = choose_option(question, region)

                db.add(Response(
                    survey_id=SURVEY_ID,
                    question_id=question.id,
                    option_id=selected_option.id,
                    region=region
                ))

                response_rows += 1

        summary.opened_count = opened_count
        summary.completed_count = completed_count
        summary.abandoned_count = abandoned_count
        summary.total_responses = completed_count

        db.commit()

        print("Demo data inserted successfully")
        print(f"Survey: {survey.title}")
        print(f"Opened: {opened_count}")
        print(f"Completed: {completed_count}")
        print(f"Abandoned: {abandoned_count}")
        print(f"Total responses/users: {completed_count}")
        print(f"Response rows: {response_rows}")

    finally:
        db.close()


if __name__ == "__main__":
    main()