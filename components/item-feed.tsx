"use client";

import { useState } from "react";
import { ItemCard, ItemCardData } from "./item-card";
import { DynamicItemCard } from "./dynamic-item-card";
import { ItemFilterBar } from "./item-filter-bar";
import { SearchX } from "lucide-react";

export function ItemFeed({ initialItems }: { initialItems: ItemCardData[] }) {
  const [type, setType] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filteredItems = initialItems.filter((item) => {
    // Type Filter
    if (type !== "ALL" && item.type !== type) return false;

    // Category Filter
    if (category !== "ALL" && item.category !== category) return false;

    // Keyword Search
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const locMatch = item.location.toLowerCase().includes(q);
      return titleMatch || descMatch || locMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Interactive Filter Controls */}
      <ItemFilterBar
        selectedType={type}
        onTypeChange={setType}
        selectedCategory={category}
        onCategoryChange={setCategory}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* Grid of Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            // Below-the-fold items (index >= 6) use next/dynamic lazy loading
            if (index >= 6) {
              return <DynamicItemCard key={item.id} item={item} />;
            }
            return <ItemCard key={item.id} item={item} />;
          })}
        </div>
      ) : (
        <div className="border border-outline/30 bg-surface p-12 text-center">
          <div className="w-12 h-12 border border-outline/30 flex items-center justify-center mx-auto mb-3 bg-surface-container-low text-on-surface-variant">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-primary uppercase">No Matching Reports Found</h3>
          <p className="font-code text-xs text-on-surface-variant max-w-md mx-auto mt-2">
            Try adjusting your search query, changing categories, or clearing filters to locate active reports.
          </p>
        </div>
      )}
    </div>
  );
}
