import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { Redis } from "ioredis";
import { generateShortUrl } from "./utils.js";
import "dotenv/config";

const app = new Hono();

// POST
app.post(
  "/shorten",
  validator("json", (value, c) => {
    const url = value["url"];
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return c.text("INVALID", 400);
    }

    return { url };
  }),
  async (c) => {
    if (!process.env.REDIS_CONNECTION_URL) {
      return c.text("REDIS_CONNECTION_URL is required", 500);
    }

    const redisClient = new Redis(process.env.REDIS_CONNECTION_URL);

    const { url } = c.req.valid("json");

    const shortUrlId = await generateShortUrl({
      longUrl: url,
    });

    await redisClient.set(shortUrlId, url);

    return c.text(`http://localhost:3000/${shortUrlId}`);
  }
);

// GET
app.get("/:code", async (c) => {
  if (!process.env.REDIS_CONNECTION_URL) {
    return c.text("REDIS_CONNECTION_URL is required", 500);
  }

  const redisClient = new Redis(process.env.REDIS_CONNECTION_URL);

  const shortUrlId = c.req.param("code");

  const longUrl = await redisClient.get(shortUrlId);

  if (!longUrl) {
    return c.notFound();
  }

  return c.redirect(longUrl);
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
