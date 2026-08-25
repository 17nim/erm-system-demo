import { z } from "zod";

const riskFormSchema = z.object({
    name: z.string(),
    categoryId: z.optional(z.int()),
    description: z.optional(z.string()),
    inherentLikelihood: z.optional(z.int().min(1).max(5)),
    inherentImpact: z.optional(z.int().min(1).max(5)),
    residualLikelihood: z.optional(z.int().min(1).max(5)),
    residualImpact: z.optional(z.int().min(1).max(5)),
    riskEvent: z.optional(
        z.string().max(255, {
            error: "Risk event cannot be longer than 255 characters.",
        })
    ),
    causes: z.array(z.string()),
    preEventMitigations: z.array(z.string()),
    postEventMitigations: z.array(z.string()),
    consequences: z.array(z.string()),
    status: z.enum(["draft", "completed"]).catch("draft"),
});

const riskSchema = z.object({
    id: z.int(),
    companyCode: z.string(),
    period: z.string(),
    name: z.string(),
    categoryId: z.optional(z.int()),
    division: z.string(),
    description: z.optional(z.string()),
    inherentLikelihood: z.optional(z.int().min(1).max(5)),
    inherentImpact: z.optional(z.int().min(1).max(5)),
    residualLikelihood: z.optional(z.int().min(1).max(5)),
    residualImpact: z.optional(z.int().min(1).max(5)),
    effectiveness: z.optional(z.int().min(1).max(25)),
    riskEvent: z.optional(z.string()),
    causes: z.array(z.string()),
    preEventMitigations: z.array(z.string()),
    postEventMitigations: z.array(z.string()),
    consequences: z.array(z.string()),
    status: z.enum(["draft", "completed", "verified", "approved"]),
});

const riskExportSchema = z.object({
    id: z.int(),
    name: z.string(),
    period: z.string(),
    category: z.string(),
    division: z.string(),
    description: z.string(),
    inherentLikelihood: z.int().min(1).max(5),
    inherentImpact: z.int().min(1).max(5),
    inherentScore: z.int().min(1).max(25),
    residualLikelihood: z.int().min(1).max(5),
    residualImpact: z.int().min(1).max(5),
    residualScore: z.int().min(1).max(25),
    effectiveness: z.int(),
    causes: z.array(z.string()),
    preEventMitigations: z.array(z.string()),
    riskEvent: z.string(),
    postEventMitigations: z.array(z.string()),
    consequences: z.array(z.string()),
    owner: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    approvedAt: z.iso.datetime(),
    status: z.enum(["draft", "completed", "verified", "approved"]),
});

export { riskFormSchema, riskSchema, riskExportSchema };
