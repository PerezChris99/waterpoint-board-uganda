export type UserRole = "ADMIN" | "CARETAKER" | "MEMBER";

/** Where a user should land immediately after login/registration. */
export function dashboardPathForRole(role: string): string {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "CARETAKER") return "/dashboard/caretaker";
  return "/dashboard/member";
}
