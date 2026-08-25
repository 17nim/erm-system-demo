import Elysia, { t } from "elysia";
import * as userRepository from "../repositories/user.repository";
import { jwtConfig } from "../config/jwt.config";

const auth = new Elysia()
    // JWT token
    .use(jwtConfig)
    // Login
    .post(
        "/login",
        async ({ body, set, jwt }) => {
            try {
                const user = await userRepository.verifyUser(
                    body.email,
                    body.password
                );

                if (!user) {
                    set.status = 401;
                    return { error: "Invalid email or password" };
                }

                const userInfo = {
                    user_id: user.id,
                    company_code: user.companyCode,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    email: body.email,
                    division: user.division,
                    role: user.role,
                };

                const token = await jwt.sign(userInfo);

                return {
                    success: true,
                    message: "Login Successfully",
                    user: userInfo,
                    token,
                };
            } catch (error) {
                console.error("(API)", (error as Error).message);
                set.status = 400;
                return { error_description: (error as Error).message };
            }
        },
        {
            body: t.Object({
                email: t.String(),
                password: t.String(),
            }),
        }
    )
    // Logout
    .post("/logout", ({ set }) => {
        set.status = 200;
        return { success: true, message: "Logout successfully" };
    });

export default auth;
