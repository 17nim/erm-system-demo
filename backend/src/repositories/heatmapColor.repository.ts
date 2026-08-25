import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { HeatmapColor } from "../interfaces/heatmapColor.interface";

// Get heatmap-colors
export async function getHeatmapColors(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            SELECT * FROM heatmap_colors
            WHERE company_code = $1
        `;

        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getHeatmapColors]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Update heatmap-color
export async function updateHeatmapColor(
    id: number,
    body: Partial<HeatmapColor>
) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const query = `
            UPDATE heatmap_colors
            SET color = $1
            WHERE id = $2
            RETURNING *;`;
        const values = [body.color, id];
        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
            throw new Error("Heatmap color not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[updateHeatmapColor]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
