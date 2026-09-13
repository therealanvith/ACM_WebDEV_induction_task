"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { Category, ItemType, Status } from "@prisma/client";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

export interface ItemCardData {
  id: string;
  title: string;
  description: string;
  category: Category;
  type: ItemType;
  location: string;
  date: Date | string;
  imageUrl?: string | null;
  status: Status;
  createdAt: Date | string;
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export function ItemCard({ item }: { item: ItemCardData }) {
  const [imageError, setImageError] = useState(false);
  const isLost = item.type === "LOST";

  return (
    <Link href={`/items/${item.id}`} className="block h-full">
      <div className="border border-outline/30 bg-surface flex flex-col hover:border-outline cursor-pointer h-full">
        {/* Top Image Banner */}
        <div className="h-48 border-b border-outline/30 relative overflow-hidden bg-surface-container-lowest">
          <div
            className={`absolute top-2 left-2 font-label-md text-xs px-2 py-0.5 z-10 font-bold tracking-wider ${
              isLost
                ? "bg-error text-on-error"
                : "bg-primary text-on-primary"
            }`}
          >
            {item.type}
          </div>

          {item.status === Status.RESOLVED && (
            <div className="absolute top-2 right-2 bg-surface-container-highest text-on-surface-variant font-code text-xs px-2 py-0.5 z-10 uppercase">
              Resolved
            </div>
          )}

          {item.imageUrl && !imageError ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-low p-4">
              <div className="w-10 h-10 border border-outline/30 flex items-center justify-center mb-2 bg-surface">
                {getCategoryIcon(item.category)}
              </div>
              <span className="font-code text-xs text-on-surface-variant">
                {item.imageUrl ? "Image Unavailable" : "No Image"}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-serif text-lg font-bold text-on-surface truncate">
              {item.title}
            </h3>
            <span className="font-code text-xs text-on-surface-variant shrink-0">
              {formatDate(item.date)}
            </span>
          </div>

          <p className="font-body text-xs text-on-surface-variant mb-4 flex-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Location Footer */}
          <div className="pt-3 border-t border-outline/30 flex items-center justify-between text-xs text-on-surface-variant mt-auto">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
              <span className="font-code truncate text-on-surface">{item.location}</span>
            </div>
            <span className="font-code text-[11px] text-on-surface-variant/80">
              {formatTimeAgo(item.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
