import type {
    categoryFormSchema,
    categorySchema,
} from "@/schemas/category.schema";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import type z from "zod";

async function getCategories() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
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
                typeof categorySchema
            >[];
        }
    } catch (error) {
        console.error("Error fetching categories: " + (error as Error).message);
    }
}

async function createCategory(data: z.infer<typeof categoryFormSchema>) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/`, {
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
                message: "Category created successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error creating category: " + (error as Error).message,
        };
    }
}

async function updateCategory(
    id: number,
    data: z.infer<typeof categoryFormSchema>
) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/categories/${id}`,
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
                message: "Category updated successfully",
                data,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error updating category: " + (error as Error).message,
        };
    }
}

async function deleteCategory(id: number) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/categories/${id}`,
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
                message: "Category deleted successfully.",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Error deleting category: " + (error as Error).message,
        };
    }
}

export { getCategories, createCategory, updateCategory, deleteCategory };
