import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { Category } from "../interfaces/category.interface";

// Get all categories
export async function getAllCategories(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `SELECT * FROM categories WHERE company_code = $1`;
        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getAllCategories]", (error as Error).message);
    } finally {
        client?.release();
    }
}

// Add new category
export async function addCategory(body: Partial<Category>) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `INSERT INTO categories 
            (name, company_code)
            VALUES ($1, $2)
            RETURNING *;`;
        const values = [body.name, body.companyCode];
        const { rows } = await client.query(query, values);

        return rows[0];
    } catch (error) {
        console.error("[addCategory]", (error as Error).message);
    } finally {
        client?.release();
    }
}

// Update category
export async function updateCategory(id: number, body: Partial<Category>) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `
            UPDATE categories
            SET name = $1,
                company_code = $2
            WHERE id = $3
            RETURNING *;`;
        const values = [body.name, body.companyCode, id];
        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
            throw new Error("Category not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[updateCategory]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Delete category
export async function deleteCategory(id: number) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `
            DELETE FROM categories
            WHERE id = $1
            RETURNING *;`;
        const { rows } = await client.query(query, [id]);

        if (rows.length === 0) {
            throw new Error("Category not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[deleteCategory]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
