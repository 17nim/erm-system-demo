import { Elysia, t } from "elysia";
import * as periodRepository from "../repositories/period.repository";
import auth from "../middlewares/auth";

const period = new Elysia({ prefix: "/periods" })
    .use(auth)
    // Get all periods
    .get(
        "/",
        async ({ user }) => {
            return await periodRepository.getAllPeriods({
                companyCode: user.company_code as string,
            });
        },
        { requireAuth: true },
    )
    // Get a period by ID
    .get(
        "/:id",
        async ({ user, params: { id } }) => {
            return await periodRepository.getPeriodById(Number(id), {
                companyCode: user.company_code as string,
            });
        },
        {
            params: t.Object({
                id: t.Number(),
            }),
            requireAuth: true,
        },
    )
    // Get current period
    .get(
        "/current",
        async ({ user }) => {
            return await periodRepository.getCurrentPeriod({
                companyCode: user.company_code as string,
            });
        },
        { requireAuth: true },
    )
    // Create a new period
    .post(
        "/",
        async ({ user, body }) => {
            const periodBody = {
                companyCode: user.company_code as string,
                ...body,
                period: body.period.toUpperCase(),
            };
            return await periodRepository.addPeriod(periodBody);
        },
        {
            body: t.Object({
                period: t.String(),
                startDate: t.Date(),
                endDate: t.Date(),
                description: t.Optional(t.String()),
            }),
            requireAuth: true,
        },
    )
    // Update a period
    .put(
        "/:id",
        async ({ body, params: { id } }) => {
            return await periodRepository.updatePeriod(Number(id), {
                ...body,
                period: body.period?.toUpperCase(),
            });
        },
        {
            body: t.Object({
                period: t.Optional(t.String()),
                startDate: t.Optional(t.Date()),
                endDate: t.Optional(t.Date()),
                description: t.Optional(t.String()),
                isActive: t.Optional(t.Boolean()),
            }),
            requireAuth: true,
        },
    )
    // Delete a period
    .delete(
        "/:id",
        async ({ user, params: { id } }) => {
            return await periodRepository.deletePeriod(Number(id), {
                companyCode: user.company_code as string,
            });
        },
        { requireAuth: true },
    );

export default period;
