CREATE TABLE surveys (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    status      VARCHAR(10)  NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'done')),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id          SERIAL PRIMARY KEY,
    survey_id   INT          NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    text        TEXT         NOT NULL,
    type        VARCHAR(10)  NOT NULL CHECK (type IN ('radio', 'checkbox')),
    "order"     INT          NOT NULL DEFAULT 0
);

CREATE TABLE survey_options (
    id          SERIAL PRIMARY KEY,
    question_id INT          NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text        TEXT         NOT NULL,
    "order"     INT          NOT NULL DEFAULT 0
);

CREATE TABLE responses (
    id          SERIAL PRIMARY KEY,
    survey_id   INT          NOT NULL REFERENCES surveys(id)        ON DELETE CASCADE,
    question_id INT          NOT NULL REFERENCES questions(id)       ON DELETE CASCADE,
    option_id   INT          NOT NULL REFERENCES survey_options(id)  ON DELETE CASCADE,
    region      VARCHAR(100),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE engagement_events (
    id          SERIAL PRIMARY KEY,
    survey_id   INT          NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    event_type  VARCHAR(15)  NOT NULL
                    CHECK (event_type IN ('opened', 'completed', 'abandoned')),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_survey
ON responses(survey_id);

CREATE INDEX idx_responses_region
ON responses(region);

CREATE INDEX idx_responses_created
ON responses(created_at);