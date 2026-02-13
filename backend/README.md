# Eventful Backend

Event Ticketing Platform Backend API built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

- ✅ User authentication (JWT) with role-based access control
- ✅ Event management (CRUD operations)
- ✅ Ticket generation with QR codes
- ✅ Payment integration with Paystack
- ✅ Email and SMS notifications
- ✅ Event analytics and reporting
- ✅ Social media sharing functionality
- ✅ Redis caching layer
- ✅ Rate limiting
- ✅ Comprehensive error handling

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Testing**: Jest & Supertest
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (v12+)
- Redis (v6+)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# Edit .env with your database, Redis, JWT, and service credentials
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=eventful_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h

# External Services
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
PAYSTACK_SECRET_KEY=...
```

## Development

### Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Database Setup

### Generate Migrations

```bash
# Create a new migration
npm run migrate:create CreateUserTable

# Run pending migrations
npm run migrate

# Revert last migration
npm run migrate:revert
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## API Documentation

- Swagger UI: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/health`

## Project Structure

```
src/
├── config/          # Configuration files (database, redis, environment)
├── middleware/      # Express middleware (auth, error handling, rate limiting)
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── models/          # TypeORM entity models
├── routes/          # API routes
├── utils/           # Helper functions and utilities
├── migrations/      # Database migrations
├── tests/           # Test files
└── main.ts          # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh JWT token

### Events
- `GET /api/v1/events` - List all events
- `POST /api/v1/events` - Create an event (creator only)
- `GET /api/v1/events/:eventId` - Get event details
- `PATCH /api/v1/events/:eventId` - Update event (creator only)
- `DELETE /api/v1/events/:eventId` - Delete event (creator only)

### Tickets
- `POST /api/v1/tickets/purchase` - Purchase a ticket
- `GET /api/v1/tickets/my-tickets` - Get user's tickets
- `GET /api/v1/tickets/:ticketId` - Get ticket with QR code

### Payments
- `POST /api/v1/payments/initialize` - Initialize payment
- `GET /api/v1/payments/callback` - Payment webhook

### More endpoints documented in Swagger UI

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "statusCode": 400
  },
  "timestamp": "2026-02-10T10:00:00Z",
  "path": "/api/v1/resource"
}
```

## Rate Limiting

- **Authentication**: 5 attempts per 15 minutes
- **General API**: 100 requests per minute
- **Payment**: 50 requests per hour

## Docker

```bash
# Build Docker image
docker build -t eventful-backend .

# Run with Docker Compose
docker-compose up
```

## Deployment

### Railway
```bash
railwayapp add node-typescript-starter
npm run build
npm start
```

### Heroku
```bash
git push heroku main
```

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
