-- Database setup script for Household Workers Platform

-- Create the database (run this as a superuser)
CREATE DATABASE household_workers;

-- Connect to the database
\c household_workers;

-- Create the schema (this is already in db/schema.sql)
-- You can run the schema.sql file directly:
-- \i db/schema.sql

-- Create the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sample data insertion (this is already in db/seed.js)
-- You can run the seed.js file directly:
-- npm run seed

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_service_type ON jobs(service_type);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_rating ON worker_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;