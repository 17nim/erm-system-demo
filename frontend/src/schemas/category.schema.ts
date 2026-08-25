import { z } from "zod";

const categorySchema = z.object({
    id: z.int(),
    name: z.string(),
    companyCode: z.string(),
});

const categoryFormSchema = z.object({
    name: z
        .string()
        .max(255)
        .trim()
        .nonempty({ error: "Please enter category name." }),
});

export { categorySchema, categoryFormSchema };
