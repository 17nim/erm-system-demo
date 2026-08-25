import Elysia from "elysia";

const misc = new Elysia({ prefix: "/api" })
    .get("/today-quote", async () => {
    const res = await fetch("https://zenquotes.io/api/today");
    return await res.json();
});

export default misc;
