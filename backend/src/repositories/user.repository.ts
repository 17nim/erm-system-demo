import type { PoolClient } from "pg";
import { postgresPool } from "../database/postgres";
import { hashPassword, verifyPassword } from "../utils/password";
import { Register, StoredUser, User } from "../interfaces/user.interface";
import { objectSnakeToCamel } from "../utils/caseConverter";

// Get all users
export async function getAllUsers(credentials: { companyCode: string }) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `SELECT id, first_name, last_name, email,
            role, company_code, division, position FROM users
            WHERE company_code = $1
            `;
        const values = [credentials.companyCode];
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error("[getAllUsers]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Find user by email
export async function findUserByEmail(email: string) {
    let client: PoolClient | undefined;

    try {
        client = await postgresPool.connect();
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await client.query(query, [email]);

        if (rows.length === 0) {
            throw new Error("User not found in Postgres");
        }

        return objectSnakeToCamel(rows[0]) as StoredUser;
    } catch (error) {
        console.error("[findUserByEmail]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Verify user
export async function verifyUser(email: string, password?: string) {
    const user = await findUserByEmail(email);

    if (!user.passwordHash) {
        throw new Error("Local user missing password");
    }

    const isValid = await verifyPassword(password!, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid email or password");
    }

    return user;
}

// Add new user (register)
export async function register(body: Register) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const passwordHash = await hashPassword(body.password);

        const query = `
            INSERT INTO users (
                id, first_name, last_name, email,
                role, company_code, division,
                password_hash) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
            `;

        const values = [
            body.id,
            body.firstName,
            body.lastName,
            body.email,
            body.role,
            body.companyCode,
            body.division,
            passwordHash,
        ];

        const { rows } = await client.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("[register]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Update user
export async function updateUser(id: string, body: Partial<User>) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();

        const columnMap: Record<string, string> = {
            firstName: "first_name",
            lastName: "last_name",
            email: "email",
            role: "role",
            companyCode: "company_code",
            division: "division",
        };

        const setClauses: string[] = [];
        const values: any[] = [];
        let idx = 1;

        for (const [key, value] of Object.entries(body)) {
            if (value !== undefined && columnMap[key]) {
                setClauses.push(`${columnMap[key]} = $${idx}`);
                values.push(value);
                idx++;
            }
        }

        if (setClauses.length === 0) {
            throw new Error("No valid fields provided for update");
        }

        values.push(id);

        const query = `
            UPDATE users
            SET ${setClauses.join(", ")}
            WHERE id = $${idx}
            RETURNING *;
        `;

        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
            throw new Error("User not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[updateUser]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}

// Delete user
export async function deleteUser(id: string) {
    let client: PoolClient | undefined;
    try {
        client = await postgresPool.connect();
        const query = `
            DELETE FROM users
            WHERE id = $1
            RETURNING *;`;
        const { rows } = await client.query(query, [id]);

        if (rows.length === 0) {
            throw new Error("User not found");
        }

        return rows[0];
    } catch (error) {
        console.error("[deleteUser]", (error as Error).message);
        throw error;
    } finally {
        client?.release();
    }
}
