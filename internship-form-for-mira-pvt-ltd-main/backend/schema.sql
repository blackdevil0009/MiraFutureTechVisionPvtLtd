-- Internship Application Database Schema
-- Database: SQLite (internship_applications.db)

CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL,
    degree TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    domain TEXT NOT NULL,
    skills TEXT NOT NULL,
    message TEXT NOT NULL,
    resume_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_email ON applications(email);
CREATE INDEX idx_college ON applications(college);
CREATE INDEX idx_domain ON applications(domain);
CREATE INDEX idx_created_at ON applications(created_at DESC);

-- Sample query to fetch all applications for a specific domain
-- SELECT * FROM applications WHERE domain = 'Python Development' ORDER BY created_at DESC;

-- Sample query to count applications by domain
-- SELECT domain, COUNT(*) as count FROM applications GROUP BY domain;

-- Sample query to find applications from a specific college
-- SELECT name, email, domain FROM applications WHERE college LIKE '%IIT%' ORDER BY created_at DESC;
