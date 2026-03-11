# DevCards Backend

A powerful NestJS API for the DevCards application, featuring a PostgreSQL database managed via Prisma ORM. This backend handles user management, card decks, and flashcard functionality.

Used in combination with [devcards-frontend](https://github.com/lebedev-023046/devcards-frontend).

---

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Containerization:** [Docker](https://www.docker.com/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## ✨ Features

- **User Management:** Authentication and role-based access control (USER, ADMIN).
- **Deck Management:** Create and manage flashcard decks (Public/Private).
- **Card System:** Interactive cards with multiple-choice options.
- **RESTful API:** Clean and predictable API endpoints.

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Clone and Install

```bash
git clone https://github.com/lebedev-023046/devcards-backend.git
cd devcards-backend
pnpm install
```

### 3. Infrastructure (PostgreSQL)

Start the database container:

```bash
docker compose up -d
```

### 4. Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devcards_db?schema=public"
FRONTEND_ORIGIN="http://localhost:5173"
PORT=3000
```

### 5. Database Setup

Apply migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. (Optional) Seed the Database

Populate your database with initial data:

```bash
pnpm seed
```

### 7. Run the Application

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

API will be available at: `http://localhost:3000`

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Health check / Hello World |
| **GET** | `/cards` | Retrieve all cards with their options |

*Note: More endpoints (Users, Decks) are under development.*

## 🗄️ Database Schema

The core models include:

- **User:** Manages identity and roles (`USER`, `ADMIN`).
- **Deck:** Groups of cards owned by a User. Can be public or private.
- **Card:** Individual flashcards containing questions.
- **Option:** Multiple-choice answers associated with a specific card.

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📜 Available Scripts

- `pnpm start:dev`: Starts the server in watch mode.
- `pnpm build`: Compiles the application to `dist/`.
- `pnpm lint`: Runs ESLint with auto-fix.
- `pnpm format`: Formats code using Prettier.
- `pnpm seed`: Runs the database seed script.
