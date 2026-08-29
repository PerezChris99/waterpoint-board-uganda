import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
      <aside className="w-48 shrink-0">
        <nav aria-label="Dashboard" className="flex flex-col gap-1 text-sm">
          <Link href="/dashboard/member" className="rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10">
            My Reports
          </Link>
          {(session.role === "CARETAKER" || session.role === "ADMIN") && (
            <Link href="/dashboard/caretaker" className="rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10">
              Caretaker
            </Link>
          )}
          {session.role === "ADMIN" && (
            <>
              <Link href="/dashboard/admin" className="rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10">
                Overview
              </Link>
              <Link href="/dashboard/admin/users" className="rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10">
                Users
              </Link>
              <Link href="/dashboard/admin/analytics" className="rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10">
                Analytics
              </Link>
            </>
          )}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
