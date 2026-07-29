import { db } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import webPush from "web-push";

// Configure Web Push VAPID keys if present
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@campuslostfound.acm.org";

if (publicKey && privateKey) {
  webPush.setVapidDetails(subject, publicKey, privateKey);
}

interface SendPushNotificationParams {
  userId: string;
  title: string;
  body: string;
  url?: string;
  itemId: string;
}

/**
 * Sends a real Web Push payload to all active subscriptions of a target user
 */
export async function sendPushNotificationToUser({
  userId,
  title,
  body,
  url,
  itemId,
}: SendPushNotificationParams): Promise<number> {
  if (!publicKey || !privateKey) {
    logEvent.error(
      "[WEB_PUSH_SKIPPED] VAPID keys (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) are not set",
      null,
      { userId, itemId }
    );
    return 0;
  }

  // Retrieve user's stored subscriptions
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return 0;
  }

  const payload = JSON.stringify({
    title,
    body,
    icon: "/favicon.ico",
    url: url || `/items/${itemId}`,
  });

  let sentCount = 0;

  for (const sub of subscriptions) {
    const pushSubscriptionObj = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webPush.sendNotification(pushSubscriptionObj, payload);
      sentCount++;
      logEvent.notificationSent({
        type: "push",
        recipientId: userId,
        itemId,
      });
    } catch (err: any) {
      // If subscription is expired or invalid (HTTP 410 Gone / 404), remove from DB
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        logEvent.error("[WEB_PUSH_FAILED] Error sending push notification", err, {
          subscriptionId: sub.id,
        });
      }
    }
  }

  return sentCount;
}
