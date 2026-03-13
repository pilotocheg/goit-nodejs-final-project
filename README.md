# GoIT Node.js Final Project

REST API backend for the GoIT Node.js course final project. Provides user authentication (register, login, JWT), current user profile, and avatar upload.

## Tech stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express
- **Database:** PostgreSQL with Sequelize (ORM)
- **Auth:** JWT (jsonwebtoken), bcrypt for password hashing
- **Validation:** Joi
- **File upload:** Multer
- **Other:** dotenv, cors, morgan, gravatar

## Prerequisites

- Node.js (v18+)
- PostgreSQL

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd goit-nodejs-final-project
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:
   - `DB_DIALECT` — `postgres`
   - `DB_HOST` — PostgreSQL host (e.g. `localhost`)
   - `DB_PORT` — PostgreSQL port (e.g. `5432`)
   - `DB_USERNAME` — DB user
   - `DB_PASSWORD` — DB password
   - `DB_NAME` — Database name
   - `JWT_SECRET` — Secret for signing JWT tokens
   - `PORT` (optional) — API port, default `3000`

3. **Create DB**

   Create the PostgreSQL database that matches `DB_NAME` in `.env`.

4. **Run**

   ```bash
   npm run dev   # development (nodemon)
   npm start     # production
   ```

   API base URL: `http://localhost:3000` (or your `PORT`).

## API Documentation (Swagger)

Interactive documentation is available after starting the server:

- **Swagger UI:** `http://localhost:3000/api-docs`
- **OpenAPI JSON:** `http://localhost:3000/api-docs.json` (for import into Postman/Insomnia)

In Swagger UI you can:
- View all endpoints with descriptions
- Test requests via "Try it out"
- Authorize via the "Authorize" button (paste JWT token after login)

## API

Base path for auth: **`/api/auth`**

| Method | Endpoint    | Auth | Description                                |
| ------ | ----------- | ---- | ------------------------------------------ |
| POST   | `/register` | No   | Register (email, password)                 |
| POST   | `/login`    | No   | Login, returns user + token                |
| GET    | `/current`  | Yes  | Current user profile                       |
| POST   | `/logout`   | Yes  | Logout (invalidate token)                  |
| PATCH  | `/avatar`   | Yes  | Upload avatar (multipart, field: `avatar`) |

Protected routes require header: `Authorization: Bearer <token>`.

Public routes:

| Method | Endpoint          | Auth | Description                |
| ------ | ----------------- | ---- | -------------------------- |
| GET    | `/api/ingredients`  | No   | List all ingredients       |
| GET    | `/api/categories`   | No   | List all recipe categories |
| GET    | `/api/areas`       | No   | List all recipe areas      |
| GET    | `/api/testimonials`| No   | List all testimonials      |

## Scripts

- `npm start` — run server
- `npm run dev` — run with nodemon
- `npm test` — run Jest tests

## Project structure

```
src/
├── constants/       # validation patterns, etc.
├── controllers/     # auth controllers
├── db/              # Sequelize config, models, associations
├── helpers/         # HttpError, validateBody, hash, jwtToken, initAppFolders
├── middlewares/     # authenticate, errorHandler, notFoundHandler, upload
├── routes/          # auth router
├── schemas/         # Joi schemas (auth, types)
├── services/        # auth business logic
├── index.js         # entry, DB connect, server listen
└── server.js        # Express app, routes, middlewares
```
