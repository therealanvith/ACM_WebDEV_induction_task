import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import { Status } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session || !session.user || session.user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const item = await db.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await db.item.delete({ where: { id } });

    // Pino Telemetry Logger
    logEvent.moderationAction({
      action: "delete",
      itemId: id,
      moderatorId: session.user.id,
      reason: "Moderator deletion",
    });

    return NextResponse.json({ success: true, message: `Item ${id} deleted by moderator` });
  } catch (err) {
    logEvent.error(`Error in admin delete item ${id}`, err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session || !session.user || session.user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { action } = body; // 'flag' or 'unflag' / 'resolve'

    let newStatus: Status = Status.FLAGGED;
    if (action === "unflag" || action === "activate") newStatus = Status.ACTIVE;
    if (action === "resolve") newStatus = Status.RESOLVED;

    const updated = await db.item.update({
      where: { id },
      data: { status: newStatus },
    });

    // Pino Telemetry Logger
    logEvent.moderationAction({
      action: newStatus === Status.FLAGGED ? "flag" : "delete",
      itemId: id,
      moderatorId: session.user.id,
      reason: `Moderator set status to ${newStatus}`,
    });

    return NextResponse.json(updated);
  } catch (err) {
    logEvent.error(`Error in admin update item status ${id}`, err);
    return NextResponse.json({ error: "Failed to update item status" }, { status: 500 });
  }
}
