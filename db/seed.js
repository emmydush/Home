const db = require('./config');
const bcrypt = require('bcrypt');

async function seedDatabase() {
    try {
        console.log('Seeding database...');
        
        // Create sample users
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);
        
        // Insert sample employers
        const employer1 = await db.query(
            `INSERT INTO users (name, email, phone, role, hashed_password, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            ['John Employer', 'john@example.com', '+1234567890', 'employer', hashedPassword, true]
        );
        
        const employer2 = await db.query(
            `INSERT INTO users (name, email, phone, role, hashed_password, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            ['Sarah Employer', 'sarah@example.com', '+1234567891', 'employer', hashedPassword, true]
        );
        
        // Insert sample workers
        const worker1 = await db.query(
            `INSERT INTO users (name, email, phone, role, hashed_password, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            ['Jane Worker', 'jane@example.com', '+1234567892', 'worker', hashedPassword, true]
        );
        
        const worker2 = await db.query(
            `INSERT INTO users (name, email, phone, role, hashed_password, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            ['Mike Worker', 'mike@example.com', '+1234567893', 'worker', hashedPassword, true]
        );
        
        const worker3 = await db.query(
            `INSERT INTO users (name, email, phone, role, hashed_password, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            ['Lisa Worker', 'lisa@example.com', '+1234567894', 'worker', hashedPassword, true]
        );
        
        // Insert worker profiles
        await db.query(
            `INSERT INTO worker_profiles (user_id, bio, skills, languages, hourly_rate, service_categories, rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                worker1.rows[0].id,
                'Professional house cleaner with 5 years of experience. Specialized in deep cleaning and organization.',
                JSON.stringify(['House Cleaning', 'Deep Cleaning', 'Organization']),
                ['English', 'Spanish'],
                25.00,
                JSON.stringify(['cleaning', 'organization']),
                4.8
            ]
        );
        
        await db.query(
            `INSERT INTO worker_profiles (user_id, bio, skills, languages, hourly_rate, service_categories, rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                worker2.rows[0].id,
                'Experienced childcare specialist and tutor. Can help with homework and activities for children of all ages.',
                JSON.stringify(['Childcare', 'Tutoring', 'Meal Preparation']),
                ['English', 'French'],
                20.00,
                JSON.stringify(['childcare', 'tutoring']),
                4.5
            ]
        );
        
        await db.query(
            `INSERT INTO worker_profiles (user_id, bio, skills, languages, hourly_rate, service_categories, rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                worker3.rows[0].id,
                'Professional cook and meal planner. Specializes in healthy meals and special diets.',
                JSON.stringify(['Cooking', 'Meal Planning', 'Special Diets']),
                ['English'],
                30.00,
                JSON.stringify(['cooking', 'meal planning']),
                4.9
            ]
        );
        
        // Insert sample jobs
        await db.query(
            `INSERT INTO jobs (employer_id, title, description, service_type, price_estimate, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                employer1.rows[0].id,
                'House Cleaning',
                'Deep clean of 3-bedroom apartment including kitchen, bathrooms, and living areas.',
                'cleaning',
                150.00,
                'open'
            ]
        );
        
        await db.query(
            `INSERT INTO jobs (employer_id, title, description, service_type, price_estimate, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                employer2.rows[0].id,
                'Childcare for 2 children',
                'Need childcare for 2 children ages 5 and 8 for 4 hours after school.',
                'childcare',
                80.00,
                'open'
            ]
        );
        
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit(0);
    }
}

seedDatabase();