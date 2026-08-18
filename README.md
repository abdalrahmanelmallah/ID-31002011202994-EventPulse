# EventPulse — Event Management Backend API

EventPulse is an Event Management Backend API built with Node.js, Express, and MongoDB/Mongoose.

## Requirements

- Node.js 18+
- MongoDB local or MongoDB Atlas

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set your MongoDB connection string:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventpulse
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

## Run

```bash
npm start
```

Development:

```bash
npm run dev
```

Seed sample data:

```bash
npm run seed
```

## Seed admin

- Email: `admin@eventpulse.com`
- Password: `admin123`
- Role: `admin`

## Endpoints

- `GET /`
- `GET /health`
- `GET /api/users`
- `GET /api/categories`
- `GET /api/events`
- `GET /api/registrations`
- `GET /api/messages`

## MVC structure

- `models/` — Mongoose schemas
- `controllers/` — business logic
- `routes/` — API routes
- `middleware/` — middleware
- `utils/` — helper utilities
- `config/` — database/configuration

## Task 1 coverage

- MVC folder structure
- User, Event, Category, Registration, Message schemas
- Required-field validation
- Event → Category ObjectId relationship
- `populate()` for event categories
- Environment-variable database configuration
- `.env` excluded from Git
- Idempotent category/event/admin seed data


## Event Query Features

`GET /api/events` supports:

- `category=ID`
- `city=Cairo`
- `startDate=2026-01-01`
- `endDate=2026-12-31`
- `page=1&limit=10`
- `sortBy=date` or `sortBy=registrations`
- `order=asc` or `order=desc`
- `search=keyword` (case-insensitive title/description search)

Filters can be combined. Pagination returns `total`, `page`, `limit`, and `totalPages`.

## Validation, Errors and Tests

- All POST and PATCH endpoints validate input with `express-validator`.
- Validation failures return HTTP 422 with an `errors` array.
- `AppError` and `asyncHandler` utilities are included.
- A central error handler is mounted after all routes.
- Run the test suite with `npm test`.
