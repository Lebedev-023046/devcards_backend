# DevCards Backend

NestJS API connected to PostgreSQL via Prisma ORM. Used in combination with [devcards-frontend](https://github.com/lebedev-023046/devcards-frontend).

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
  git clone https://github.com/lebedev-023046/devcards_backend.git
  cd devcards-backend
  pnpm install
```

### 2. Start PostgreSQL via Docker

```bash
  docker compose up -d
```

### 3. Create .env File

In the root of the project, copy `.env.example` to `.env` and adjust values if needed:

```bash
cp .env.example .env
```

Expected variables:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devcards_db
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=change-me
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=30
REFRESH_COOKIE_SAME_SITE=lax
ENABLE_DEV_AUTH=true
```

### 4. Run Migrations and Generate Prisma Client

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

### 5. (Optional) Seed the Database

```bash
pnpm seed
```

### 6. Start the Development Server

```bash
pnpm start:dev
```

API will be available at: http://localhost:3000
Swagger will be available at: http://localhost:3000/api/docs

## API Modules

- Auth: signup, signin, refresh, logout, current user and optional development auth.
- Decks: public/private decks, search, tags, favorites and permissions.
- Cards: typed cards, validation, CRUD and bulk operations.
- Progress: card review flow and per-deck learning progress.
- Tags: public tag list and admin-only tag management.
- Uploads: authenticated deck cover upload.

## 🧰 Tech Stack

- [NestJS](https://nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
