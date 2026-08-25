import { Elysia } from "elysia"
import cors from "@elysiajs/cors"
import { createPostgresPool } from "./database/postgres"
import { swaggerConfig } from "./config/swagger.config"
import user from "./controllers/user.controller"
import risk from "./controllers/risk.controller"
import division from "./controllers/division.controller"
import category from "./controllers/category.controller"
import company from "./controllers/company.controller"
import heatmapColor from "./controllers/heatmapColor.controller"
import label from "./controllers/label.controller"
import auth from "./controllers/auth.controller"
import period from "./controllers/period.controller"
import misc from "./controllers/misc.controller"

const allRoutes = new Elysia({ prefix: '/api' })
    .use(auth) // Route: /auth
    .use(user) // Route: /users
    .use(risk) // Route: /risks
    .use(division) // Route: /divisions
    .use(category) // Route: /categories
    .use(company) // Route: /companies
    .use(heatmapColor) // Route: /heatmap-colors
    .use(label) // Route: /labels
    .use(period) // Route: /periods
    .use(misc)

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const app = new Elysia()
    .use(cors({
        origin: corsOrigins,
        allowedHeaders: ["Content-Type", "Authorization"],
    }))
    .use(allRoutes)
    .get("/", () => "Hello Elysia")
    .use(swaggerConfig)
    .listen(3000)

await createPostgresPool()
console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)
