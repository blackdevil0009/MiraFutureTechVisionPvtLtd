-- Create Database
CREATE DATABASE IF NOT EXISTS mira_internship;
USE mira_internship;

-- Create Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    skills TEXT NOT NULL,
    resume_link TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
