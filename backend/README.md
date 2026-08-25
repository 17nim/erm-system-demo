# ERM System Backend

REST API for the Enterprise Risk Management system.

Built with:

- Bun
- Elysia
- TypeScript
- PostgreSQL
- JWT authentication

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- PostgreSQL

### Install dependencies

Run these commands from the `backend` directory:

```bash
bun install
```

### Configure the environment

Create a `.env` file in the `backend` directory:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=erm_system
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

`CORS_ORIGINS` is a comma-separated list of exact frontend origins. Set it to the
deployed frontend origin or origins in production; it defaults to
`http://localhost:5173` for local development.

### Initialize the database

Run the SQL files in `src/database` in the following order:

1. `create_tables.sql`
2. `initialize_values.sql`

The API verifies the PostgreSQL connection before it finishes starting.

## Run the API

```bash
bun run dev
```

The API runs at [http://localhost:3000](http://localhost:3000).

OpenAPI documentation is available at [http://localhost:3000/swagger](http://localhost:3000/swagger).

## Routes

Routes are grouped under the `/api` prefix:

| Resource | Path |
| --- | --- |
| Authentication | `/api/login`, `/api/logout` |
| Users | `/api/users` |
| Risks | `/api/risks` |
| Divisions | `/api/divisions` |
| Categories | `/api/categories` |
| Companies | `/api/companies` |
| Heatmap colors | `/api/heatmap-colors` |
| Labels | `/api/labels` |
| Periods | `/api/periods` |

Protected endpoints require a bearer token:

```http
Authorization: Bearer <token>
```

## Source Layout

| Directory | Responsibility |
| --- | --- |
| `src/controllers` | API routes and request handling |
| `src/repositories` | Database queries |
| `src/database` | PostgreSQL connection and SQL scripts |
| `src/middlewares` | Authentication middleware |
| `src/config` | JWT and OpenAPI configuration |

## Available Commands

| Command | Description |
| --- | --- |
| `bun run build` | Build the production bundle in `build` |
| `bun run dev` | Start the development server with watch mode |
| `bun test` | Run the configured test command |
