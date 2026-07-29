import { getSession } from "@/lib/auth";
import { ItemForm } from "@/components/item-form";
import { redirect } from "next/navigation";

export default async function NewItemPage() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/items/new");
  }

  return (
    <div className="py-6">
      <ItemForm />
    </div>
  );
}
