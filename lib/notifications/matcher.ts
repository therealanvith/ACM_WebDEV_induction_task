import { db } from "@/lib/db";
import { Category, Item, Status, User } from "@prisma/client";

export interface MatchedLostItem {
  lostItem: Item;
  user: User;
  score: number;
}

/**
 * Normalizes text string into array of lowercase keywords (excluding short words)
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/**
 * Searches DB for active LOST items in the same category and evaluates keyword overlap
 */
export async function findMatchingLostItems(foundItem: {
  id: string;
  title: string;
  description: string;
  category: Category;
  userId: string;
}): Promise<MatchedLostItem[]> {
  // Fetch active LOST items in same category created by other users
  const candidateLostItems = await db.item.findMany({
    where: {
      category: foundItem.category,
      type: "LOST",
      status: Status.ACTIVE,
      userId: { not: foundItem.userId },
    },
    include: {
      user: true,
    },
  });

  if (candidateLostItems.length === 0) return [];

  const foundKeywords = new Set([
    ...extractKeywords(foundItem.title),
    ...extractKeywords(foundItem.description),
  ]);

  const matches: MatchedLostItem[] = [];

  for (const item of candidateLostItems) {
    const lostKeywords = [
      ...extractKeywords(item.title),
      ...extractKeywords(item.description),
    ];

    let overlapCount = 0;
    for (const kw of lostKeywords) {
      if (foundKeywords.has(kw)) {
        overlapCount++;
      }
    }

    // Match criteria: Same category AND at least 1 keyword overlap, OR exact category match fallback
    if (overlapCount > 0 || candidateLostItems.length <= 3) {
      matches.push({
        lostItem: item,
        user: item.user,
        score: overlapCount + 1,
      });
    }
  }

  // Sort by match score descending
  return matches.sort((a, b) => b.score - a.score);
}
