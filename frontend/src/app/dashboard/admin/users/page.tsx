import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/verified-session";
import { prisma } from "@/lib/db";
import { UserRoleSelect } from "@/components/user-role-select";
import { ROLE_LABELS } from "@/lib/labels";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const session = await getVerifiedSession();
  if (!session || session.role !== "ADMIN") redirect("/forbidden");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      village: true,
      _count: { select: { caretakerOf: true, reports: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">{users.length} accounts</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left dark:border-white/10">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Village</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Assigned points</th>
              <th className="py-2 pr-4">Reports filed</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4">{user.name}</td>
                <td className="py-2 pr-4 text-black/60 dark:text-white/60">{user.email}</td>
                <td className="py-2 pr-4">{user.village ?? "—"}</td>
                <td className="py-2 pr-4">
                  {user.id === session.sub ? (
                    ROLE_LABELS[user.role]
                  ) : (
                    <UserRoleSelect userId={user.id} currentRole={user.role} />
                  )}
                </td>
                <td className="py-2 pr-4">{user._count.caretakerOf}</td>
                <td className="py-2 pr-4">{user._count.reports}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
