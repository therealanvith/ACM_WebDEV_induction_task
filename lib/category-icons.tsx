import { Category } from "@prisma/client";
import { Laptop, FileText, Glasses, Package } from "lucide-react";

export function getCategoryIcon(category: Category) {
  switch (category) {
    case Category.ELECTRONICS:
      return <Laptop className="w-3.5 h-3.5" />;
    case Category.DOCUMENTS:
      return <FileText className="w-3.5 h-3.5" />;
    case Category.ACCESSORIES:
      return <Glasses className="w-3.5 h-3.5" />;
    case Category.OTHER:
    default:
      return <Package className="w-3.5 h-3.5" />;
  }
}
