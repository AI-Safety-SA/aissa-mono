# Database Schema

**Person**

- `person_id` (PK)
- `email` TEXT UNIQUE NOT NULL,
- `full_name` TEXT NOT NULL,
- `preferred_name` TEXT,
- `bio` TEXT,
- `website_url` TEXT,
- `headshot_url` TEXT,
- `joined_at` DATE NOT NULL DEFAULT CURRENT_DATE,
- `is_published` BOOLEAN DEFAULT FALSE,
- `hightlight` BOOLEAN DEFAULT FALSE,
- `featured_story` TEXT,
- `metadata` JSONB, -- For future fields: skills, career_transitions, etc.
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW(),
- `CONSTRAINT persons_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')`

**Project**

- `project_id` (PK)
- `program_id` (FK) Nullable (0-many) -- optional, if a project done during or for a program (hackathons, fellowships, aisf courses)
- `slug` TEXT UNIQUE NOT NULL,
- `title` TEXT NOT NULL,
- `type` TEXT NOT NULL, -- 'research_paper', 'bounty_submission', 'grant_award', 'software_tool'
- `project_status` TEXT DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'accepted', 'published'
- `link_url` TEXT,
- `repository_url` TEXT,
- `is_published` BOOLEAN DEFAULT FALSE,
- `metadata` JSONB, -- Store authors array, venue, grant_amount, etc.
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Organisation**

- `organisation_id` (PK)
- `name` TEXT NOT NULL,
- `type` TEXT, -- 'university', 'corporate', 'nonprofit', 'government'
- `website` TEXT,
- `description` TEXT,
- `is_partnership_active` BOOLEAN DEFAULT FALSE,
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Partnership**

- `partnership_id` (PK)
- `organisation_id` (FK) Not Null (1-many)
- `type` TEXT NOT NULL, -- 'venue', 'funding', 'collaboration', 'media'
- `description` TEXT,
- `start_date` DATE,
- `end_date` DATE, -- optional
- `is_active` BOOLEAN DEFAULT TRUE,
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Program**

- `program_id` (PK)
- `partnership_id` (FK) Nullable (0-many)
- `slug` TEXT UNIQUE NOT NULL, -- For URL routing: 'aisf-june-2025'
- `name` TEXT NOT NULL,
- `type` TEXT NOT NULL, -- 'fellowship', 'course', 'coworking', 'volunteer_program'
- `description` TEXT,
- `start_date` DATE,
- `end_date` DATE,
- `is_published` BOOLEAN DEFAULT FALSE,
- `metadata` JSONB, -- Store curriculum links, application_counts, etc.
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Cohort**

- `cohort_id` (PK)
- `program_id` (FK) Not Null (1-many)
- `name` TEXT NOT NULL, -- "Q2 2025 Cohort"
- `slug` TEXT UNIQUE NOT NULL, -- For URL routing
- `application_count` INTEGER,
- `accepted_count` INTEGER,
- `completion_count` INTEGER,
- `completion_rate` DECIMAL(5,2), -- Calculated percentage
- `average_rating` DECIMAL(3,2),
- `dropout_rate` DECIMAL(5,2),
- `start_date` DATE NOT NULL,
- `end_date` DATE,
- `is_published` BOOLEAN DEFAULT FALSE,
- `metadata` JSONB, -- Store facilitator_notes, curriculum_version, etc.
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Event**

- `event_id` (PK)
- `organiser_person_id` (FK) Not Null (1-many)
- `slug` TEXT UNIQUE NOT NULL,
- `name` TEXT NOT NULL,
- `type` TEXT NOT NULL, -- 'workshop', 'talk', 'meetup', 'reading_group', 'retreat', 'panel'
- `event_date` TIMESTAMPTZ NOT NULL,
- `attendance_count` INTEGER,
- `location` TEXT, -- 'innovation_city', 'wits_university', 'online'
- `organizer_id` UUID REFERENCES persons(id),
- `is_published` BOOLEAN DEFAULT FALSE,
- `metadata` JSONB, -- Store panelists, feedback_scores, venue_details, etc.
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Event_Hosts** _(Junction table for Many-to-Many between Event and Person)_

- `event_id` (FK, PK Composite) Not Null (1-many)
- `person_id` (FK, PK Composite) Not Null (1-many)

**Project_Contributor** _(Junction table for Many-to-Many between Project and Person)_

- `project_id` (FK, PK Composite) Not Null (1-many)
- `person_id` (FK, PK Composite) Not Null (1-many)
- `role` TEXT NOT NULL, -- 'lead_author', 'co_author', 'contributor', 'advisor'

**Engagement**

- `engagement_id` (PK)
- `person_id` (FK) Not Null (1-many)
- `event_id` (FK) Nullable (0-many)
- `program_id` (FK) Nullable (0-many)
- `cohort_id` (FK) Nullable (0-many)
- `type` TEXT NOT NULL, -- 'participant', 'facilitator', 'speaker', 'volunteer', 'organizer', 'mentor'
- `start_date` DATE,
- `end_date` DATE,
- `rating` INTEGER CHECK (rating BETWEEN 1 AND 10),
- `would_recommend` INTEGER CHECK (rating BETWEEN 1 AND 10),
- `engagement_status` TEXT, -- 'completed', 'dropped_out', 'in_progress', 'withdrawn'. 'attended'
- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

-- Ensure each engagement is tied to at least one context

CONSTRAINT engagements_has_context CHECK (

(program_id IS NOT NULL)::int +

(cohort_id IS NOT NULL)::int +

(event_id IS NOT NULL)::int >= 1

)

**Engagement_Impact**

- `impact_id` (PK)
- `person_id` (FK) Not Null (1-many)
- `engagement_id` (FK) Nullable (0-many) -- Linked to a specific AISSA intervention (Optional)
- `affiliated_organisation_id` (FK) Nullable (0-many) -- Only fill this if it's an organization we want to track stats for
- `type` impact_type NOT NULL,
- `summary` TEXT NOT NULL, -- The Story (Text is King)
- `evidence_url` TEXT,
- `is_verified` BOOLEAN DEFAULT FALSE,
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- Explicit impact tracking for verified outcomes

CREATE TYPE impact_type AS ENUM (

'career_transition',

'research_contribution',

'community_building',

'grant_awarded',

'publication',

'educational', -- e.g. "Accepted into MATS"

'community' -- e.g. "Founded a university group"

);

**Testimonials**

- `testimonial_id` (PK)
- `person_id` (FK) Not Null (1-many)
- `program_id` (FK) Nullable (0-many)
- `event_id` (FK) Nullable (0-many)
- `cohort_id` (FK) Nullable (0-many)
- `quote` TEXT NOT NULL,
- `attribution_name` TEXT,
- `attribution_title` TEXT,
- `rating` INTEGER CHECK (rating BETWEEN 1 AND 10),
- `is_published` BOOLEAN DEFAULT FALSE,
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
