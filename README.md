# GoIT Node.js Final Project

REST API backend for the GoIT Node.js course final project. Provides user authentication (register, login, JWT), profile management, avatar upload, following/subscribers, favorites, and recipe CRUD with search.

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

See **Swagger UI** (`/api-docs`) for full documentation.

**Auth** (`/api/auth`): `POST /register`, `POST /login`, `POST /logout`  
**Users** (`/api/users`): `GET /current`, `GET /:userId`, `PATCH /avatar`, subscriptions (paginated) via `GET /:profileUserId/following` and `GET /:profileUserId/subscribers`, follow/unfollow via `PATCH /follow` and `DELETE /:targetUserId/follow`, favorites (paginated) via `GET /favorites` plus `POST /favorites/:recipeId` and `DELETE /favorites/:recipeId`  
**Recipes** (`/api/recipes`): `GET /own`, `GET /users/:id` (paginated recipes created by a specific user, **auth required**), `GET /search`, `GET /popular`, `GET /:id`, `POST /`, `DELETE /:id`  
**Public** (`/api/ingredients`, `/api/categories`, `/api/areas`, `/api/testimonials`)

Protected routes require header: `Authorization: Bearer <token>`.

## Scripts

- `npm start` — run server
- `npm run dev` — run with nodemon
- `npm test` — run Jest tests

## Project structure

```
src/
├── constants/       # validation patterns, etc.
├── controllers/     # auth, users, recipes, etc.
├── db/              # Sequelize config, models, associations
├── helpers/         # HttpError, validateBody, hash, jwtToken, initAppFolders, uuidHelper
├── middlewares/     # authenticate, errorHandler, notFoundHandler, upload
├── routes/          # auth, users, recipes, ingredients, categories, areas, testimonials
├── schemas/         # Joi schemas (auth, users, recipes)
├── services/        # auth, users, recipes, favorites
├── swagger/         # OpenAPI 3.0 spec
├── index.js         # entry, DB connect, server listen
└── server.js        # Express app, routes, middlewares
```
