import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis if credentials exist
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Create rate limiter: 5 posts per 1 hour window per user
export const postRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "campus_lost_found_post_limit",
    })
  : null;

/**
 * Check rate limit for a given user ID or identifier.
 * Returns { success: true } if allowed or if Upstash Redis credentials are not configured (graceful dev fallback).
 */
export async function checkPostRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (!postRatelimit) {
    // If Upstash is not configured in local env, log warning and bypass limit
    return { success: true, limit: 5, remaining: 5, reset: Date.now() + 3600000 };
  }

  const result = await postRatelimit.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
