import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { camelToSnake } from "../utils/caseConverter";

// [GET] Get all periods
export async function getAllPeriods(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            SELECT * FROM periods WHERE company_code = $1
            ORDER BY period DESC
        `;
        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getAllPeriods]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [GET] Get a period by ID
export async function getPeriodById(
    id: number,
    credentials: { companyCode: string }
) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `SELECT * FROM periods WHERE id = $1 AND company_code = $2`;
        const values = [id, credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("[getAllPeriods]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [GET] Get active period
export async function getCurrentPeriod(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            SELECT * FROM periods 
            WHERE is_active = true AND company_code = $1
            LIMIT 1;
        `;
        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows[0] as { period: string };
    } catch (error) {
        console.error("[getCurrentPeriod]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [POST] Create a new period
export async function addPeriod(body: {
    companyCode: string;
    period: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
}) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        // First make all periods inactive
        await client.query(
            `
            UPDATE periods
            SET is_active = FALSE
            WHERE is_active = TRUE AND company_code = $1;
        `,
            [body.companyCode]
        );

        // Insert new period safely with parameterized query
        const query = `
            INSERT INTO periods 
                (company_code, period, start_date, end_date, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [
            body.companyCode,
            body.period,
            body.startDate.toISOString(),
            body.endDate.toISOString(),
            body.description ?? null,
        ];

        const { rows } = await client.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("[addPeriod]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [PUT] Update a period
export async function updatePeriod(
    id: number,
    body: {
        description?: string | undefined;
        period?: string | undefined;
        startDate?: Date | undefined;
        endDate?: Date | undefined;
        isActive?: boolean | undefined;
    }
) {
    let client: PoolClient | undefined;
    try {
        if (Object.values(body).every((value) => value === undefined))
            throw new Error("Request body is required");

        // Filter keys with valid values
        const keys = Object.entries(body)
            .filter(([key, value]) => {
                if (value === null || value === undefined) return false;
                if (typeof value === "string" && value.trim() === "")
                    return key !== "description" ? false : true;
                return true;
            })
            .map(([key]) => key);

        const columns = keys.map((key) => camelToSnake(key));
        const values = keys.map((key) => {
            const val = body[key as keyof typeof body];
            return val instanceof Date ? val.toISOString() : val;
        });

        // Build dynamic SET clause with placeholders
        const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);

        client = await postgresPool.connect();

        const query = `
            UPDATE periods
            SET ${setClauses.join(", ")}
            WHERE id = $${columns.length + 1}
            RETURNING *;
        `;

        const { rows } = await client.query(query, [...values, id]);

        if (!rows[0]) throw new Error("Period not found");
        return rows[0];
    } catch (error) {
        console.error("[updatePeriod]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [DELETE] Delete a period
export async function deletePeriod(
    id: number,
    credentials: { companyCode: string }
) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            DELETE FROM periods WHERE id = $1 AND company_code = $2 
            RETURNING *
        `;
        const values = [id, credentials.companyCode];
        const { rows } = await client.query(query, values);

        if (!rows[0]) throw new Error("Period not found");
        return {
            success: true,
            message: "Delete period successfully",
            data: rows[0],
        };
    } catch (error) {
        console.error("[deleteRisk]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
