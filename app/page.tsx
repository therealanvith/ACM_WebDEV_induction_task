import { db } from "@/lib/db";
import { ItemFeed } from "@/components/item-feed";
import { Status } from "@prisma/client";
import { ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const { error } = await searchParams;

  const items = await db.item.findMany({
    where: {
      status: Status.ACTIVE,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const serializedItems = items.map((item) => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Banner Error alert if redirected from RBAC Middleware */}
      {error === "unauthorized" && (
        <div className="p-4 bg-surface border border-error text-error text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Access Denied: The `/admin` dashboard requires a <strong>MODERATOR</strong> user role.</span>
        </div>
      )}

      {/* Main Board Header */}
      <div className="border-b border-outline/30 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight">
            Active Feed
          </h1>
          <p className="font-code text-xs text-on-surface-variant mt-1">
            Showing all active lost and found item reports across campus.
          </p>
        </div>
      </div>

      {/* Interactive Item Feed */}
      <ItemFeed initialItems={serializedItems} />
    </div>
  );
}
