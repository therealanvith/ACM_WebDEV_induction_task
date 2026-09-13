import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import { sendMatchEmail } from "@/lib/notifications/email";
import { findMatchingLostItems } from "@/lib/notifications/matcher";
import { sendPushNotificationToUser } from "@/lib/notifications/push";
import { checkPostRateLimit } from "@/lib/ratelimit";
import { Category, ItemType, Prisma, Status } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as ItemType | null;
  const category = searchParams.get("category") as Category | null;
  const search = searchParams.get("search");
  const statusParam = searchParams.get("status") as Status | null;

  const where: Prisma.ItemWhereInput = {
    status: statusParam || Status.ACTIVE,
  };

  if (type) where.type = type;
  if (category) where.category = category;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const items = await db.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(items);
  } catch (err) {
    logEvent.error("Error fetching items feed", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = session.user.id;

  // Rate Limiting Enforcement (Upstash Redis): Cap to 5 posts per hour per user
  const rateLimitResult = await checkPostRateLimit(userId);
  if (!rateLimitResult.success) {
    logEvent.rateLimitExceeded({ userId });
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 5 posts per hour allowed." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { title, description, category, type, location, date, imageUrl } = body;

    if (!title || !description || !category || !type || !location || !date) {
      return NextResponse.json(
        { error: "Missing required fields (title, description, category, type, location, date)" },
        { status: 400 }
      );
    }

    const newItem = await db.item.create({
      data: {
        title,
        description,
        category: category as Category,
        type: type as ItemType,
        location,
        date: new Date(date),
        imageUrl: imageUrl || null,
        status: Status.ACTIVE,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Pino Structured Telemetry Log
    logEvent.postCreated({
      itemId: newItem.id,
      userId,
      type: newItem.type,
      category: newItem.category,
      title: newItem.title,
    });

    // If a "FOUND" item is posted, trigger matching Lost items & notify users (Email + Push)
    if (newItem.type === "FOUND") {
      // Fire and forget matching process to avoid blocking client response
      (async () => {
        try {
          const matches = await findMatchingLostItems({
            id: newItem.id,
            title: newItem.title,
            description: newItem.description,
            category: newItem.category,
            userId,
          });

          for (const match of matches) {
            if (match.user.email) {
              // 1. Email Notification (Brevo API)
              await sendMatchEmail({
                toEmail: match.user.email,
                toName: match.user.name || undefined,
                lostItemTitle: match.lostItem.title,
                foundItemTitle: newItem.title,
                foundItemDescription: newItem.description,
                foundItemLocation: newItem.location,
                foundItemId: newItem.id,
              });
            }

            // 2. Web Push Notification API
            await sendPushNotificationToUser({
              userId: match.user.id,
              title: "Campus Found Item Alert!",
              body: `An item matching your lost "${match.lostItem.title}" was posted at ${newItem.location}.`,
              url: `/items/${newItem.id}`,
              itemId: newItem.id,
            });
          }
        } catch (matchErr) {
          logEvent.error("Error running match notification pipeline", matchErr, {
            itemId: newItem.id,
          });
        }
      })();
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    logEvent.error("Failed to create lost/found item post", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
