INSERT INTO
    public.companies (code, "name")
VALUES
    ('TEST', 'Test Co., Ltd.');

INSERT INTO
    public.divisions ("name", abbreviation, company_code)
VALUES
    ('Compliance & Risk Management', 'CRM', 'TEST'),
    ('Information Technology', 'IT', 'TEST');

INSERT INTO
    public.labels ("type", score, "label", company_code)
VALUES
    ('likelihood', 1, 'Rare', 'TEST'),
    ('likelihood', 2, 'Unlikely', 'TEST'),
    ('likelihood', 3, 'Possible', 'TEST'),
    ('likelihood', 4, 'Likely', 'TEST'),
    ('likelihood', 5, 'Almost Certain', 'TEST'),
    ('impact', 1, 'Insignificant', 'TEST'),
    ('impact', 2, 'Minor', 'TEST'),
    ('impact', 3, 'Moderate', 'TEST'),
    ('impact', 4, 'Major', 'TEST'),
    ('impact', 5, 'Extreme', 'TEST');

INSERT INTO
    public.categories ("name", company_code)
VALUES
    ('Emerging', 'TEST'),
    ('Financial', 'TEST'),
    ('Human Rights', 'TEST'),
    ('Legal & Compliance', 'TEST'),
    ('Operational', 'TEST'),
    ('Strategic', 'TEST');

INSERT INTO
    public.heatmap_colors (likelihood, impact, color, company_code)
SELECT
    likelihood,
    impact,
    color,
    'TEST'
FROM
    generate_series (1, 5) AS likelihood (likelihood)
    CROSS JOIN (
        VALUES
            (1, 'sky'),
            (2, 'emerald'),
            (3, 'lime'),
            (4, 'yellow'),
            (5, 'orange')
    ) AS impacts (impact, color);