import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { AdminItemActions } from "@/components/admin-item-actions";
import { MapPin, ArrowLeft, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { ItemDetailImage } from "@/components/item-detail-image";

import { ResolveButton } from "@/components/resolve-button";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !session.user) {
    redirect(`/auth/signin?callbackUrl=/items/${id}`);
  }

  const item = await db.item.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const isOwner = session.user.id === item.userId;
  const isModerator = session.user.role === "MODERATOR";
  const isLost = item.type === "LOST";

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      {/* Return link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-code text-xs text-on-surface-variant hover:text-primary transition-colors uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to All Items</span>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Media & Chain of Custody */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Media Box */}
          <div className="w-full aspect-[4/3] border border-outline/30 bg-surface-container-low p-1 relative overflow-hidden">
            {item.imageUrl ? (
              <ItemDetailImage
                src={item.imageUrl}
                alt={item.title}
                category={item.category}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant">
                <div className="w-12 h-12 border border-outline/30 flex items-center justify-center mb-2 bg-surface">
                  {getCategoryIcon(item.category)}
                </div>
                <span className="font-code text-xs uppercase text-on-surface-variant">
                  No Photograph Provided
                </span>
              </div>
            )}
          </div>

          {/* Chain of Custody Timeline */}
          <div className="border border-outline/30 bg-background p-4 sm:p-6">
            <h3 className="font-label-md text-xs font-bold uppercase border-b border-outline/30 pb-2 mb-4 tracking-wider">
              Chain of Custody
            </h3>
            <div className="relative pl-6 space-y-6">
              <div className="absolute top-2 bottom-2 left-[7px] w-px bg-outline/30" />

              {/* Event 1 (Current Status) */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2 h-2 bg-primary outline outline-2 outline-background" />
                <div className="font-code text-xs text-on-surface-variant mb-0.5">
                  {formatDate(item.createdAt)}
                </div>
                <div className="font-body text-sm font-bold text-primary">
                  Report Active on Board
                </div>
                <div className="font-body text-xs text-on-surface-variant mt-0.5">
                  Status: <span className="uppercase font-bold text-primary">{item.status}</span>
                </div>
              </div>

              {/* Event 2 (Log Event) */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2 h-2 bg-surface-container-highest border border-outline/50 outline outline-2 outline-background" />
                <div className="font-code text-xs text-on-surface-variant mb-0.5">
                  {formatDate(item.date)}
                </div>
                <div className="font-body text-xs text-primary">
                  Item {isLost ? "reported lost by student" : "reported found and registered"}
                </div>
                <div className="font-body text-xs text-on-surface-variant mt-0.5">
                  Location logged: {item.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Title & Type Header Box */}
          <div className="border border-outline/30 bg-background p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight leading-tight">
                {item.title}
              </h1>
              <span
                className={`font-label-md text-xs px-2.5 py-1 uppercase whitespace-nowrap font-bold ${
                  isLost ? "bg-error text-on-error" : "bg-primary text-on-primary"
                }`}
              >
                {item.type}
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-px bg-outline/30 border border-outline/30 mt-2">
              <div className="bg-background p-3 flex flex-col gap-1">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-bold">
                  Category
                </span>
                <span className="font-code text-xs text-primary capitalize">
                  {item.category.toLowerCase()}
                </span>
              </div>
              <div className="bg-background p-3 flex flex-col gap-1">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-bold">
                  Date Logged
                </span>
                <span className="font-code text-xs text-primary">
                  {formatDate(item.date)}
                </span>
              </div>
              <div className="bg-background p-3 flex flex-col gap-1 col-span-2">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-bold">
                  Location
                </span>
                <span className="font-code text-xs text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                  {item.location}
                </span>
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="border border-outline/30 bg-background p-4 sm:p-6">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase font-bold mb-2 tracking-wider">
              Description
            </h2>
            <p className="font-body text-xs text-primary leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Contact Box */}
          <div className="border border-outline/30 bg-surface-container-low p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-outline/30 pb-4">
              {item.user.image ? (
                <Image
                  src={item.user.image}
                  alt={item.user.name || "Reporter"}
                  width={40}
                  height={40}
                  className="w-10 h-10 border border-outline/30 object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary text-on-primary border border-outline/30 flex items-center justify-center font-bold font-serif text-sm">
                  {item.user.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <div className="font-label-md text-[10px] text-on-surface-variant uppercase font-bold">
                  Reported by
                </div>
                <div className="font-body text-sm text-primary font-bold">
                  {item.user.name || "Campus Student"}
                </div>
                <div className="font-code text-xs text-on-surface-variant">
                  {formatTimeAgo(item.createdAt)}
                </div>
              </div>
            </div>

            {item.user.email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                  item.user.email
                )}&su=${encodeURIComponent(`Regarding Lost/Found Report: ${item.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary text-on-primary border border-primary py-3 px-4 hover:bg-primary/85 text-center font-bold block transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="font-label-md text-xs uppercase tracking-wider">Contact the Reporter</span>
                  <span className="font-code text-[11px] opacity-80 normal-case mt-0.5 truncate max-w-full font-normal">
                    {item.user.email}
                  </span>
                </div>
              </a>
            )}

            {(isOwner || isModerator) && (
              <div className="pt-2 border-t border-outline/30 space-y-2">
                <ResolveButton itemId={item.id} currentStatus={item.status} />
              </div>
            )}

            {isModerator && (
              <div className="pt-2 border-t border-outline/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Shield className="w-4 h-4" />
                  <span>Moderator Controls</span>
                </div>
                <AdminItemActions itemId={item.id} currentStatus={item.status} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
