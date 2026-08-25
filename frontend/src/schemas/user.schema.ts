import { z } from "zod";

export const userSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    position: z.string(),
    role: z.enum(["owner", "approver", "admin"]).catch("owner"),
    companyCode: z.string(),
    division: z.string(),
});

export const userFormSchema = z.object({
    id: z.string(),
    firstName: z.optional(z.string()),
    lastName: z.optional(z.string()),
    email: z.email(),
    division: z.string().nonempty({ error: "Please select a division." }),
    role: z.string().nonempty({ error: "Please select a role." }),
    password: z.optional(z.string()),
});


