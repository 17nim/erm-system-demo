import { t } from "elysia";

const riskBody = t.Object({
    name: t.String(),
    categoryId: t.Number(),
    division: t.String(),
    ownerId: t.String(),
    inherentLikelihood: t.Number(),
    inherentImpact: t.Number(),
    residualLikelihood: t.Number(),
    residualImpact: t.Number(),
    effectiveness: t.Number(),
    riskEvent: t.String(),
    causes: t.String(),
    description: t.Optional(t.String()),
});

type riskType = typeof riskBody.static;

const riskDraft = t.Object({
    name: t.String(),
    categoryId: t.Optional(t.Number()),
    division: t.String(), // From JWT payload
    ownerId: t.String(), // From JWT payload
    inherentLikelihood: t.Optional(t.Number()),
    inherentImpact: t.Optional(t.Number()),
    residualLikelihood: t.Optional(t.Number()),
    residualImpact: t.Optional(t.Number()),
    effectiveness: t.Optional(t.Number()),
    riskEvent: t.Optional(t.String()),
    causes: t.Array(t.String()),
    preEventMitigations: t.Array(t.String()),
    postEventMitigations: t.Array(t.String()),
    consequences: t.Array(t.String()),
    description: t.Optional(t.String()),
    status: t.Union([t.Literal("draft"), t.Literal("completed")]),
});

export { riskBody, riskType, riskDraft };
