import { Pool } from "pg";

export let postgresPool: Pool = {} as Pool;

export async function createPostgresPool() {
    if (postgresPool && typeof postgresPool.end === "function") {
        return;
    }
    try {
        postgresPool = new Pool({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            port: process.env.POSTGRES_PORT
                ? Number(process.env.POSTGRES_PORT)
                : 5432,
            query_timeout: 60000,
            idleTimeoutMillis: 600000, // 10 mins
            connectionTimeoutMillis: 5000, // 5 seconds
            max: 10,
        });
        // Optionally test connection
        await postgresPool.query("SELECT 1");
        console.log("🐘 PostgreSQL connection pool created.");
    } catch (error) {
        console.error("Error connecting to PostgreSQL database:", error);
        throw new Error("Error connecting to PostgreSQL database");
    }
}

export async function closePostgresPool() {
    if (postgresPool && typeof postgresPool.end === "function") {
        try {
            await postgresPool.end();
            console.log("PostgreSQL connection pool closed.");
        } catch (error) {
            console.error("Failed to close PostgreSQL connection pool:", error);
            throw new Error("Failed to close PostgreSQL connection pool");
        }
    } else {
        console.warn("PostgreSQL pool was not initialized or already closed.");
    }
}
