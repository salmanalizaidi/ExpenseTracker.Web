import type { UserProfile } from "../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function exportAsCSV(profile: UserProfile) {
  const rows = [
    ["Field", "Value"],
    ["Name", `${profile.firstName} ${profile.lastName}`],
    ["Username", profile.username],
    ["Email", profile.email],
    ["Plan", profile.planTier],
    ["Member since", formatDate(profile.createdAt)],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "profile_ledger.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsJSON(profile: UserProfile) {
  const data = {
    name: `${profile.firstName} ${profile.lastName}`,
    username: profile.username,
    email: profile.email,
    plan: profile.planTier,
    memberSince: formatDate(profile.createdAt),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "profile_ledger.json";
  a.click();
  URL.revokeObjectURL(url);
}
