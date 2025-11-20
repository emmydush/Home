# Getting Started with Household Workers Platform

## Prerequisites

1. **Node.js** (version 14 or higher)
2. **PostgreSQL** (version 12 or higher)
3. **npm** (comes with Node.js)

## Database Setup

### Option 1: Using pgAdmin (Recommended)

1. Open pgAdmin
2. Create a new database named `household_workers`
3. Open the Query Tool
4. Copy and paste the contents of `pgadmin-setup.sql` into the query editor
5. Execute the query

### Option 2: Using psql command line

1. Open a terminal/command prompt
2. Run the following commands:
   ```bash
   # Create the database
   createdb -U postgres household_workers
   
   # Connect to the database and run the schema
   psql -U postgres -d household_workers -f db/schema.sql
   ```

## Environment Configuration

The application is already configured to use your PostgreSQL credentials:
- **Host**: localhost
- **Port**: 5432
- **Database**: household_workers
- **Username**: postgres
- **Password**: Jesuslove@12

If you need to change these, update the `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=household_workers
DB_USER=postgres
DB_PASSWORD=Jesuslove@12
```

## Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize the database**:
   ```bash
   npm run init:db
   ```

3. **Seed the database with sample data** (optional):
   ```bash
   npm run seed
   ```

4. **Verify the setup**:
   ```bash
   npm run verify:db
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at: http://localhost:3000

## Database Management Commands

- **List all tables**: `npm run db:manage list-tables`
- **Get table info**: `npm run db:manage table-info <table-name>`
- **Get row count**: `npm run db:manage table-count <table-name>`
- **Check database status**: `npm run db:manage status`
- **Reset database**: `npm run db:manage reset`

## Testing the API

Once the server is running, you can test the API endpoints:

1. **Health check**: http://localhost:3000/api/health
2. **Get all workers**: http://localhost:3000/api/workers
3. **Get specific worker**: http://localhost:3000/api/workers/1

## Frontend Pages

- **Home page**: http://localhost:3000/
- **Signup page**: http://localhost:3000/signup.html
- **Login page**: http://localhost:3000/login.html
- **Dashboard**: http://localhost:3000/dashboard.html
- **Search page**: http://localhost:3000/search.html
- **Worker profile**: http://localhost:3000/worker-profile.html

## Troubleshooting

### Database Connection Issues

1. **Ensure PostgreSQL is running**
2. **Verify credentials in `.env` file**
3. **Check if the database `household_workers` exists**
4. **Verify PostgreSQL is accepting connections on port 5432**

### Common Errors

1. **"database does not exist"**: Create the database first
2. **"password authentication failed"**: Check your PostgreSQL password
3. **"connection refused"**: Ensure PostgreSQL is running
4. **"relation does not exist"**: Run the database initialization

### Resetting the Application

If you need to start fresh:

1. **Reset the database**:
   ```bash
   npm run db:manage reset
   ```

2. **Reinitialize**:
   ```bash
   npm run init:db
   npm run seed
   ```

## Next Steps

1. **Explore the API**: Use tools like Postman or curl to test endpoints
2. **Customize the frontend**: Modify HTML/CSS to match your branding
3. **Add more features**: Extend the application with additional functionality
4. **Deploy to production**: Use Docker or traditional deployment methods

## Useful Commands

```bash
# Test database connection
npm run test:db:connection

# Run full setup
npm run setup

# Check database status
npm run db:manage status

# List all npm scripts
npm run
```

## Support

For issues with the setup or questions about the codebase, please refer to:
- `README.md` for general project information
- `IMPLEMENTATION_SUMMARY.md` for technical details
- Individual code files for specific implementation details