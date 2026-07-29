"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Flag, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { Status } from "@prisma/client";

interface AdminItemActionsProps {
  itemId: string;
  currentStatus: Status;
}

export function AdminItemActions({ itemId, currentStatus }: AdminItemActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFlag = async (action: "flag" | "unflag") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Admin action failed: ${err.error || "Server error"}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this post? This action will be logged in Pino telemetry.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Deletion failed: ${err.error || "Server error"}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus === Status.FLAGGED ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleFlag("unflag")}
          disabled={loading}
          className="gap-1.5 text-xs text-emerald-600 border-emerald-300 dark:border-emerald-800"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          <span>Unflag Post</span>
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleFlag("flag")}
          disabled={loading}
          className="gap-1.5 text-xs text-purple-600 border-purple-300 dark:border-purple-800"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
          <span>Flag Post</span>
        </Button>
      )}

      <Button
        size="sm"
        variant="danger"
        onClick={handleDelete}
        disabled={loading}
        className="gap-1.5 text-xs"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        <span>Delete Post</span>
      </Button>
    </div>
  );
}
