import Elysia from "elysia";
import { t } from "elysia";
import * as companyRepository from "../repositories/company.repository";
import { Company } from "./../interfaces/company.interface";
import auth from "../middlewares/auth";

const company = new Elysia({ prefix: "/companies" })
    .use(auth)
    // Get all companies
    .get(
        "/",
        async ({ user }) => {
            const data = await companyRepository.getAllCompanies();
            return {
                success: true,
                message: "Fetched all companies successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Create a new company
    .post(
        "/",
        async ({ body }) => {
            const data = await companyRepository.addCompany(body as Company);
            return {
                success: true,
                message: "Company created successfully",
                data,
            };
        },
        {
            body: t.Object({
                code: t.String(),
                name: t.String(),
            }),
            requireAuth: true,
        },
    )
    // Update a company
    .put(
        "/:id",
        async ({ body, params }) => {
            const id = Number(params.id);
            const data = await companyRepository.updateCompany(
                id,
                body as Partial<Company>,
            );
            return {
                success: true,
                message: "Company updated successfully",
                data,
            };
        },
        {
            body: t.Partial(
                t.Object({
                    code: t.String(),
                    name: t.String(),
                }),
            ),
            requireAuth: true,
        },
    )
    // Delete a company
    .delete(
        "/:id",
        async ({ params }) => {
            const id = Number(params.id);
            const data = await companyRepository.deleteCompany(id);
            return {
                success: true,
                message: "Company deleted successfully",
                data,
            };
        },
        { requireAuth: true },
    );

export default company;
