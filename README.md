# EventPulse — Task 1

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
