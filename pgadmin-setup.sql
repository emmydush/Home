-- SQL script to create database and tables for Household Workers Platform
-- Run this script in pgAdmin

-- First, create the database (if not exists)
-- Note: In pgAdmin, you might need to run this separately or use the GUI to create the database
-- CREATE DATABASE household_workers;

-- Then connect to the household_workers database and run the following:

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- Users table (Employers, Workers, Admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('employer', 'worker', 'admin', 'agency')),
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE
);

-- Worker profiles
CREATE TABLE IF NOT EXISTS worker_profiles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills JSONB,
    languages VARCHAR(255)[],
    hourly_rate DECIMAL(10, 2),
    service_categories JSONB,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    PRIMARY KEY (user_id)
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    street VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100)
);

-- Availability slots
CREATE TABLE IF NOT EXISTS availability_slots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME,
    end_time TIME,
    recurring BOOLEAN DEFAULT FALSE
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(100),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    address_id INTEGER REFERENCES addresses(id),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'filled', 'in_progress', 'completed', 'cancelled')),
    price_estimate DECIMAL(10, 2)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
    price_final DECIMAL(10, 2),
    escrow_txn_id VARCHAR(255)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(255),
    sender_id INTEGER REFERENCES users(id),
    text TEXT,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id INTEGER REFERENCES users(id),
    reviewee_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    doc_type VARCHAR(50),
    file_path VARCHAR(255),
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payer_id INTEGER REFERENCES users(id),
    payee_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway_receipt VARCHAR(255)
);

-- Admin logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id),
    action VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_rating ON worker_profiles(rating);

-- Full-text search columns (to be populated with triggers)
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_worker_profiles_search ON worker_profiles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING GIN(search_vector);

-- Insert sample data
-- Sample users
INSERT INTO users (name, email, phone, role, hashed_password, verified) VALUES
('John Employer', 'john@example.com', '+1234567890', 'employer', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012', true),
('Sarah Employer', 'sarah@example.com', '+1234567891', 'employer', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012', true),
('Jane Worker', 'jane@example.com', '+1234567892', 'worker', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012', true),
('Mike Worker', 'mike@example.com', '+1234567893', 'worker', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012', true),
('Lisa Worker', 'lisa@example.com', '+1234567894', 'worker', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012', true);

-- Sample worker profiles
INSERT INTO worker_profiles (user_id, bio, skills, languages, hourly_rate, service_categories, rating) VALUES
(3, 'Professional house cleaner with 5 years of experience. Specialized in deep cleaning and organization.', '["House Cleaning", "Deep Cleaning", "Organization"]', '{"English", "Spanish"}', 25.00, '["cleaning", "organization"]', 4.8),
(4, 'Experienced childcare specialist and tutor. Can help with homework and activities for children of all ages.', '["Childcare", "Tutoring", "Meal Preparation"]', '{"English", "French"}', 20.00, '["childcare", "tutoring"]', 4.5),
(5, 'Professional cook and meal planner. Specializes in healthy meals and special diets.', '["Cooking", "Meal Planning", "Special Diets"]', '{"English"}', 30.00, '["cooking", "meal planning"]', 4.9);

-- Sample jobs
INSERT INTO jobs (employer_id, title, description, service_type, price_estimate, status) VALUES
(1, 'House Cleaning', 'Deep clean of 3-bedroom apartment including kitchen, bathrooms, and living areas.', 'cleaning', 150.00, 'open'),
(2, 'Childcare for 2 children', 'Need childcare for 2 children ages 5 and 8 for 4 hours after school.', 'childcare', 80.00, 'open');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT ALL PRIVILEGES ON TABLE worker_profiles TO postgres;
GRANT ALL PRIVILEGES ON TABLE addresses TO postgres;
GRANT ALL PRIVILEGES ON TABLE availability_slots TO postgres;
GRANT ALL PRIVILEGES ON TABLE jobs TO postgres;
GRANT ALL PRIVILEGES ON TABLE bookings TO postgres;
GRANT ALL PRIVILEGES ON TABLE messages TO postgres;
GRANT ALL PRIVILEGES ON TABLE reviews TO postgres;
GRANT ALL PRIVILEGES ON TABLE documents TO postgres;
GRANT ALL PRIVILEGES ON TABLE payments TO postgres;
GRANT ALL PRIVILEGES ON TABLE admin_logs TO postgres;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Verify the setup
SELECT 'Database setup completed successfully!' as message;