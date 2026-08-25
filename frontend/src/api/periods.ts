import type { periodFormSchema, periodSchema } from "@/schemas/period.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import { z } from "zod";

async function getAllPeriods() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/periods`, {
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
            return objectSnakeToCamel(data) as z.infer<typeof periodSchema>[];
        }
    } catch (error) {
        console.error("Error fetching periods: " + (error as Error).message);
    }
}

async function getCurrentPeriod() {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/periods/current`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${window.localStorage.getItem(
                        "authToken"
                    )}`,
                },
            }
        );
        if (res.ok) {
            const periodData = await res.json();
            return {
                id: periodData.id ?? undefined,
                name: periodData.period ?? "Closed",
                description: periodData.description ?? undefined,
                start_date: periodData.start_date ?? undefined,
                end_date: periodData.end_date ?? undefined,
            };
        } else return undefined;
    } catch (error) {
        console.error("Error fetching periods: " + (error as Error).message);
    }
}

async function createPeriod(data: z.infer<typeof periodFormSchema>) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/periods/`, {
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
                message: "Period created successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error creating period: " + (error as Error).message,
        };
    }
}

async function updatePeriod(
    id: number,
    data: z.infer<typeof periodFormSchema>
) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/periods/${id}`,
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
                message: "Period updated successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error updating period: " + (error as Error).message,
        };
    }
}

async function deletePeriod(id: number) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/periods/${id}`,
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
                message: "Period deleted successfully.",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error deleting period: " + (error as Error).message,
        };
    }
}

export {
    getAllPeriods,
    getCurrentPeriod,
    createPeriod,
    updatePeriod,
    deletePeriod,
};
