"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface ResolveButtonProps {
  itemId: string;
  currentStatus: Status;
}

export function ResolveButton({ itemId, currentStatus }: ResolveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isResolved = currentStatus === Status.RESOLVED;

  const toggleResolve = async () => {
    setLoading(true);
    try {
      const nextStatus = isResolved ? Status.ACTIVE : Status.RESOLVED;
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.error || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleResolve}
      disabled={loading}
      className={`w-full py-3 border font-label-md text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 ${
        isResolved
          ? "bg-surface-container-low text-primary border-outline/30 hover:bg-surface-container-high"
          : "bg-surface text-primary border-primary hover:bg-surface-container-high"
      }`}
    >
      {isResolved ? (
        <>
          <RotateCcw className="w-4 h-4" />
          <span>{loading ? "Updating..." : "Reopen Listing (Mark Active)"}</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{loading ? "Updating..." : "Mark Item as Resolved / Found"}</span>
        </>
      )}
    </button>
  );
}
