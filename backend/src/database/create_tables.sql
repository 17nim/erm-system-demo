-- Create the 'risks' table
CREATE TABLE
    IF NOT EXISTS risks (
        id SERIAL PRIMARY KEY,
        period VARCHAR(5) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_id SMALLINT,
        company_code VARCHAR(5) NOT NULL,
        division VARCHAR(5) NOT NULL,
        owner_id VARCHAR(10) NOT NULL,
        inherent_likelihood SMALLINT check (inherent_likelihood between 1 and 5),
        inherent_impact SMALLINT check (inherent_impact between 1 and 5),
        residual_likelihood SMALLINT check (residual_likelihood between 1 and 5),
        residual_impact SMALLINT check (residual_impact between 1 and 5),
        effectiveness SMALLINT check (effectiveness between 1 and 25),
        risk_event VARCHAR(255),
        causes TEXT[],
        pre_event_mitigations TEXT[],
        post_event_mitigations TEXT[],
        consequences TEXT[],
        description TEXT,
        created_at TIMESTAMP default CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        approved_at TIMESTAMP,
        status VARCHAR(10) check (status in ('draft', 'completed', 'verified', 'approved')) default 'draft',
        check (
            (residual_likelihood * residual_impact) <= (inherent_likelihood * inherent_impact)
        )
    );

-- Create the function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the update function
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes to 'approved' and approved_at is not yet set
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
        NEW.approved_at := NOW();
    END IF;

    -- If status changes to anything other than 'approved'
    IF (NEW.status IS DISTINCT FROM 'approved') THEN 
        NEW.approved_at := null; 
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the update function
CREATE TRIGGER trigger_set_approved_at
BEFORE UPDATE ON risks
FOR EACH ROW
EXECUTE FUNCTION set_approved_at();

-- Create the 'periods' table
CREATE TABLE
    IF NOT EXISTS periods (
        id SERIAL PRIMARY KEY,
        company_code VARCHAR(5) NOT NULL,
        period VARCHAR(5) NOT NULL,
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL default TRUE,
        UNIQUE (company_code, period),
        CHECK (end_date >= start_date)
    );

CREATE OR REPLACE FUNCTION set_is_active()
RETURNS TRIGGER AS $$
BEGIN
    -- If new row is set to active
    IF NEW.is_active = TRUE THEN
        -- Set all other rows for the same company to inactive
        UPDATE periods
        SET is_active = FALSE
        WHERE company_code = NEW.company_code
          AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_is_active
BEFORE INSERT OR UPDATE ON periods
FOR EACH ROW
EXECUTE FUNCTION set_is_active();

-- Create the 'users' table
CREATE TABLE public.users (
	id varchar(10) NOT NULL,
	first_name varchar(50) NULL,
	last_name varchar(50) NULL,
	email varchar(100) NOT NULL,
	"role" varchar(10) NOT NULL,
	company_code varchar(5) NOT NULL,
	division varchar(5) NOT NULL,
	password_hash text NULL,
	"position" varchar(5) NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'approver'::character varying, 'admin'::character varying])::text[])))
);

-- Create the 'divisions' table
CREATE TABLE
    IF NOT EXISTS divisions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        abbreviation VARCHAR(5) NOT NULL,
        company_code VARCHAR(10) NOT NULL,
        UNIQUE (company_code, abbreviation)
    );

-- Create the 'categories' table
CREATE TABLE
    IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        company_code VARCHAR(10) NOT NULL,
        UNIQUE (company_code, name)
    );

-- Create the 'companies' table
CREATE TABLE
    IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        code VARCHAR(5) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL
    );

-- Create the 'heatmap_colors' table
CREATE TABLE
    IF NOT EXISTS heatmap_colors (
        id SERIAL PRIMARY KEY,
        likelihood SMALLINT NOT null check (likelihood between 1 and 5),
        impact SMALLINT NOT null check (impact between 1 and 5),
        color VARCHAR(15) not null,
        company_code VARCHAR(10) NOT NULL
    );

-- Create the 'labels' table
CREATE TABLE
    IF NOT EXISTS labels (
        id SERIAL PRIMARY KEY,
        type VARCHAR(10) not NULL check (type in ('likelihood', 'impact')),
        score SMALLINT NOT null check (score between 1 and 5),
        label VARCHAR(30) not null,
        company_code VARCHAR(10) NOT NULL,
        UNIQUE (company_code, label)
    );

-- Define foreign keys
ALTER TABLE risks ADD FOREIGN KEY (company_code) REFERENCES companies (code);
ALTER TABLE risks ADD FOREIGN KEY (company_code, period) REFERENCES periods (company_code, period);
ALTER TABLE risks ADD FOREIGN KEY (category_id) REFERENCES categories (id);
ALTER TABLE risks ADD FOREIGN KEY (company_code, division) REFERENCES divisions (company_code, abbreviation);
ALTER TABLE risks ADD FOREIGN KEY (owner_id) REFERENCES users (id);

ALTER TABLE periods ADD FOREIGN KEY (company_code) REFERENCES companies (code);

ALTER TABLE users ADD FOREIGN KEY (company_code, division) REFERENCES divisions (company_code, abbreviation);
ALTER TABLE users ADD FOREIGN KEY (company_code) REFERENCES companies (code);

ALTER TABLE divisions ADD FOREIGN KEY (company_code) REFERENCES companies (code);

ALTER TABLE categories ADD FOREIGN KEY (company_code) REFERENCES companies (code);

ALTER TABLE heatmap_colors ADD FOREIGN KEY (company_code) REFERENCES companies (code);

ALTER TABLE labels ADD FOREIGN KEY (company_code) REFERENCES companies (code);
