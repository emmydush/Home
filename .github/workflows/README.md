# GitHub Workflows

This directory contains all the GitHub Actions workflows for the Household Workers Platform.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)
- Runs on push to `main` and `develop` branches
- Runs on pull requests to `main` branch
- Tests the application with Node.js 18.x and 20.x
- Sets up a PostgreSQL database for testing
- Installs dependencies and runs tests

### 2. Deploy to Production (`deploy.yml`)
- Runs on push to `main` branch
- Deploys the application to production
- Includes health checks and notifications

### 3. Code Quality (`code-quality.yml`)
- Runs on push to `main` and `develop` branches
- Runs on pull requests to `main` branch
- Performs code quality checks including:
  - ESLint (if configured)
  - Prettier (if configured)
  - Security audit with `npm audit`
  - Dependency checks

### 4. Deploy to Render (`render-deploy.yml`)
- Runs on push to `main` branch
- Deploys the application to Render using deploy key
- Uses Render webhook for deployment triggering
- Includes health checks and notifications

### 5. Docker Build and Push (`docker.yml.disabled`)
- Disabled workflow for Docker deployment
- Can be re-enabled by removing the `.disabled` extension
- Builds and pushes Docker images
- Automatically tags images based on Git metadata

## Setup Instructions

To use these workflows, you need to set up the following secrets in your GitHub repository:

1. For Render deployment:
   - `RENDER_DEPLOY_KEY` - Your Render deploy key (https://api.render.com/deploy/srv-d4fdmcn5r7bs73clkom0?key=82bdFZ4pa98)

2. For Docker deployment (optional, if re-enabling):
   - `DOCKERHUB_USERNAME` - Your DockerHub username
   - `DOCKERHUB_TOKEN` - Your DockerHub access token

## Customization

You may need to customize the following in the workflow files:

1. In `ci.yml`:
   - Database configuration
   - Environment variables
   - Test commands

2. In `deploy.yml`:
   - Deployment commands based on your hosting provider
   - Health check URLs
   - Notification settings

3. In `render-deploy.yml`:
   - Health check URLs for your Render application
   - Notification settings

4. In `code-quality.yml`:
   - ESLint and Prettier configurations
   - Security audit thresholds

5. In `docker.yml.disabled` (if re-enabling):
   - Docker image name
   - Tagging strategy

## Troubleshooting

If workflows fail, check the following:

1. Ensure all required secrets are set in GitHub
2. Verify that the Node.js and PostgreSQL versions are compatible
3. Check that all npm scripts referenced in the workflows exist
4. Review the logs for specific error messages
5. For Render deployment, ensure the deploy key is correct