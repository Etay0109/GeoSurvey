from pydantic import BaseModel
from typing import Literal

class DeveloperRegister(BaseModel):
    name: str
    email: str
    password: str


class DeveloperLogin(BaseModel):
    name: str
    password: str

class OptionCreate(BaseModel):
    text: str


class QuestionCreate(BaseModel):
    text: str
    type: Literal["radio", "checkbox"]
    options: list[OptionCreate]


class SurveyCreate(BaseModel):
    title: str
    status: Literal["draft", "active", "done"] = "draft"
    location_enabled: bool = False
    developer_id: int | None = None
    questions: list[QuestionCreate]

# Represents a single answer selected by the user.
class ResponseCreate(BaseModel):
    survey_id: int
    question_id: int
    option_id: int
    region: str | None = None


# Represents a batch of responses sent together by the SDK.
class ResponseBatchCreate(BaseModel):
    responses: list[ResponseCreate]

class SurveyUpdate(BaseModel):
    title: str
    status: Literal["draft", "active", "done"]

class EngagementEventCreate(BaseModel):
    survey_id: int
    event_type: Literal[
        "opened",
        "completed",
        "abandoned"
    ]