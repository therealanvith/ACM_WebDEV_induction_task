"use client";

import dynamic from "next/dynamic";
import { ItemCardData } from "./item-card";

// Lazy load ItemCard using next/dynamic for optimal performance below the fold
export const DynamicItemCard = dynamic(
  () => import("./item-card").then((mod) => mod.ItemCard),
  {
    loading: () => (
      <div className="border border-outline/30 bg-surface h-80 p-4 flex flex-col justify-between">
        <div className="w-full h-44 bg-surface-container-low border border-outline/20" />
        <div className="space-y-2 my-2">
          <div className="h-4 bg-surface-container-high w-3/4" />
          <div className="h-3 bg-surface-container-low w-1/2" />
        </div>
        <div className="h-4 bg-surface-container-low w-full mt-auto" />
      </div>
    ),
    ssr: false,
  }
);
