import type { userFormSchema, userSchema } from "@/schemas/user.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import type z from "zod";

async function getAllUsers() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
        });
        if (res.ok) {
            const data = await res.json();
            return objectSnakeToCamel(data.data) as z.infer<
                typeof userSchema
            >[];
        }
    } catch (error) {
        console.error("Error fetching users");
    }
}

async function createUser(data: z.infer<typeof userFormSchema>) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
            return {
                success: true,
                message: "User created successfully",
                data: result,
            };
        } else {
            return {
                success: false,
                error_description: result.error_description || "Unknown error",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error creating user" + (error as Error).message,
        };
    }
}

async function updateUser(id: string, data: z.infer<typeof userFormSchema>) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
            return {
                success: true,
                message: "User updated successfully",
                data: result,
            };
        } else {
            return {
                success: false,
                error_description: result.error_description || "Unknown error",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error updating user" + (error as Error).message,
        };
    }
}

async function deleteUser(id: string) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
        });
        const result = await res.json();
        if (res.ok) {
            return {
                success: true,
                message: "Risk deleted successfully.",
            };
        } else {
            return {
                success: false,
                error_description: result.error_description || "Unknown error",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error deleting user: " + (error as Error).message,
        };
    }
}

export { getAllUsers, createUser, updateUser, deleteUser };
