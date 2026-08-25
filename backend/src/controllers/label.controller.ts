import Elysia from "elysia";
import { t } from "elysia";
import * as labelRepository from "../repositories/label.repository";
import { toTitleCase } from "../utils/caseConverter";
import auth from "../middlewares/auth";

const label = new Elysia({ prefix: "/labels" })
    .use(auth)
    // Get labels
    .get(
        "/",
        async ({ user }) => {
            const data = await labelRepository.getLabels({
                companyCode: user.company_code as string,
            });
            return {
                success: true,
                message: "Fetched all labels successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Update a label
    .put(
        "/:id",
        async ({ body, params }) => {
            const id = Number(params.id);
            const data = await labelRepository.updateLabel(id, {
                label: toTitleCase(body.label),
            });
            if (data)
                return {
                    success: true,
                    message: "label updated successfully",
                    data,
                };
            else throw new Error("Invalid request body");
        },
        {
            body: t.Object({
                label: t.String(),
            }),
            requireAuth: true,
        },
    );
export default label;
