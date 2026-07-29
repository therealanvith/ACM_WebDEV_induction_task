import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminItemActions } from "@/components/admin-item-actions";
import { formatDate } from "@/lib/utils";
import { Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !session.user || session.user.role !== "MODERATOR") {
    redirect("/?error=unauthorized");
  }

  const allItems = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const flaggedCount = allItems.filter((i) => i.status === "FLAGGED").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-outline/30 bg-surface p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="font-serif text-2xl font-bold text-primary">Moderation Dashboard</h1>
          </div>
          <p className="font-code text-xs text-on-surface-variant">
            Manage reported items, review flagged posts, and maintain campus board standards.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline/30 px-3.5 py-2 font-code text-xs font-bold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{flaggedCount} FLAGGED REPORT(S)</span>
        </div>
      </div>

      {/* Items Moderation List */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-primary">
          All Reported Items ({allItems.length})
        </h2>

        {allItems.length === 0 ? (
          <p className="font-code text-xs text-on-surface-variant">No items reported yet.</p>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => (
              <div key={item.id} className="p-4 border border-outline/30 bg-surface hover:border-outline transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-label-md text-xs px-2 py-0.5 font-bold uppercase ${
                        item.type === "LOST" ? "bg-error text-on-error" : "bg-primary text-on-primary"
                      }`}>
                        {item.type}
                      </span>
                      <span className="font-code text-xs px-2 py-0.5 bg-surface-container-high border border-outline/30 uppercase text-on-surface-variant">
                        {item.status}
                      </span>
                      <span className="font-code text-xs text-on-surface-variant uppercase">{item.category}</span>
                    </div>

                    <Link href={`/items/${item.id}`} className="font-serif font-bold text-lg text-primary hover:underline block">
                      {item.title}
                    </Link>

                    <div className="font-code text-xs text-on-surface-variant flex items-center gap-3 flex-wrap">
                      <span>Location: {item.location}</span>
                      <span>•</span>
                      <span>User: {item.user.name || item.user.email}</span>
                      <span>•</span>
                      <span>Date: {formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-outline/30">
                    <AdminItemActions itemId={item.id} currentStatus={item.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
