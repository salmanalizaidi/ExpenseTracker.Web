import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME, MOBILE_PAGE_TITLES, ROUTES, SEARCH_PLACEHOLDERS } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { UserProfile } from "@/features/profile/types";

// ─── Profile Dropdown ──────────────────────────────────────────────────────

interface ProfileDropdownProps {
    onClose: () => void;
    profile: UserProfile | null;
  }
  
 export function ProfileDropdown({ onClose, profile }: ProfileDropdownProps) {
    const router = useRouter();
    const { logout } = useAuth();
    const ref = useRef<HTMLDivElement>(null);
  
    const [aiDigest, setAiDigest] = useState(true);
  
    useEffect(() => {
      function handler(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) onClose();
      }
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);
  
    const handleLogout = async () => {
      await logout();
      onClose();
    };
  
    const handleProfile = () => {
      router.push(ROUTES.PROFILE);
      onClose();
    };
  
    const avatarSrc = profile?.avatarBase64 ?? null;
    const initials = ((profile?.firstName?.[0] ?? "") + (profile?.lastName?.[0] ?? "")).toUpperCase();
    const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Account";
    const email = profile?.email ?? "";
    const plan = profile?.planTier ?? "Free";
    const isPro = plan.toLowerCase() !== "free";
  
    return (
      <div
        ref={ref}
        className="absolute top-16 right-0 w-80 z-50 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-2xl p-3 flex flex-col text-on-surface"
      >
        {/* ── User header card ── */}
        <div className="p-3 bg-surface-container-low rounded-lg mb-3 border border-outline-variant">
          <div className="flex items-center gap-3 mb-2">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#6c47ff] to-[#9c7aff] flex items-center justify-center text-white font-bold text-sm">
                  {initials || <span className="material-symbols-outlined text-base">person</span>}
                </div>
              )}
            </div>
            {/* Name + plan + email */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm truncate text-on-surface">{displayName}</h4>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isPro ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}>
                  {isPro ? plan.toUpperCase() : "FREE"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate">{email}</p>
            </div>
          </div>
          {/* Health Score */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant text-[11px]">
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {" "}Health Score:{" "}
              <strong className="text-green-600 ml-0.5">94% Strong</strong>
            </span>
            <span className="text-outline">Updated today</span>
          </div>
        </div>
  
        {/* ── ACCOUNT section ── */}
        <div className="space-y-0.5 mb-3">
          <p className="text-[11px] font-bold text-outline uppercase px-2 py-1 tracking-widest">Account</p>
  
          {/* Profile & Details */}
          <button
            onClick={handleProfile}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Icon
                name="person"
                className="text-outline group-hover:text-primary"
              />
              <span className="text-sm font-medium text-on-surface">Profile &amp; Details</span>
            </div>
            <Icon
              name="chevron_right"
              className="text-outline"
            />
          </button>
  
          {/* Connected Banks */}
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Icon name="account_balance" className="text-outline group-hover:text-primary" />
              <span className="text-sm font-medium text-on-surface">Connected Banks</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">3 Active</span>
          </button>
  
          {/* Security & 2FA */}
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Icon name="shield" className="text-outline group-hover:text-primary" />
              <span className="text-sm font-medium text-on-surface">Security &amp; 2FA</span>
            </div>
            <Icon name="chevron_right" className="text-outline" />
          </button>
        </div>
  
        {/* ── PREFERENCES section ── */}
        <div className="space-y-0.5 mb-3 pt-1 border-t border-outline-variant">
          <p className="text-[11px] font-bold text-outline uppercase px-2 py-1 tracking-widest">Preferences</p>
  
          {/* AI Financial Digest */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <Icon name="auto_awesome" className="material-symbols-outlined text-outline" />
              <span className="text-sm font-medium text-on-surface">AI Financial Digest</span>
            </div>
            {/* Toggle */}
            <button
              type="button"
              onClick={() => setAiDigest((v) => !v)}
              className={`w-8 h-4 rounded-full relative cursor-pointer flex items-center transition-colors ${aiDigest ? "bg-primary justify-end pr-0.5" : "bg-outline/30 justify-start pl-0.5"}`}
            >
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </button>
          </div>
  
          {/* Currency & Region */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <Icon name="language" className="material-symbols-outlined text-outline" />
              <span className="text-sm font-medium text-on-surface">Currency &amp; Region</span>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">USD ($)</span>
          </div>
  
          {/* Theme */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <Icon name="light_mode" className="material-symbols-outlined text-outline" />
              <span className="text-sm font-medium text-on-surface">Theme</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-surface-container rounded text-primary">Light</span>
          </div>
        </div>
  
        {/* ── Pro Tier card ── */}
        <div className="p-3 bg-primary/5 rounded-lg mb-3 border border-primary/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary">Serene Pro Tier</span>
            <span className="text-[10px] text-on-surface-variant">Renews Dec 2024</span>
          </div>
          <button onClick={() => {}} className="text-xs font-bold text-primary hover:underline">
            Manage
          </button>
        </div>
  
        {/* ── Bottom section ── */}
        <div className="pt-1 border-t border-outline-variant space-y-0.5">
          {/* Help & Support */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface"
          >
            <Icon name="help_outline" className="material-symbols-outlined text-outline" />
            <span className="text-sm font-medium">Help &amp; Support</span>
          </button>
  
          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-error-container text-error transition-colors"
          >
            <Icon name="logout" className="material-symbols-outlined text-error" />
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </div>
    );
  }