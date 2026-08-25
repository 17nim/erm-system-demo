import Elysia, { t } from "elysia";
import { Value } from "@sinclair/typebox/value";
import * as riskRepository from "../repositories/risk.repository";
import { riskDraft } from "../models/risk.model";
import auth from "../middlewares/auth";

const risk = new Elysia({ prefix: "/risks" })
    .use(auth)
    // Get all risks & search risks
    .get(
        "/",
        ({ user }) => {
            return riskRepository.getAllRisks({
                companyCode: user.company_code as string,
                division: user.division as string,
                role: user.role as "owner" | "approver" | "admin",
            });
        },
        { requireAuth: true },
    )
    // Get a risk by ID
    .get(
        "/:id",
        async ({ user, params: { id } }) => {
            return await riskRepository.getRiskById(Number(id), {
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
    // Get top 10 risks by residual score
    .get(
        "/top-10",
        async ({ user }) => {
            return await riskRepository.getTopTenRisks({
                companyCode: user.company_code as string,
                division: user.division as string,
                role: user.role as "owner" | "approver" | "admin",
            });
        },
        { requireAuth: true },
    )
    .get(
        "/export-to-excel",
        async ({ user, query }) => {
            if (!query.ids) {
                return await riskRepository.getRisksForExcel([], {
                    companyCode: user.company_code as string,
                });
            }
            return await riskRepository.getRisksForExcel(query.ids, {
                companyCode: user.company_code as string,
            });
        },
        {
            query: t.Object({ ids: t.Optional(t.Array(t.Number())) }),
            requireAuth: true,
        },
    )
    // Create a new risk
    .post(
        "/",
        async ({ user, body }) => {
            return await riskRepository.addRisk(
                { companyCode: user.company_code as string },
                body,
            );
        },
        { body: riskDraft, requireAuth: true },
    )
    // Update a risk
    .put(
        "/:id",
        async ({ user, body, params: { id } }) => {
            if (body.status === "completed") {
                    const completedRiskSchema = t.Object(
                        {
                            categoryId: t.Number({
                                minimum: 0,
                                error: "Invalid category ID",
                            }),
                            description: t.String({
                                minLength: 1,
                                error: "Description cannot be empty",
                            }),
                            inherentLikelihood: t.Number({
                                minimum: 1,
                                maximum: 5,
                                error: "Inherent likelihood must be between 1 and 5",
                            }),
                            inherentImpact: t.Number({
                                minimum: 1,
                                maximum: 5,
                                error: "Inherent impact must be between 1 and 5",
                            }),
                            residualLikelihood: t.Number({
                                minimum: 1,
                                maximum: 5,
                                error: "Residual likelihood must be between 1 and 5",
                            }),
                            residualImpact: t.Number({
                                minimum: 1,
                                maximum: 5,
                                error: "Residual impact must be between 1 and 5",
                            }),
                            riskEvent: t.String({
                                minLength: 1,
                                error: "Risk event cannot be empty",
                            }),
                            name: t.String({
                                minLength: 1,
                                error: "Name cannot be empty",
                            }),
                            status: t.Literal("completed", {
                                error: 'Status must be "completed"',
                            }),
                            division: t.String({
                                minLength: 1,
                                error: "Invalid division",
                            }),
                            ownerId: t.String({
                                minLength: 1,
                                error: "Invalid owner ID",
                            }),
                            causes: t.Array(
                                t.String({
                                    minLength: 1,
                                    error: "Cause cannot be empty",
                                }),
                                {
                                    minItems: 1,
                                    error: "At least one cause is required",
                                },
                            ),
                            preEventMitigations: t.Array(
                                t.String({
                                    minLength: 1,
                                    error: "Pre-event mitigation cannot be empty",
                                }),
                                {
                                    minItems: 1,
                                    error: "At least one pre-event mitigation is required",
                                },
                            ),
                            postEventMitigations: t.Array(
                                t.String({
                                    minLength: 1,
                                    error: "Post-event mitigation cannot be empty",
                                }),
                                {
                                    minItems: 1,
                                    error: "At least one post-event mitigation is required",
                                },
                            ),
                            consequences: t.Array(
                                t.String({
                                    minLength: 1,
                                    error: "Consequence cannot be empty",
                                }),
                                {
                                    minItems: 1,
                                    error: "At least one consequence is required",
                                },
                            ),
                        },
                        {
                            additionalProperties: false,
                            error: "Unexpected property provided",
                        },
                    );
                    const errors = [...Value.Errors(completedRiskSchema, body)];
                    if (errors.length === 0) {
                        return await riskRepository.updateRisk(
                            Number(id),
                            body,
                            {
                                companyCode: user.company_code as string,
                            },
                        );
                    } else throw new Error(errors[0].schema.error as string);
            } else {
                    let inherentScore = 0;
                    let residualScore = 0;
                    if (body?.inherentLikelihood && body?.inherentImpact) {
                        inherentScore =
                            body.inherentLikelihood * body.inherentImpact;
                    }
                    if (body?.residualLikelihood && body?.residualImpact) {
                        residualScore =
                            body.residualLikelihood * body.residualImpact;
                    }
                    if (!(body.name.trim().length > 0)) {
                        throw new Error("Please enter risk name.");
                    } else if (residualScore > inherentScore) {
                        throw new Error(
                            "Residual score cannot be larger than inherent score.",
                        );
                    } else
                        return await riskRepository.updateRisk(
                            Number(id),
                            body,
                            {
                                companyCode: user.company_code as string,
                            },
                        );
            }
        },
        { body: riskDraft, requireAuth: true },
    )
    // Update risk status
    .patch(
        "/:id",
        async ({ user, body, params: { id } }) => {
            return await riskRepository.updateRiskColumns(
                Number(id),
                { companyCode: user.company_code as string },
                body.status,
                body.effectiveness,
            );
        },
        {
            body: t.Object({
                status: t.Optional(
                    t.Union([
                        t.Literal("draft"),
                        t.Literal("completed"),
                        t.Literal("verified"),
                        t.Literal("approved"),
                    ]),
                ),
                effectiveness: t.Optional(t.Integer()),
            }),
            requireAuth: true,
        },
    )
    // Bulk update risks
    .patch(
        "/",
        async ({ user, body }) => {
            return await riskRepository.bulkUpdateRiskStatus(body.ids, body.status, {
                companyCode: user.company_code as string,
                role: user.role as string,
            });
        },
        {
            body: t.Object({
                ids: t.Array(t.Integer()),
                status: t.String({ default: "approved" }),
            }),
            requireAuth: true,
        },
    )
    // Delete a risk
    .delete(
        "/:id",
        async ({ user, params: { id } }) => {
            return await riskRepository.deleteRisk(Number(id), {
                companyCode: user.company_code as string,
            });
        },
        { requireAuth: true },
    );

export default risk;
