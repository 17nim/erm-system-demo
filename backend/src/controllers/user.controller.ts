import Elysia from "elysia";
import { t } from "elysia";
import * as userRepository from "../repositories/user.repository";
import { Register, User } from "../interfaces/user.interface";
import auth from "../middlewares/auth";

const user = new Elysia({ prefix: "/users" })
    .use(auth)
    // Get all users
    .get(
        "/",
        async ({ user }) => {
            const data = await userRepository.getAllUsers({
                companyCode: user.company_code as string,
            });
            return {
                success: true,
                message: "Fetched all users successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Create a new user
    .post(
        "/",
        async ({ set, body, user }) => {
            if (user.role !== "admin") {
                set.status = 403;
                return { error_description: "Only admin can add users" };
            }

            const validRoles = ["owner", "approver"];
            if (!validRoles.includes(body.role)) {
                set.status = 400;
                return { error_description: "Invalid role" };
            }

            if (
                !body.id ||
                !body.firstName ||
                !body.lastName ||
                !body.division ||
                !body.password
            ) {
                set.status = 400;
                return {
                    error_description: "Missing fields for user",
                };
            }

            const externalUser: Register = {
                id: body.id,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                role: body.role,
                division: body.division,
                password: body.password,
                companyCode: String(user.company_code),
            };

            const data = await userRepository.register(externalUser);

            return {
                success: true,
                message: "User created successfully",
                data,
            };
        },
        {
            body: t.Intersect([
                t.Object({
                    email: t.String(),
                    role: t.Union([t.Literal("owner"), t.Literal("approver")]),
                }),
                t.Object({
                    id: t.Optional(t.String()),
                    firstName: t.Optional(t.String()),
                    lastName: t.Optional(t.String()),
                    position: t.Optional(t.String()),
                    password: t.Optional(t.String()),
                    division: t.Optional(t.String()),
                }),
            ]),
            requireAuth: true,
        },
    )
    // Update a user
    .patch(
        "/:id",
        async ({ body, params, user }) => {
            const bodyData = body as Partial<User>;
            const updateData: Partial<User> = {
                ...bodyData,
                companyCode: String(user.company_code),
            };

            const data = await userRepository.updateUser(params.id, updateData);
            return {
                success: true,
                message: "User updated successfully",
                data,
            };
        },
        { requireAuth: true },
    )
    // Delete a user
    .delete(
        "/:id",
        async ({ params }) => {
            const data = await userRepository.deleteUser(params.id);
            return {
                success: true,
                message: "User deleted successfully",
                data,
            };
        },
        { requireAuth: true },
    )

    .get(
        "/me",
        async ({ user }) => {
            return { user };
        },
        { requireAuth: true },
    );

export default user;
