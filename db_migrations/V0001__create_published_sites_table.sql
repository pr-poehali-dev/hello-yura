CREATE TABLE IF NOT EXISTS published_sites (
    id SERIAL PRIMARY KEY,
    site_id VARCHAR(12) UNIQUE NOT NULL,
    project_name VARCHAR(255),
    html_content TEXT NOT NULL,
    css_content TEXT,
    js_content TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INTEGER DEFAULT 0
);

CREATE INDEX idx_site_id ON published_sites(site_id);
CREATE INDEX idx_created_at ON published_sites(created_at DESC);