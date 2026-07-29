"use client";

import { Category } from "@prisma/client";
import { Search } from "lucide-react";

interface ItemFilterBarProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ItemFilterBar({
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: ItemFilterBarProps) {
  return (
    <div className="bg-surface border border-outline/30 p-4 space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-outline/30">
        {/* Type Tabs */}
        <div className="flex items-center border border-outline/30 bg-surface-container-low p-1 w-full sm:w-auto">
          <button
            onClick={() => onTypeChange("ALL")}
            className={`flex-1 sm:flex-none px-4 py-1.5 font-label-md text-xs uppercase ${
              selectedType === "ALL"
                ? "bg-primary text-on-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => onTypeChange("LOST")}
            className={`flex-1 sm:flex-none px-4 py-1.5 font-label-md text-xs uppercase ${
              selectedType === "LOST"
                ? "bg-error text-on-error font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => onTypeChange("FOUND")}
            className={`flex-1 sm:flex-none px-4 py-1.5 font-label-md text-xs uppercase ${
              selectedType === "FOUND"
                ? "bg-primary text-on-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Found
          </button>
        </div>

        {/* Category Select Dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-outline/30 bg-surface text-primary font-code text-xs p-2 outline-none focus:border-primary"
          >
            <option value="ALL">Category: All</option>
            <option value={Category.ELECTRONICS}>Electronics</option>
            <option value={Category.DOCUMENTS}>Documents & Cards</option>
            <option value={Category.ACCESSORIES}>Accessories</option>
            <option value={Category.OTHER}>Other</option>
          </select>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
        <input
          type="text"
          placeholder="SEARCH ITEMS BY TITLE, LOCATION OR KEYWORDS..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-surface-container-low border border-outline/30 pl-9 pr-3 py-2 text-xs font-code text-primary placeholder:text-on-surface-variant/50 focus:border-primary outline-none"
        />
      </div>
    </div>
  );
}
