import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription payload structure" },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;

    // Upsert subscription into Prisma database
    const savedSub = await db.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint,
        },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    logEvent.notificationSent({
      type: "push",
      recipientId: session.user.id,
      itemId: "subscription_registered",
    });

    return NextResponse.json({ success: true, id: savedSub.id }, { status: 201 });
  } catch (err) {
    logEvent.error("Failed to save Web Push subscription", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
