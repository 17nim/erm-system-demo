import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { Division } from "../interfaces/division.interface";

// Get all divisions
export async function getAllDivisions(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `SELECT * FROM divisions WHERE company_code = $1`;
        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getAllDivisions]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Add new division
export async function addDivision(body: Division) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `INSERT INTO divisions 
                (name, abbreviation, company_code)
                VALUES ($1, $2, $3)
                RETURNING *;`;
        const values = [body.name, body.abbreviation, body.companyCode];
        const { rows } = await client.query(query, values);

        return rows[0];
    } catch (error) {
        console.error("[addDivision]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Update division
export async function updateDivision(id: number, body: Partial<Division>) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `
            UPDATE divisions
            SET name = $1,
                abbreviation = $2,
                company_code = $3
            WHERE id = $4
            RETURNING *;`;
        const values = [body.name, body.abbreviation, body.companyCode, id];
        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
            throw new Error("Division not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[updateDivision]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Delete division
export async function deleteDivision(id: number) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            DELETE FROM divisions
            WHERE id = $1
            RETURNING *;`;
        const { rows } = await client.query(query, [id]);

        if (rows.length === 0) {
            throw new Error("Division not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[deleteDivision]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
