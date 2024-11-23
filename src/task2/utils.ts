import { Redis } from "ioredis";
import "dotenv/config";

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateShortUrl = async ({ longUrl }: { longUrl: string }) => {
  const redisClient = new Redis(process.env.REDIS_CONNECTION_URL as string);

  const shortUrl = Array.from(
    { length: 6 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");

  if (await redisClient.get(shortUrl)) {
    return generateShortUrl({ longUrl });
  }

  return shortUrl;
};

export { generateShortUrl };
