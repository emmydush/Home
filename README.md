# Household Workers Platform

An advanced web application connecting employers with household workers (cleaners, nannies, cooks, etc.).

## Features Implemented (MVP)

1. **User Authentication**
   - Sign up with role selection (Employer/Worker)
   - Login with email/password
   - JWT-based authentication

2. **User Profiles**
   - Worker profiles with skills, bio, and pricing
   - Employer profiles
   - Profile verification system

3. **Search & Discovery**
   - Search workers by service type, price, and rating
   - Filter and sorting options
   - Worker cards with key information

4. **Job Management**
   - Job posting by employers
   - Application process for workers
   - Job status tracking

5. **Messaging**
   - In-app chat concept (Socket.IO ready)
   - Message history

6. **Payments**
   - Payment processing integration concept (Stripe-ready)
   - Escrow system concept

7. **Ratings & Reviews**
   - After-job rating system
   - Public reviews

8. **Admin Panel**
   - User management concept
   - Verification queue concept
   - Dispute management concept

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Payments**: Stripe (integration ready)
- **Deployment**: Docker-ready, Render-ready
- **CI/CD**: GitHub Actions

## Database Schema

The application uses PostgreSQL with the following key tables:
- `users` - All user accounts
- `worker_profiles` - Detailed worker information
- `jobs` - Job postings
- `bookings` - Job assignments
- `messages` - Communication between users
- `payments` - Transaction records
- `reviews` - Rating system

## Setup Instructions

### Option 1: Manual Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up PostgreSQL database
5. Run database migrations (schema.sql)
6. Seed the database (optional):
   ```
   npm run seed
   ```
7. Start the development server:
   ```
   npm run dev
   ```

### Option 2: Docker Setup (Recommended)

1. Clone the repository
2. Build and start services:
   ```
   docker-compose up --build
   ```
3. The application will be available at http://localhost:3000

### Option 3: Render Deployment

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the following environment variables in Render:
   - `DATABASE_URL` - postgresql://work_db_2rli_user:XOAOamHE3Kf1QbF0Z9ymutGsmRZYcLOb@dpg-d4fd86qli9vc73ad0tr0-a/work_db_2rli
   - `DB_USER` - work_db_2rli_user
   - `DB_HOST` - dpg-d4fd86qli9vc73ad0tr0-a
   - `DB_PASSWORD` - XOAOamHE3Kf1QbF0Z9ymutGsmRZYcLOb
   - `DB_PORT` - 5432
   - `DB_NAME` - work_db_2rli
   - `JWT_SECRET` - your-jwt-secret-key
   - `PORT` - 10000
5. Add the build command: `npm install`
6. Add the start command: `npm start`

## GitHub Workflows

This project includes several GitHub Actions workflows for continuous integration and deployment:

### CI/CD Pipeline
- Automated testing on push and pull requests
- Multi-node version testing (18.x and 20.x)
- PostgreSQL database setup for testing
- Security audits and dependency checks

### Render Deployment
- Automated deployment to Render on push to main branch
- Uses Render deploy key for deployment triggering
- Health checks and notifications

To use these workflows, you need to set up the required secrets in your GitHub repository settings:
- `RENDER_DEPLOY_KEY` - Your Render deploy key (https://api.render.com/deploy/srv-d4fdmcn5r7bs73clkom0?key=82bdFZ4pa98)

## Project Structure

```
.
├── public/                 # Frontend files
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   └── *.html              # HTML pages
├── db/                     # Database files
│   ├── config.js           # Database configuration
│   ├── schema.sql          # Database schema
│   └── seed.js             # Sample data
├── routes/                 # API routes
├── middleware/             # Express middleware
├── .github/workflows/      # GitHub Actions workflows
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get specific worker
- `POST /api/workers/profile` - Create/update worker profile
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs/:id/apply` - Apply for job
- `GET /api/health` - Health check

## Next Steps for Full Implementation

1. Implement real-time messaging with Socket.IO
2. Add document verification system
3. Implement geolocation features
4. Add mobile responsiveness enhancements
5. Implement advanced search features with PostGIS
6. Add notification system
7. Implement payment processing
8. Add admin dashboard
9. Implement smart matching algorithms
10. Add multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.