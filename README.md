# DevCards Backend

NestJS API connected to PostgreSQL via Prisma ORM. Used in combination with [devcards-frontend](https://github.com/lebedev-023046/devcards-frontend).

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
  git clone https://github.com/yourname/devcards-backend.git
  cd devcards-backend
  pnpm install
```

### 2. Start PostgreSQL via Docker

```bash
  docker compose up -d
```

### 3. Create .env File

In the root of the project, create a .env file:

```bash
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devcards_db
  FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Run Migrations and Generate Prisma Client

```bash
  npx prisma migrate dev --name init
  npx prisma generate
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

## 🧰 Tech Stack

- [NestJS](https://nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
