import Elysia from "elysia";
import { t } from "elysia";
import * as divisionRepository from "../repositories/division.repository";
import { Division } from "../interfaces/division.interface";
import { toTitleCase } from "../utils/caseConverter";
import auth from "../middlewares/auth";

const division = new Elysia({ prefix: "/divisions" })
    .use(auth)
    // Get all divisions
    .get(
        "/",
        async ({ user }) => {
            const data = await divisionRepository.getAllDivisions({
                companyCode: user.company_code as string,
            });
            return {
                success: true,
                message: "Fetched all divisions successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Create a new division
    .post(
        "/",
        async ({ body, user }) => {
            if (user.role === "admin") {
                const newDivision = {
                    name: toTitleCase(body.name as string),
                    abbreviation: body.abbreviation.toUpperCase(),
                    companyCode: user.company_code,
                };
                const data = await divisionRepository.addDivision(
                    newDivision as Division,
                );
                if (data)
                    return {
                        success: true,
                        message: "Division created successfully",
                        data,
                    };
                else throw new Error("Invalid request body");
            } else throw new Error("Unauthorized user");
        },
        {
            body: t.Object({
                name: t.String(),
                abbreviation: t.String(),
            }),
            requireAuth: true,
        },
    )
    // Update a division
    .put(
        "/:id",
        async ({ body, params, user }) => {
            const id = Number(params.id);
            if (user.role === "admin") {
                const newDivision = {
                    name: toTitleCase(body.name as string),
                    abbreviation: body.abbreviation?.toUpperCase(),
                    companyCode: user.company_code,
                };
                const data = await divisionRepository.updateDivision(
                    id,
                    newDivision as Partial<Division>,
                );
                if (data)
                    return {
                        success: true,
                        message: "Division updated successfully",
                        data,
                    };
                else throw new Error("Invalid request body");
            } else throw new Error("Unauthorized user");
        },
        {
            body: t.Partial(
                t.Object({
                    name: t.String(),
                    abbreviation: t.String(),
                }),
            ),
            requireAuth: true,
        },
    )
    // Delete a division
    .delete(
        "/:id",
        async ({ params }) => {
            const id = Number(params.id);
            const data = await divisionRepository.deleteDivision(id);
            return {
                success: true,
                message: "Division deleted successfully",
                data,
            };
        },
        { requireAuth: true },
    );

export default division;
