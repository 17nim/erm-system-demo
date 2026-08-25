import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { Label } from "../interfaces/label.interface";

// Get labels
export async function getLabels(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            SELECT * FROM labels WHERE company_code = $1
            ORDER BY type, score
        `;
        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getLabels]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Update label
export async function updateLabel(id: number, body: Partial<Label>) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `
            UPDATE labels
            SET label = $1
            WHERE id = $2
            RETURNING *;`;
        const values = [body.label, id];
        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
            throw new Error("Label not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[updateLabel]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
