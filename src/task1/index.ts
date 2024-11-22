import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

// GET health check
app.get("/health", (c) => {
  return c.text("OK");
});

// POST echo
app.post("/echo", async (c) => {
  return c.json(await c.req.json());
});

// GET time
app.get("/time", (c) => {
  return c.text(new Date().toUTCString());
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
