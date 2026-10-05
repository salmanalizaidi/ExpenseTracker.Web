import { fetchProfile } from "@/features/profile/services/profileApi.server";
import ProfileView from "@/features/profile/components/ProfileView";
import { ApiError } from "@/lib/apiError";

export const metadata = { title: "Profile & Details — Expense Tracker" };

export default async function ProfilePage() {
  let profile;
  try {
    profile = await fetchProfile();
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      // Middleware will redirect unauthenticated users before reaching here,
      // but handle it gracefully just in case.
      return (
        <div className="min-h-screen flex items-center justify-center text-[#6b7280]">
          Session expired. Please log in again.
        </div>
      );
    }
    throw error;
  }

  return <ProfileView initialProfile={profile} />;
}
