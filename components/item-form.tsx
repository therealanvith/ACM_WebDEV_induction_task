"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category, ItemType } from "@prisma/client";
import { AlertCircle } from "lucide-react";

function isLikelyImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const path = parsed.pathname.toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(path);
  } catch {
    return false;
  }
}

async function validateImageUrl(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) return true;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
  } catch {
    return false;
  }

  // 1. Fast-path: validate file extension
  if (isLikelyImageUrl(trimmed)) {
    return true;
  }

  // 2. In-browser test: check if image element can load it (bypasses CORS restrictions)
  if (typeof window !== "undefined") {
    try {
      const loads = await new Promise<boolean>((resolve) => {
        const img = new window.Image();
        const timer = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          resolve(false);
        }, 4000);

        img.onload = () => {
          clearTimeout(timer);
          resolve(true);
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(false);
        };
        img.src = trimmed;
      });

      if (loads) return true;
    } catch {
      // Fall through to fetch check
    }
  }

  // 3. Fallback: HEAD request, followed by GET range 0-0
  try {
    let res = await fetch(trimmed, { method: "HEAD" });
    let contentType = res.headers.get("content-type");
    if (contentType?.startsWith("image/")) return true;

    res = await fetch(trimmed, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    contentType = res.headers.get("content-type");
    return contentType?.startsWith("image/") ?? false;
  } catch {
    return false;
  }
}

export function ItemForm() {
  const router = useRouter();
  const [type, setType] = useState<ItemType>(ItemType.LOST);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(Category.ELECTRONICS);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedImageUrl = imageUrl.trim();
    if (trimmedImageUrl) {
      setLoading(true);
      const isValid = await validateImageUrl(trimmedImageUrl);
      if (!isValid) {
        setErrorMessage("That URL doesn't point to a valid image. Please check the link and try again.");
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          type,
          location,
          date,
          imageUrl: trimmedImageUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage(data.error || "Rate limit exceeded. You can only create 5 posts per hour.");
        } else {
          setErrorMessage(data.error || "Failed to create post. Please check your inputs.");
        }
        setLoading(false);
        return;
      }

      router.push(`/items/${data.id}`);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto border border-outline/30 bg-surface p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-outline/30 pb-4 space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl text-primary font-bold">
          Register New Report
        </h1>
        <p className="font-code text-xs text-on-surface-variant">
          Submit details for a lost or found item to match with campus records.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-surface border border-error text-error text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type Selector */}
        <div className="space-y-2">
          <label className="font-label-md text-xs text-primary uppercase font-bold block">
            Report Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low border border-outline/30">
            <button
              type="button"
              onClick={() => setType(ItemType.LOST)}
              className={`py-3 text-xs font-label-md uppercase tracking-wider transition-colors font-bold ${
                type === ItemType.LOST
                  ? "bg-error text-on-error"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              Lost Item
            </button>
            <button
              type="button"
              onClick={() => setType(ItemType.FOUND)}
              className={`py-3 text-xs font-label-md uppercase tracking-wider transition-colors font-bold ${
                type === ItemType.FOUND
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              Found Item
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="font-label-md text-xs text-primary uppercase font-bold block">
            Item Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Black Moleskine Notebook & Silver Lamy Pen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-low border border-outline/30 p-3 text-xs font-body text-primary focus:border-primary outline-none"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-label-md text-xs text-primary uppercase font-bold block">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-surface-container-low border border-outline/30 p-3 text-xs font-code text-primary focus:border-primary outline-none"
            >
              <option value={Category.ELECTRONICS}>Electronics</option>
              <option value={Category.DOCUMENTS}>Documents & Cards</option>
              <option value={Category.ACCESSORIES}>Accessories</option>
              <option value={Category.OTHER}>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-xs text-primary uppercase font-bold block">
              Incident Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-low border border-outline/30 p-3 text-xs font-code text-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="font-label-md text-xs text-primary uppercase font-bold block">
            Campus Location *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Architecture Building, Floor 2 Studio"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-surface-container-low border border-outline/30 p-3 text-xs font-body text-primary focus:border-primary outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="font-label-md text-xs text-primary uppercase font-bold block">
            Description & Details *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Provide specific details (color, brand, distinguishing marks, condition) to help identify..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-low border border-outline/30 p-3 text-xs font-body text-primary focus:border-primary outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="font-label-md text-xs text-primary uppercase font-bold block">
            Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-surface-container-low border border-outline/30 p-3 text-xs font-code text-primary focus:border-primary outline-none"
          />
          {imageUrl.trim() && (
            <div className="flex items-center gap-3 p-2 bg-surface-container-low border border-outline/30 text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl.trim()}
                alt="Preview"
                className="w-12 h-12 object-cover border border-outline/30 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="font-code text-[11px] text-on-surface-variant truncate">
                Previewing image link
              </span>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary border border-primary py-4 font-label-md text-xs uppercase tracking-wider font-bold hover:bg-primary/85"
        >
          {loading ? "Submitting Report..." : "Submit Report to Board"}
        </button>
      </form>
    </div>
  );
}
