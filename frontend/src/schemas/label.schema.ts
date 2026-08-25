import { z } from "zod";

const labelSchema = z.object({
    id: z.int(),
    type: z.enum(["likelihood", "impact"]),
    score: z.number().min(1).max(5),
    label: z.string(),
    companyCode: z.string(),
});

const labelFormSchema = z.object({
    label: z.string().trim().nonempty({ error: "Please enter label." }),
});

export { labelSchema, labelFormSchema };
