import type { riskExportSchema, riskFormSchema } from "@/schemas/risk.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import type z from "zod";

async function getRiskData() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/risks`, {
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
            return objectSnakeToCamel(data);
        }
    } catch (error) {
        console.error("Error fetching risks");
    }
}

async function getRiskDetails(id: number) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/${id}`, {
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
            return objectSnakeToCamel(data[0]);
        }
    } catch (error) {
        console.error("Error fetching risk details");
    }
}

async function getTopTenRisks() {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/risks/top-10`,
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
            return objectSnakeToCamel(data) as {
                id: number;
                name: string;
                residualLikelihood: number;
                residualImpact: number;
                residualRisk: number;
            }[];
        }
    } catch (error) {
        console.error(
            "Error fetching top 10 risks: " + (error as Error).message
        );
    }
}

async function getRisksForExcel(ids: number[]) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/risks/export-to-excel${
                ids.length === 0 ? "" : "?ids="
            }${ids.join(",")}`,
            {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem(
                        "authToken"
                    )}`,
                },
            }
        );
        if (res.ok) {
            const data = await res.json();
            return objectSnakeToCamel(data) as z.infer<
                typeof riskExportSchema
            >[];
        }
    } catch (error) {
        console.error("Error fetching risks");
    }
}

async function completeRisk(
    id: number,
    body: z.infer<typeof riskFormSchema> & {
        ownerId: string;
        division: string;
    }
) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            return {
                success: true,
                message: "Risk updated successfully.",
                data: body,
            };
        } else {
            return {
                success: false,
                message:
                    (await res.json()).error_description ||
                    "Please ensure all required information is provided",
            };
        }
    } catch (error) {
        console.error("Error updating risk: " + (error as Error).message);
    }
}

async function updateRisk(
    id: number,
    status?: "draft" | "completed" | "verified" | "approved",
    effectiveness?: number
) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
            body: JSON.stringify({ status, effectiveness }),
        });
        if (res.ok) {
            return {
                success: true,
                message: "Risk updated successfully.",
                data: { status },
            };
        }
    } catch (error) {
        return { success: false, message: "Error updating risk" };
    }
}

async function bulkApproveRisk(ids: number[]) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
            body: JSON.stringify({ ids }),
        });
        if (res.ok) {
            return {
                success: true,
                message: "Risk updated successfully.",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error updating risk" + (error as Error).message,
        };
    }
}

async function deleteRisk(id: number) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem(
                    "authToken"
                )}`,
            },
        });
        if (res.ok) {
            return {
                success: true,
                message: "Risk deleted successfully.",
            };
        } else return { success: false, message: "Error deleting risk" };
    } catch (error) {
        return {
            success: false,
            message: "Error deleting risk: " + (error as Error).message,
        };
    }
}

export {
    getRiskData,
    getRiskDetails,
    getTopTenRisks,
    getRisksForExcel,
    completeRisk,
    updateRisk,
    bulkApproveRisk,
    deleteRisk,
};
