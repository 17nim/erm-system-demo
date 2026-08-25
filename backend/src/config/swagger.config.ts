import openapi from "@elysiajs/openapi";

export const swaggerConfig = openapi({
    path: "/swagger",
    documentation: {
        info: {
            title: "Enterprise Risk Management System API",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
});
