import Elysia from "elysia";
import { t } from "elysia";
import * as categoryRepository from "../repositories/category.repository";
import { Category } from "../interfaces/category.interface";
import { toTitleCase } from "../utils/caseConverter";
import auth from "../middlewares/auth";

const category = new Elysia({ prefix: "/categories" })
    .use(auth)
    // Get all categories
    .get(
        "/",
        async ({ set, user }) => {
            const data = await categoryRepository.getAllCategories({
                companyCode: user.company_code as string,
            });
            return {
                success: true,
                message: "Fetched all categories successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Create a new category
    .post(
        "/",
        async ({ set, body, user }) => {
            if (user.role === "admin") {
                const newCategory = {
                    name: toTitleCase(body.name),
                    companyCode: user.company_code,
                };
                const data = await categoryRepository.addCategory(
                    newCategory as Partial<Category>,
                );
                if (data)
                    return {
                        success: true,
                        message: "Category created successfully",
                        data,
                    };
                else throw new Error("Invalid request body");
            } else throw new Error("Unauthorized user");
        },
        {
            body: t.Object({
                name: t.String(),
            }),
            requireAuth: true,
        },
    )
    // Update a category
    .put(
        "/:id",
        async ({ set, body, params, user }) => {
            const id = Number(params.id);
            if (user.role === "admin") {
                const newCategory = {
                    name: toTitleCase(body.name as string),
                    companyCode: user.company_code,
                };
                const data = await categoryRepository.updateCategory(
                    id,
                    newCategory as Partial<Category>,
                );
                if (data)
                    return {
                        success: true,
                        message: "Category updated successfully",
                        data,
                    };
                else throw new Error("Invalid request body");
            } else throw new Error("Unauthorized user");
        },
        {
            body: t.Partial(
                t.Object({
                    name: t.String(),
                    companyCode: t.String(),
                }),
            ),
            requireAuth: true,
        },
    )
    // Delete a category
    .delete(
        "/:id",
        async ({ set, params }) => {
            const id = Number(params.id);
            const data = await categoryRepository.deleteCategory(id);
            return {
                success: true,
                message: "Category deleted successfully",
                data,
            };
        },
        { requireAuth: true },
    );

export default category;
