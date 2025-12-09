# Task Management API

A production-ready RESTful API for managing tasks, built with NestJS, PostgreSQL, and TypeORM. Features JWT-based authentication, comprehensive validation, and full test coverage.

## Features

- 🔐 **JWT Authentication** - Secure registration and login with bcrypt password hashing
- 📝 **Complete CRUD** - Create, Read (paginated), Update, and Delete tasks
- 🛡️ **Authorization** - Users can only access their own tasks
- ✅ **Input Validation** - Comprehensive DTO validation with class-validator
- 🧪 **Unit Tests** - 80%+ code coverage with Jest
- 📚 **Type Safety** - Full TypeScript with strict mode

## Technology Stack

| Technology | Purpose |
|------------|---------|
| NestJS | Backend framework |
| PostgreSQL | Database |
| TypeORM | Object-Relational Mapping |
| Passport + JWT | Authentication |
| bcrypt | Password hashing |
| class-validator | Input validation |
| Jest | Testing framework |

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm (v9 or higher)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=yourpassword
   DB_DATABASE=task_management

   JWT_SECRET=your-super-secret-key-change-in-production
   JWT_EXPIRATION=1d

   PORT=3000
   ```

4. **Create the PostgreSQL database**
   ```sql
   CREATE DATABASE task_management;
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

### Tasks (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks` | Create a new task |
| GET | `/tasks` | Get all tasks (paginated) |
| GET | `/tasks/:id` | Get a single task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## API Examples

### Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "title": "Complete project",
    "description": "Finish the NestJS task management API",
    "status": "IN_PROGRESS"
  }'
```

### Get All Tasks (Paginated)
```bash
curl http://localhost:3000/tasks?page=1&limit=10 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Complete project",
      "description": "...",
      "status": "IN_PROGRESS",
      "createdAt": "2025-12-09T00:00:00.000Z",
      "updatedAt": "2025-12-09T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Update a Task
```bash
curl -X PATCH http://localhost:3000/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Delete a Task
```bash
curl -X DELETE http://localhost:3000/tasks/<TASK_ID> \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

## Task Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Task has not been started (default) |
| `IN_PROGRESS` | Task is currently being worked on |
| `COMPLETED` | Task has been finished |

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-12-09T00:00:00.000Z",
  "path": "/tasks"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input/validation errors |
| 401 | Unauthorized - Missing or invalid JWT token |
| 403 | Forbidden - Accessing another user's resource |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry (e.g., email exists) |

## Running Tests

```bash
# Run all unit tests
npm run test

# Run tests with coverage report
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── auth/
│   ├── decorators/          # Custom decorators (@GetUser)
│   ├── dto/                 # Data transfer objects
│   ├── guards/              # JWT auth guard
│   ├── strategies/          # Passport JWT strategy
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.module.ts       # Auth module
│   └── auth.service.ts      # Auth business logic
├── common/
│   └── filters/             # Global exception filter
├── config/
│   ├── database.config.ts   # Database configuration
│   └── jwt.config.ts        # JWT configuration
├── tasks/
│   ├── dto/                 # Task DTOs
│   ├── entities/            # Task entity
│   ├── tasks.controller.ts  # Task endpoints
│   ├── tasks.module.ts      # Tasks module
│   └── tasks.service.ts     # Tasks business logic
├── users/
│   └── entities/            # User entity
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Security Best Practices

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 1 day (configurable)
- All task endpoints require authentication
- Users can only access their own tasks
- Input validation on all endpoints
- Environment variables for sensitive data
- `.env` file excluded from Git

## License

MIT
