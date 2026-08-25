import { z } from "zod";

const divisionSchema = z.object({
    id: z.int(),
    name: z.string(),
    abbreviation: z.string(),
    companyCode: z.string(),
});

const divisionFormSchema = z.object({
    name: z.string().trim().nonempty({ error: "Please enter division name." }),
    abbreviation: z
        .string()
        .trim()
        .nonempty({ error: "Please enter division abbreviation." })
        .max(5, { error: "Please enter at most 5 characters." }),
});

export { divisionSchema, divisionFormSchema };
