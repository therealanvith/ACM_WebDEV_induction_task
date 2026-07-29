import pino from "pino";

// Create Pino logger instance optimized for Vercel/Node stdout
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    env: process.env.NODE_ENV,
    app: "campus-lost-and-found",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Structured logger helper methods for key application events
 */
export const logEvent = {
  postCreated: (data: { itemId: string; userId: string; type: string; category: string; title: string }) => {
    logger.info(
      {
        event: "post_created",
        ...data,
      },
      `[POST_CREATED] Item ${data.itemId} (${data.type}) created by user ${data.userId}`
    );
  },

  notificationSent: (data: { type: "email" | "push"; recipientEmail?: string; recipientId?: string; itemId: string }) => {
    logger.info(
      {
        event: "notification_sent",
        ...data,
      },
      `[NOTIFICATION_SENT] ${data.type.toUpperCase()} notification dispatched for item ${data.itemId}`
    );
  },

  moderationAction: (data: { action: "delete" | "flag"; itemId: string; moderatorId: string; reason?: string }) => {
    logger.warn(
      {
        event: "moderation_action",
        ...data,
      },
      `[MODERATION_ACTION] Item ${data.itemId} ${data.action}d by moderator ${data.moderatorId}`
    );
  },

  rateLimitExceeded: (data: { userId: string; ip?: string }) => {
    logger.warn(
      {
        event: "rate_limit_exceeded",
        ...data,
      },
      `[RATE_LIMIT_EXCEEDED] Post creation rate limit reached for user ${data.userId}`
    );
  },

  error: (msg: string, err: unknown, context?: Record<string, unknown>) => {
    logger.error(
      {
        err: err instanceof Error ? { message: err.message, stack: err.stack } : err,
        ...context,
      },
      msg
    );
  },
};
