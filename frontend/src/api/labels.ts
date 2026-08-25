import type { labelFormSchema, labelSchema } from "@/schemas/label.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import type z from "zod";

async function getAllLabels() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/labels`, {
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
                typeof labelSchema
            >[];
        }
    } catch (error) {
        console.error("Error fetching labels");
    }
}

async function updateLabel(id: number, data: z.infer<typeof labelFormSchema>) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/labels/${id}`,
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
                message: "Label updated successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error updating label: " + (error as Error).message,
        };
    }
}

export { getAllLabels, updateLabel };
