import Elysia from "elysia";
import { t } from "elysia";
import * as heatmapColorRepository from "../repositories/heatmapColor.repository";
import { HeatmapColor } from "../interfaces/heatmapColor.interface";
import auth from "../middlewares/auth";

const heatmapColor = new Elysia({ prefix: "/heatmap-colors" })
    .use(auth)
    // Get heatmap-colors
    .get(
        "/",
        async ({ user }) => {
            const data = await heatmapColorRepository.getHeatmapColors({
                companyCode: user.company_code as string,
            });

            return {
                success: true,
                message: "Fetched all heatmap color successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Update a heatmap-color
    .put(
        "/:id",
        async ({ body, params }) => {
            const id = Number(params.id);
            const data = await heatmapColorRepository.updateHeatmapColor(
                id,
                body as Partial<HeatmapColor>,
            );

            return {
                success: true,
                message: "Heatmap color updated successfully",
                data,
            };
        },
        {
            body: t.Object({
                color: t.String(),
            }),
            requireAuth: true,
        },
    );
export default heatmapColor;
