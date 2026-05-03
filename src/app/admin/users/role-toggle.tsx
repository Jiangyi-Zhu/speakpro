"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export function RoleToggle({
  userId,
  currentRole,
  email,
}: {
  userId: string;
  currentRole: string;
  email: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isAdmin = currentRole === "ADMIN";

  async function toggle() {
    const newRole = isAdmin ? "USER" : "ADMIN";
    const msg = isAdmin
      ? `确定将 ${email} 降级为普通用户？`
      : `确定将 ${email} 升级为管理员？`;
    if (!confirm(msg)) return;

    setLoading(true);
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        isAdmin
          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {isAdmin && <Shield className="h-3 w-3" />}
      {isAdmin ? "Admin" : "User"}
    </button>
  );
}
