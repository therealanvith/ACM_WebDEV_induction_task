"use client";

import { useState } from "react";
import Image from "next/image";
import { Category } from "@prisma/client";
import { getCategoryIcon } from "@/lib/category-icons";

interface ItemDetailImageProps {
  src: string;
  alt: string;
  category: Category;
}

export function ItemDetailImage({ src, alt, category }: ItemDetailImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant">
        <div className="w-12 h-12 border border-outline/30 flex items-center justify-center mb-2 bg-surface">
          {getCategoryIcon(category)}
        </div>
        <span className="font-code text-xs uppercase text-on-surface-variant">
          Image Unavailable
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 60vw"
      className="object-cover filter contrast-125"
      onError={() => setHasError(true)}
    />
  );
}
