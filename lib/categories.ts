import { Category } from "@prisma/client";
import { unstable_cache } from "next/cache";

export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
  iconName: string;
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  {
    id: Category.ELECTRONICS,
    label: "Electronics",
    description: "Phones, laptops, chargers, headphones, smartwatches",
    iconName: "Laptop",
  },
  {
    id: Category.DOCUMENTS,
    label: "Documents & Cards",
    description: "ID cards, passports, notebooks, certificates, wallets",
    iconName: "FileText",
  },
  {
    id: Category.ACCESSORIES,
    label: "Accessories & Apparel",
    description: "Keys, glasses, bags, jackets, water bottles",
    iconName: "Glasses",
  },
  {
    id: Category.OTHER,
    label: "Other Items",
    description: "Umbrellas, sports gear, stationery, miscellaneous",
    iconName: "Package",
  },
];

/**
 * Returns cached list of categories with Next.js data cache (revalidate: 86400 / 24 hours)
 */
export const getCachedCategories = unstable_cache(
  async (): Promise<CategoryInfo[]> => {
    return CATEGORIES_LIST;
  },
  ["categories-list-cache"],
  {
    revalidate: 86400, // Cache for 24 hours
    tags: ["categories"],
  }
);
