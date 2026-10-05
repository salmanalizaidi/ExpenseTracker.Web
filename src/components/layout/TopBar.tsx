"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { APP_NAME, MOBILE_PAGE_TITLES, SEARCH_PLACEHOLDERS } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { UserProfile } from "@/features/profile/types";
import { ProfileDropdown } from "./ProfileDropDown";

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
  const pathname = usePathname();
  const mobileTitle = MOBILE_PAGE_TITLES[pathname] ?? APP_NAME;
  const searchPlaceholder = SEARCH_PLACEHOLDERS[pathname] ?? "Search transactions...";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Lazily load profile once the dropdown is opened the first time
  useEffect(() => {
    if (!dropdownOpen || profile !== null) return;
    apiClient
      .get<UserProfile>(API_ROUTES.user.profile)
      .then(setProfile)
      .catch(() => {/* fail silently */});
  }, [dropdownOpen, profile]);

  const toggleDropdown = () => setDropdownOpen((o) => !o);

  const avatarSrc = profile?.avatarBase64 || null;
  const initials = (
    (profile?.firstName?.[0] ?? "") + (profile?.lastName?.[0] ?? "")
  ).toUpperCase();

  return (
    <header className="flex justify-between items-center h-16 px-lg w-full bg-surface shadow-sm sticky top-0 z-40">
      {/* Mobile: avatar + page title */}
      <div className="flex items-center gap-sm lg:hidden">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-outline-variant bg-surface-container" />
        <h1 className="text-lg font-bold text-primary">{mobileTitle}</h1>
      </div>

      {/* Desktop: search */}
      <div className="hidden flex-1 items-center gap-md lg:flex">
        <div className="relative w-full max-w-md">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-lg">
        <button type="button" className="text-on-surface-variant hover:text-primary transition-colors relative" aria-label="Notifications">
          <Icon name="notifications" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-surface bg-error" />
        </button>
        <button type="button" className="hidden text-on-surface-variant hover:text-primary transition-colors lg:block" aria-label="Help">
          <Icon name="help_outline" />
        </button>

        {/* Avatar button + dropdown */}
        <div className="relative hidden lg:flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-full hover:bg-surface-container transition-all">
          <div
            onClick={toggleDropdown}
            className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 border border-outline-variant"
          >
            {/* WORK HERE */}
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6c47ff] to-[#9c7aff] flex items-center justify-center text-white text-xs font-bold">
                {initials || <Icon name="person" className="text-[16px]" />}
              </div>
            )}
          </div>
          <span
            onClick={toggleDropdown}
            className={`material-symbols-outlined text-primary transition-transform duration-200 select-none`}
            style={{ fontSize: 18, transform: dropdownOpen ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <Icon name="expand_more" />
          </span>

          {dropdownOpen && (
            <ProfileDropdown
              profile={profile}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
