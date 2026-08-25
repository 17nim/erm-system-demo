import type { heatmapColorFormSchema } from "@/schemas/heatmapColor.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import type z from "zod";

async function getHeatmapColors() {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/heatmap-colors`,
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
            const data = await res.json();
            return objectSnakeToCamel(data.data) as {
                id: number;
                likelihood: number;
                impact: number;
                color: string;
                companyCode: string;
            }[];
        }
    } catch (error) {
        console.error("Error fetching heatmap colors");
    }
}

async function updateHeatmapColor(
    id: number,
    data: z.infer<typeof heatmapColorFormSchema>
) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/heatmap-colors/${id}`,
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
                message: "Heatmap color updated successfully",
                data,
            };
        }
    } catch (error) {
        console.error(
            "Error updating heatmap color: " + (error as Error).message
        );
    }
}

export { getHeatmapColors, updateHeatmapColor };
