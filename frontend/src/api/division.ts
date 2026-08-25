import type {
    divisionFormSchema,
    divisionSchema,
} from "@/schemas/division.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import type z from "zod";

async function getAllDivisions() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/divisions`, {
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
                typeof divisionSchema
            >[];
        }
    } catch (error) {
        console.error("Error fetching divisions");
    }
}

async function createDivision(data: z.infer<typeof divisionFormSchema>) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/divisions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            return {
                success: true,
                message: "Division created successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error creating division: " + (error as Error).message,
        };
    }
}

async function updateDivision(
    id: number,
    data: z.infer<typeof divisionFormSchema>
) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/divisions/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${window.localStorage.getItem(
                        "authToken"
                    )}`,
                },
                body: JSON.stringify(data),
            }
        );
        if (res.ok) {
            return {
                success: true,
                message: "Division updated successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error updating division: " + (error as Error).message,
        };
    }
}

async function deleteDivision(id: number) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/divisions/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${window.localStorage.getItem(
                        "authToken"
                    )}`,
                },
            }
        );
        if (res.ok) {
            return {
                success: true,
                message: "Division deleted successfully.",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error deleting division: " + (error as Error).message,
        };
    }
}

export { getAllDivisions, createDivision, updateDivision, deleteDivision };
