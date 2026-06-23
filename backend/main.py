from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from passlib.context import CryptContext

from database import engine, get_db
from models import Survey, Question, SurveyOption, Response, EngagementEvent, Developer, SurveyAnalyticsSummary
from schemas import SurveyCreate, ResponseBatchCreate, SurveyUpdate, EngagementEventCreate, DeveloperLogin, DeveloperRegister

app = FastAPI(title="GeoSurvey API")

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

# CORS configuration to allow requests from the frontend running on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "GeoSurvey API is running"
    }


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT NOW()"))
        current_time = result.scalar()

    return {
        "database": "connected",
        "time": str(current_time)
    }

@app.post("/developers/register")
def developer_register(
    developer: DeveloperRegister,
    db: Session = Depends(get_db)
):
    existing_developer = (
        db.query(Developer)
        .filter(Developer.email == developer.email)
        .first()
    )

    if existing_developer:
        raise HTTPException(
            status_code=400,
            detail="Developer with this email already exists"
        )

    new_developer = Developer(
        name=developer.name,
        email=developer.email,
        password=hash_password(developer.password)
    )

    db.add(new_developer)
    db.commit()
    db.refresh(new_developer)

    return {
        "id": new_developer.id,
        "name": new_developer.name,
        "email": new_developer.email
    }


@app.post("/developers/login")
def developer_login(
    developer: DeveloperLogin,
    db: Session = Depends(get_db)
):
    existing_developer = (
        db.query(Developer)
        .filter(Developer.email == developer.email)
        .first()
    )

    if existing_developer is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        developer.password,
        existing_developer.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "id": existing_developer.id,
        "name": existing_developer.name,
        "email": existing_developer.email
    }

def normalize_region(region):
    if region is None or region == "Unknown":
        return "Unknown"

    if region == "Center District":
        return "Center"

    if region == "Northern District":
        return "North"

    if region == "Southern District":
        return "South"

    if region == "Jerusalem District":
        return "Jerusalem"

    return "Unknown"

def get_or_create_summary(db: Session, survey_id: int):
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

# Creates a new survey with its questions and answer options.
# stores it in PostgreSQL, and returns the created survey details.
@app.post("/surveys")
def create_survey(
    survey: SurveyCreate,
    db: Session = Depends(get_db)
):
    new_survey = Survey(
        title=survey.title,
        status=survey.status,
        location_enabled=survey.location_enabled,
        developer_id=survey.developer_id
    )

    for question_index, question in enumerate(survey.questions):
        new_question = Question(
            text=question.text,
            type=question.type,
            order=question_index
        )

        for option_index, option in enumerate(question.options):
            new_option = SurveyOption(
                text=option.text,
                order=option_index
            )

            new_question.options.append(new_option)

        new_survey.questions.append(new_question)

    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)

    return {
    "id": new_survey.id,
    "title": new_survey.title,
    "status": new_survey.status,
    "location_enabled": new_survey.location_enabled,
    "developer_id": new_survey.developer_id,
    "message": "Survey created successfully"
    }

# Returns all surveys for the developer portal.
@app.get("/surveys")
def get_all_surveys(
    developer_id: int,
    db: Session = Depends(get_db)
):
    surveys = (
        db.query(Survey)
        .filter(Survey.developer_id == developer_id)
        .all()
    )

    return [
        {
            "id": survey.id,
            "title": survey.title,
            "status": survey.status,
            "location_enabled": survey.location_enabled,
            "created_at": survey.created_at,
            "developer_id": survey.developer_id
        }
        for survey in surveys
    ]

# This endpoint will be used by the SDK to load and display a survey.
@app.get("/surveys/{survey_id}")
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    if survey.status != "active":
        raise HTTPException(
            status_code=403,
            detail="Survey is not active"
        )

    return {
        "id": survey.id,
        "title": survey.title,
        "status": survey.status,
        "location_enabled": survey.location_enabled,
        "questions": [
            {
                "id": question.id,
                "text": question.text,
                "type": question.type,
                "order": question.order,
                "options": [
                    {
                        "id": option.id,
                        "text": option.text,
                        "order": option.order
                    }
                    for option in question.options
                ]
            }
            for question in survey.questions
        ]
    }

# Receives a batch of survey responses from the SDK and stores them in the database.
@app.post("/responses/batch")
def save_responses(
    batch: ResponseBatchCreate,
    db: Session = Depends(get_db)
):
    if not batch.responses:
        return {
            "message": "No responses to save",
            "count": 0
        }

    survey_id = batch.responses[0].survey_id

    for response in batch.responses:
        new_response = Response(
            survey_id=response.survey_id,
            question_id=response.question_id,
            option_id=response.option_id,
            region=response.region
        )

        db.add(new_response)

    summary = get_or_create_summary(
        db,
        survey_id
    )

    summary.total_responses += 1

    db.commit()

    return {
        "message": "Responses saved successfully",
        "count": len(batch.responses)
    }

# Receives an engagement event from the SDK and stores it in the database.
@app.post("/engagement-events")
def save_engagement_event(
    event: EngagementEventCreate,
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == event.survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    new_event = EngagementEvent(
        survey_id=event.survey_id,
        event_type=event.event_type
    )

    db.add(new_event)

    summary = get_or_create_summary(db, event.survey_id)

    if event.event_type == "opened":
        summary.opened_count += 1
    elif event.event_type == "completed":
        summary.completed_count += 1
    elif event.event_type == "abandoned":
        summary.abandoned_count += 1

    db.commit()
    db.refresh(new_event)

    return {
        "id": new_event.id,
        "survey_id": new_event.survey_id,
        "event_type": new_event.event_type,
        "message": "Engagement event saved successfully"
    }

# Counts how many times each answer option was selected.
@app.get("/analytics/results/{survey_id}")
def get_survey_results(
    survey_id: int,
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            SurveyOption.id,
            SurveyOption.text,
            func.count(Response.id).label("count")
        )
        .join(Response, Response.option_id == SurveyOption.id, isouter=True)
        .join(Question, Question.id == SurveyOption.question_id)
        .filter(Question.survey_id == survey_id)
        .group_by(SurveyOption.id, SurveyOption.text)
        .all()
    )

    return {
        "survey_id": survey_id,
        "results": [
            {
                "option_id": option_id,
                "option_text": option_text,
                "count": count
            }
            for option_id, option_text, count in results
        ]
    }

# Returns geographic distribution of responses for a specific survey.
# Only responses that include a region are counted.
@app.get("/analytics/regions/{survey_id}")
def get_region_analytics(
    survey_id: int,
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            Response.region,
            func.count(Response.id).label("count")
        )
        .filter(Response.survey_id == survey_id)
        .filter(Response.region.isnot(None))
        .group_by(Response.region)
        .all()
    )

    return {
        "survey_id": survey_id,
        "regions": [
            {
                "region": region,
                "count": count
            }
            for region, count in results
        ]
    }


# Returns engagement analytics for a specific survey.
@app.get("/analytics/engagement/{survey_id}")
def get_engagement_analytics(
    survey_id: int,
    db: Session = Depends(get_db)
):
    summary = get_or_create_summary(db, survey_id)

    opened_count = summary.opened_count
    completed_count = summary.completed_count
    abandoned_count = summary.abandoned_count

    if opened_count == 0:
        completion_rate = 0
    else:
        completion_rate = (completed_count / opened_count) * 100

    return {
        "survey_id": survey_id,
        "opened": opened_count,
        "completed": completed_count,
        "abandoned": abandoned_count,
        "completion_rate": completion_rate
    }

# Returns all analytics data for the developer portal dashboard
@app.get("/analytics/surveys/{survey_id}/dashboard")
def get_survey_dashboard(
    survey_id: int,
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    summary = get_or_create_summary(db, survey_id)

    opened_count = summary.opened_count
    completed_count = summary.completed_count
    abandoned_count = summary.abandoned_count
    total_responses = summary.total_responses

    completion_rate = 0
    if opened_count > 0:
        completion_rate = (completed_count / opened_count) * 100

    region_results = (
        db.query(
            Response.region,
            func.count(Response.id).label("count")
        )
        .filter(Response.survey_id == survey_id)
        .filter(Response.region.isnot(None))
        .group_by(Response.region)
        .all()
    )

    geo_enabled = survey.location_enabled

    question_results = (
        db.query(
            Question.id,
            Question.text,
            Question.order,
            SurveyOption.id,
            SurveyOption.text,
            SurveyOption.order,
            func.count(Response.id).label("count")
        )
        .join(SurveyOption, SurveyOption.question_id == Question.id)
        .join(Response, Response.option_id == SurveyOption.id, isouter=True)
        .filter(Question.survey_id == survey_id)
        .group_by(
            Question.id,
            Question.text,
            Question.order,
            SurveyOption.id,
            SurveyOption.text,
            SurveyOption.order
        )
        .order_by(Question.order, SurveyOption.order)
        .all()
    )

    questions_map = {}

    for (
        question_id,
        question_text,
        question_order,
        option_id,
        option_text,
        option_order,
        count
    ) in question_results:

        if question_id not in questions_map:
            questions_map[question_id] = {
                "question_id": question_id,
                "question_text": question_text,
                "question_order": question_order,
                "options": []
            }

        region_counts = (
            db.query(
                Response.region,
                func.count(Response.id).label("count")
            )
            .filter(Response.survey_id == survey_id)
            .filter(Response.option_id == option_id)
            .filter(Response.region.isnot(None))
            .group_by(Response.region)
            .all()
        )

        by_region = {
            "Center": 0,
            "North": 0,
            "South": 0,
            "Jerusalem": 0
        }

        for region, region_count in region_counts:
            normalized_region = normalize_region(region)

            if normalized_region in by_region:
                by_region[normalized_region] += region_count

        questions_map[question_id]["options"].append({
            "option_id": option_id,
            "option_text": option_text,
            "option_order": option_order,
            "count": count,
            "by_region": by_region
        })

    sorted_questions = sorted(
        questions_map.values(),
        key=lambda question: question["question_order"]
    )

    for question in sorted_questions:
        question["options"] = sorted(
            question["options"],
            key=lambda option: option["option_order"]
        )

    return {
        "survey": {
            "id": survey.id,
            "title": survey.title,
            "status": survey.status
        },
        "summary": {
            "total_responses": total_responses,
            "opened": opened_count,
            "completed": completed_count,
            "abandoned": abandoned_count,
            "completion_rate": completion_rate
        },
        "geo_enabled": geo_enabled,
        "regions": [
            {
                "region": region,
                "count": count
            }
            for region, count in region_results
        ],
        "questions": sorted_questions
    }

# This endpoint updates only the survey title and status.
@app.put("/surveys/{survey_id}")
def update_survey(
    survey_id: int,
    survey_update: SurveyUpdate,
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    survey.title = survey_update.title
    survey.status = survey_update.status

    db.commit()
    db.refresh(survey)

    return {
        "id": survey.id,
        "title": survey.title,
        "status": survey.status,
        "message": "Survey updated successfully"
    }

# Publishes an existing survey by changing its status to active.
@app.put("/surveys/{survey_id}/publish")
def publish_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    survey.status = "active"

    db.commit()
    db.refresh(survey)

    return {
        "id": survey.id,
        "title": survey.title,
        "status": survey.status,
        "message": "Survey published successfully"
    }


# Marks an existing survey as done instead of deleting it permanently.
# This keeps historical data and analytics available.
@app.delete("/surveys/{survey_id}")
def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    survey.status = "done"

    db.commit()
    db.refresh(survey)

    return {
        "id": survey.id,
        "title": survey.title,
        "status": survey.status,
        "message": "Survey marked as done successfully"
    }