import z from "zod";

const heatmapColorSchema = z.object({
    id: z.int(),
    likelihood: z.number().min(1).max(5),
    impact: z.number().min(1).max(5),
    color: z.string(),
    companyCode: z.string(),
});

const heatmapColorFormSchema = z.object({
    color: z.string(),
});

export { heatmapColorSchema, heatmapColorFormSchema };
