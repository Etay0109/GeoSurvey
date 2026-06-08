from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


from database import Base


# Represents a survey stored in the database.
class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(10), nullable=False)
    location_enabled = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())

    questions = relationship(
        "Question",
        back_populates="survey",
        cascade="all, delete-orphan"
    )


# Represents a survey question in the database.
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(
        Integer,
        ForeignKey("surveys.id", ondelete="CASCADE"),
        nullable=False
    )
    text = Column(Text, nullable=False)
    type = Column(String(10), nullable=False)
    order = Column(Integer, nullable=False, default=0)

    survey = relationship(
        "Survey",
        back_populates="questions"
    )

    options = relationship(
        "SurveyOption",
        back_populates="question",
        cascade="all, delete-orphan"
    )

# Represents an answer option for a survey question in the database.
class SurveyOption(Base):
    __tablename__ = "survey_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(
        Integer,
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False
    )
    text = Column(Text, nullable=False)
    order = Column(Integer, nullable=False, default=0)

    question = relationship(
        "Question",
        back_populates="options"
    )

# Represents a user's response to a survey question in the database.
class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)

    survey_id = Column(
        Integer,
        ForeignKey("surveys.id", ondelete="CASCADE"),
        nullable=False
    )

    question_id = Column(
        Integer,
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False
    )

    option_id = Column(
        Integer,
        ForeignKey("survey_options.id", ondelete="CASCADE"),
        nullable=False
    )

    region = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

# Represents a user engagement event related to a survey in the database.
class EngagementEvent(Base):
    __tablename__ = "engagement_events"

    id = Column(Integer, primary_key=True, index=True)

    survey_id = Column(
        Integer,
        ForeignKey("surveys.id", ondelete="CASCADE"),
        nullable=False
    )

    event_type = Column(String(15), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
