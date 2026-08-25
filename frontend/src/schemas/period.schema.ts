import { z } from "zod";

const periodSchema = z.object({
    id: z.int(),
    period: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    description: z.string(),
    isActive: z.boolean(),
    companyCode: z.string(),
});

const periodFormSchema = z.object({
    period: z
        .string()
        .trim()
        .nonempty({ error: "Please enter period name." })
        .max(5, { error: "Please enter at most 5 characters." }),
    startDate: z.date({ error: "Please select a date." }),
    endDate: z.date({ error: "Please select a date." }),
    description: z.string(),
    isActive: z.boolean(),
});

export { periodSchema, periodFormSchema };
