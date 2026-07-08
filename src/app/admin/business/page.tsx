import { isAdmin } from "@/lib/admin-actions";
import { redirect } from "next/navigation";
import { BusinessClient } from "./BusinessClient";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage() {
  if (!(await isAdmin())) redirect("/admin");
  return <BusinessClient />;
}
