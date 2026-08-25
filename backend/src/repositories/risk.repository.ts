import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { riskDraft } from "../models/risk.model";
import { camelToSnake } from "../utils/caseConverter";
import { getCurrentPeriod } from "./period.repository";

// [GET] Get all risks
export async function getAllRisks(credentials: {
    companyCode: string;
    division: string;
    role: "admin" | "owner" | "approver";
}) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `select 
                r.id, 
                r.name, 
                r.period, 
                json_build_object(
                    'id', c.id, 
                    'name', c.name
                ) as category, 
                r.division,
                json_build_object(
                    'id', u.id,
                    'first_name', u.first_name,
                    'last_name', u.last_name
                ) as owner,
                r.inherent_likelihood,
                r.inherent_impact,
                r.residual_likelihood,
                r.residual_impact,
                r.effectiveness,
                r.created_at,
                r.updated_at,
                r.approved_at,
                r.status
            from risks r 
            left join categories c on r.category_id = c.id
            join users u on r.owner_id = u.id
            where r.company_code = $1
            ${credentials.role === "owner" ? "AND r.division = $2" : ""}
            ${
                credentials.role === "approver"
                    ? "AND r.division = $2 AND r.status = ANY($3::varchar[])"
                    : ""
            }
            order by r.updated_at desc, r.created_at desc`;
        const values: (string | string[])[] = [credentials.companyCode];
        if (credentials.role !== "admin") values.push(credentials.division);
        if (credentials.role === "approver")
            values.push(["verified", "approved"]);
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getAllRisks]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [GET] Get top 10 risks by residual score
export async function getTopTenRisks(credentials: {
    companyCode: string;
    division: string;
    role: "admin" | "owner" | "approver";
}) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            SELECT id, name, residual_likelihood, residual_impact, 
                (residual_likelihood * residual_impact) AS residual_risk
            FROM risks WHERE (residual_likelihood * residual_impact) IS NOT NULL 
            AND company_code = $1
            ${credentials.role !== "admin" ? "AND division = $2" : ""}
            ORDER BY residual_risk DESC LIMIT 10
        `;
        const values = [credentials.companyCode];
        if (credentials.role !== "admin") values.push(credentials.division);
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getTopTenRisks]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [GET] Get a risk by id
export async function getRiskById(
    id: number,
    credentials: {
        companyCode: string;
    }
) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `SELECT * FROM risks WHERE id = $1 AND company_code = $2`;
        const values = [id, credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getRiskById]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [GET] Get risks where id matches any value in the id array
export async function getRisksForExcel(
    ids: number[],
    credentials: {
        companyCode: string;
    }
) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            select
                r.id,
                r.name,
                r.period,
                c.name as category,
                r.division,
                r.description,
                r.inherent_likelihood,
                r.inherent_impact,
                r.inherent_likelihood * r.inherent_impact as inherent_score,
                r.residual_likelihood,
                r.residual_impact,
                r.residual_likelihood * r.residual_impact as residual_score,
                r.effectiveness,
                r.causes,
                r.pre_event_mitigations,
                r.risk_event,
                r.post_event_mitigations,
                r.consequences,
                u.first_name || ' ' || u.last_name as owner,
                r.created_at::date,
                r.updated_at::date,
                r.approved_at::date,
                r.status
            from
                risks r
            left join categories c on
                r.category_id = c.id
            join users u on
                r.owner_id = u.id
            where r.company_code = $1
            ${ids.length > 0 ? "AND r.id = ANY($2::int[])" : ""}
        `;
        const values: (string | number[])[] = [credentials.companyCode];
        ids.length > 0 && values.push(ids);
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getRiskById]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [POST] Create a new risk
export async function addRisk(
    credentials: {
        companyCode: string;
    },
    body: typeof riskDraft.static
) {
    let client: PoolClient | undefined;
    try {
        const currentPeriod = (
            await getCurrentPeriod({ companyCode: credentials.companyCode })
        ).period;

        const keys = Object.entries(body)
            .filter(([_, value]) => {
                if (value === null || value === undefined) return false;
                if (typeof value === "string" && value.trim() === "")
                    return false;
                return true;
            })
            .map(([key]) => key);

        const values = keys.map((key) => {
            if (Array.isArray(body[key as keyof typeof body])) {
                return `{${body[key as keyof typeof body]}}`;
            } else {
                return body[key as keyof typeof body];
            }
        });
        keys.push("period");
        values.push(currentPeriod);
        keys.push("company_code");
        values.push(credentials.companyCode);

        const columns = keys.map((key) => camelToSnake(key)).join(", ");

        // Parameterized query: create a list of placeholders for the values
        const placeholders = values
            .map((_, index) => `$${index + 1}`)
            .join(", ");

        client = await postgresPool.connect();
        const query = `
            INSERT INTO risks (${columns}) 
            VALUES (${placeholders}) RETURNING *
        `;

        // Execute the query with the values array
        const { rows } = await client.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("[addRisk]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [PUT] Update a risk
export async function updateRisk(
    id: number,
    body: typeof riskDraft.static,
    credentials: {
        companyCode: string;
    }
) {
    let client: PoolClient | undefined;
    try {
        const currentPeriod = await getCurrentPeriod({
            companyCode: credentials.companyCode,
        });

        const keys = Object.entries(body)
            .filter(([_, value]) => {
                if (value === null || value === undefined) return false;
                return true;
            })
            .map(([key]) => key);

        const values = keys.map((key) => body[key as keyof typeof body]);

        const columns = keys.map((key) => camelToSnake(key));

        // Build SET clause using parameterized placeholders
        const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);

        // Final parameters for query execution
        const queryParams = [...values, id, currentPeriod.period];

        client = await postgresPool.connect();
        const query = `
            UPDATE risks
            SET ${setClauses.join(", ")}
            WHERE id = $${values.length + 1} AND period = $${values.length + 2}
            RETURNING *
        `;

        const { rows } = await client.query(query, queryParams);
        return rows[0];
    } catch (error) {
        console.error("[updateRisk]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [PATCH] Update status of a risk
export async function updateRiskColumns(
    id: number,
    credentials: {
        companyCode: string;
    },
    status?: string,
    effectiveness?: number
) {
    let client: PoolClient | undefined;
    const updated = [];
    try {
        const currentPeriod = await getCurrentPeriod({
            companyCode: credentials.companyCode,
        });

        client = await postgresPool.connect();

        if (status) {
            const query = `
                UPDATE risks
                SET status = $1
                WHERE id = $2 AND period = $3 AND company_code = $4 
                RETURNING *
            `;
            const values = [
                status,
                id,
                currentPeriod.period,
                credentials.companyCode,
            ];
            const { rows } = await client.query(query, values);
            updated.push(rows[0]);
        }

        if (effectiveness) {
            const query = `
                UPDATE risks
                SET effectiveness = $1
                WHERE id = $2 AND company_code = $3
                RETURNING *
            `;
            const values = [effectiveness, id, credentials.companyCode];
            const { rows } = await client.query(query, values);
            updated.push(rows[0]);
        }

        return updated;
    } catch (error) {
        console.error("[updateRiskColumns]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [PATCH] Update status of a risk
export async function bulkUpdateRiskStatus(
    ids: number[],
    status: string,
    credentials: {
        companyCode: string;
        role: string;
    }
) {
    let client: PoolClient | undefined;
    try {
        if (credentials.role !== "approver")
            throw new Error("Invalid user role.");

        const currentPeriod = await getCurrentPeriod({
            companyCode: credentials.companyCode,
        });

        client = await postgresPool.connect();

        const query = `
                UPDATE risks
                SET status = $1
                WHERE id = ANY($2::int[]) AND period = $3 AND company_code = $4 AND status = 'verified'
                RETURNING *
            `;
        const values = [
            status,
            ids,
            currentPeriod.period,
            credentials.companyCode,
        ];
        const { rows } = await client.query(query, values);
        const updated: number[] = rows.map((row) => {
            return row.id as number;
        });
        const failed: number[] = ids.filter((id) => !updated.includes(id));
        return { updated, failed };
    } catch (error) {
        console.error("[bulkApproveRisk]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// [DELETE] Delete a risk
export async function deleteRisk(
    id: number,
    credentials: {
        companyCode: string;
    }
) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            DELETE FROM risks WHERE id = $1 AND company_code = $2 
            RETURNING *
        `;
        const values = [id, credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("[deleteRisk]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
