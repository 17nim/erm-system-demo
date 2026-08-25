import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwtConfig } from "../config/jwt.config";

const auth = new Elysia({ name: "auth" })
    .use(bearer())
    .use(jwtConfig)
    .macro({
        requireAuth: {
            async resolve({ bearer, jwt, status }) {
                if (!bearer) {
                    return status(401, {
                        error_description: "Missing Authorization header",
                    });
                }

                const user = await jwt.verify(bearer);

                if (!user) {
                    return status(401, {
                        error_description: "Invalid or expired token",
                    });
                }

                return { user };
            },
        },
    });

export default auth;
