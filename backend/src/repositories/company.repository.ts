import type { PoolClient } from 'pg';
import { postgresPool } from '../database/postgres';
import { Company } from '../interfaces/company.interface';

// Get all companies
export async function getAllCompanies() {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `SELECT * FROM companies`;
        const { rows } = await client.query(query);
        return rows;
    } catch (error) {
        console.error('[getAllCompanies]', (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Add new company
export async function addCompany(body: Company) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `INSERT INTO companies
            (code, name)
            VALUES ($1, $2)
            RETURNING *;`;
        const values = [body.code, body.name];
        const { rows } = await client.query(query, values);

        return rows[0];
    } catch (error) {
        console.error('[addCompany]', (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Update company
export async function updateCompany(id: number, body: Partial<Company>) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `
            UPDATE companies
            SET code = $1,
                name = $2
            WHERE id = $3
            RETURNING *;`;
        const values = [body.code, body.name, id];
        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
            throw new Error('Company not found');
        }

        return rows[0];
    } catch (error) {
        console.error('[updateCompany]', (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Delete company
export async function deleteCompany(id: number) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            DELETE FROM companies
            WHERE id = $1
            RETURNING *;`;
        const { rows } = await client.query(query, [id]);

        if (rows.length === 0) {
            throw new Error('Company not found');
        }
        return rows[0];
    } catch (error) {
        console.error('[deleteCompany]', (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
