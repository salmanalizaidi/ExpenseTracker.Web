"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { ApiError } from "@/lib/apiError";
import {
  type UserProfile,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
  type PasswordValidation,
  DUMMY_CONNECTED_BANKS,
} from "../types";
import { validatePassword, isPasswordValid } from "../utils/validatePassword";
import { exportAsCSV, exportAsJSON } from "../utils/exportLedger";
import PhotoUploadDialog from "./PhotoUploadDialog";
import PasswordStrengthRow from "./PasswordStrengthRow";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── sub-components (small, inline-only building blocks) ──────────────────────

function SectionIconBadge({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shadow-sm shrink-0">
      <Icon name={name} className="text-primary" />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-caps">
      {children}
    </span>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] text-outline">{children}</span>;
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ProfileView({ initialProfile }: { initialProfile: UserProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // personal info form state
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    avatarBase64: profile.avatarBase64 as string | null | undefined,
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, startProfileTransition] = useTransition();

  // photo dialog
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  // password form state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwValidation, setPwValidation] = useState<PasswordValidation>({
    minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecialChar: false,
  });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [savingPassword, startPasswordTransition] = useTransition();

  // ── avatar ──────────────────────────────────────────────────────────────────

  const handleAvatarUpload = (base64: string) => setForm((f) => ({ ...f, avatarBase64: base64 }));
  const handleRemoveAvatar = () => setForm((f) => ({ ...f, avatarBase64: "" }));

  // ── profile save / discard ──────────────────────────────────────────────────

  const handleSaveProfile = useCallback(() => {
    setProfileError(null);
    setProfileSuccess(false);
    const payload: UpdateProfilePayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      avatarBase64: form.avatarBase64 !== profile.avatarBase64 ? form.avatarBase64 ?? null : undefined,
    };
    startProfileTransition(async () => {
      try {
        const updated = await apiClient.patch<UserProfile>(API_ROUTES.user.profile, payload);
        setProfile(updated);
        setForm({ firstName: updated.firstName, lastName: updated.lastName, username: updated.username, avatarBase64: updated.avatarBase64 });
        setProfileSuccess(true);
        router.refresh();
      } catch (error) {
        setProfileError(error instanceof ApiError ? error.message : "Failed to update profile.");
      }
    });
  }, [form, profile.avatarBase64, router]);

  const handleDiscard = () => {
    // Reset all local form state back to the last saved profile values
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      avatarBase64: profile.avatarBase64,
    });
    setProfileError(null);
    setProfileSuccess(false);
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPwValidation({ minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecialChar: false });
    setPwError(null);
    setPwSuccess(false);
    router.refresh();
  };

  // ── password change ─────────────────────────────────────────────────────────

  const handlePasswordChange = useCallback(() => {
    setPwError(null);
    setPwSuccess(false);
    if (!isPasswordValid(pwValidation)) { setPwError("New password does not meet the requirements."); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Passwords do not match."); return; }
    const payload: ChangePasswordPayload = { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword };
    startPasswordTransition(async () => {
      try {
        await apiClient.post(API_ROUTES.user.changePassword, payload);
        setPwSuccess(true);
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwValidation({ minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecialChar: false });
      } catch (error) {
        setPwError(error instanceof ApiError ? error.message : "Failed to change password.");
      }
    });
  }, [pwForm, pwValidation]);

  // ── derived display values ──────────────────────────────────────────────────

  const displayName = `${form.firstName} ${form.lastName}`.trim() || profile.email;
  const avatarSrc = form.avatarBase64 || null;
  const initials = ((form.firstName?.[0] ?? "") + (form.lastName?.[0] ?? "")).toUpperCase();
  const isPro = profile.planTier.toLowerCase() !== "free";

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      <div className="w-full max-w-[1360px] mx-auto p-6 flex flex-col gap-6">

        {/* ── Top: Breadcrumb + Title + Actions ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-outline uppercase tracking-wider">
              <span>Account</span>
              <Icon name="chevron_right" className="text-outline" />
              <span className="text-primary font-bold">Profile &amp; Details</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Profile &amp; Personal Details</h1>
            <p className="text-sm text-on-surface-variant">
              Manage your identity, personal contact information, connected financial profile, and account preferences.
            </p>
          </div>
          {/* Save / Discard */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={handleDiscard}
              className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-1.5 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Icon name="check_circle" className="text-white" />
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {profileError && (
          <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{profileError}</div>
        )}
        {profileSuccess && (
          <div className="bg-secondary-container/40 text-on-secondary-container text-sm px-4 py-3 rounded-lg">Profile updated successfully.</div>
        )}

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ══ LEFT COLUMN ══ */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Avatar card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              {/* Decorative blur blob */}
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none" />

              {/* Avatar with camera badge */}
              <div className="relative group mt-2 mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md ring-4 ring-surface-container-lowest">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-fixed-dim flex items-center justify-center text-white text-2xl font-bold">
                      {initials || <Icon name="person" className="text-white" />}
                    </div>
                  )}
                </div>
                {/* Camera badge */}
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all"
                  title="Change Photo"
                >
                  <Icon name="photo_camera" className="text-white text-[18px]" />
                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setForm((f) => ({ ...f, avatarBase64: reader.result as string }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Name + verified */}
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-lg font-bold text-on-surface">{displayName}</h2>
                <Icon name="verified" className="text-secondary" />
              </div>

              {/* Plan badge + member since */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${isPro ? "bg-secondary-container/40 text-on-secondary-container" : "bg-primary/10 text-primary"}`}>
                  {isPro ? profile.planTier.toUpperCase() + " MEMBER" : "FREE MEMBER"}
                </span>
                <span className="text-outline">•</span>
                <span className="text-sm text-on-surface-variant">Member since {formatDate(profile.createdAt)}</span>
              </div>

              <p className="text-sm text-outline mb-4 break-all">{profile.email}</p>

              {/* Change Photo / Remove */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPhotoDialog(true)}
                  className="px-3 py-1.5 text-sm text-primary font-semibold hover:bg-primary-fixed/20 rounded-lg transition-colors"
                >
                  Change Photo
                </button>
                {avatarSrc && (
                  <>
                    <span className="text-outline-variant">|</span>
                    <button
                      onClick={handleRemoveAvatar}
                      className="px-3 py-1.5 text-sm text-error font-semibold hover:bg-error-container/30 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Export Financial Ledger card */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Icon name="cloud_download" className="text-primary text-[22px]" />
                <h3 className="text-sm font-bold text-on-surface">Export Financial Ledger</h3>
              </div>
              <p className="text-sm text-on-surface-variant">
                Download all verified expense logs, statements, and category tagging into open formats.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => exportAsCSV(profile)}
                  className="flex-1 py-1.5 px-3 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-[11px] font-bold text-on-surface rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="table_chart" className="text-on-surface" />
                  CSV File
                </button>
                <button
                  onClick={() => exportAsJSON(profile)}
                  className="flex-1 py-1.5 px-3 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-[11px] font-bold text-on-surface rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="data_object" className="text-on-surface" />
                  JSON Raw
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* ── Personal Information card ── */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col gap-4">
              {/* Card header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Personal Information</h2>
                  <p className="text-sm text-on-surface-variant">Update your primary identity credentials registered across transactions.</p>
                </div>
                <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[11px] font-bold rounded-full shrink-0 ml-3">
                  Encrypted 256-bit
                </span>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* First Name */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>First Name</FieldLabel>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 px-4 py-2 rounded-lg text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary"
                  />
                  <HelperText>Legal first name matching bank documents.</HelperText>
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>Last Name</FieldLabel>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 px-4 py-2 rounded-lg text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary"
                  />
                  <HelperText>Surname as shown on government ID.</HelperText>
                </div>

                {/* Email — readonly */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>Email Address</FieldLabel>
                  <input
                    readOnly
                    value={profile.email}
                    className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-2 rounded-lg text-sm text-on-surface-variant outline-none cursor-not-allowed opacity-80"
                  />
                  <HelperText>Primary address for statements and ledger alerts.</HelperText>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>Username</FieldLabel>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 px-4 py-2 rounded-lg text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary"
                  />
                  <HelperText>Unique handle for your account.</HelperText>
                </div>
              </div>
            </div>

            {/* ── Security & Password card ── */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col gap-4">
              {/* Card header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <div className="flex items-start gap-4">
                  <SectionIconBadge name="lock_reset" />
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Security &amp; Password</h2>
                    <p className="text-sm text-on-surface-variant">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-secondary-container/40 text-on-secondary-container text-[11px] font-bold rounded-full flex items-center gap-1.5 shrink-0 ml-3">
                  <Icon name="verified_user" className="text-on-secondary-container text-[14px]" />
                  2FA Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Current Password — full width */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <FieldLabel>Current Password</FieldLabel>
                  <div className="relative">
                    <input
                      type={showPw.current ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      className="w-full bg-surface-container-low border border-outline-variant/40 pl-4 pr-10 py-2 rounded-lg text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    >
                      <Icon name={showPw.current ? "visibility_off" : "visibility"} className="text-outline hover:text-on-surface" />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>New Password</FieldLabel>
                  <div className="relative">
                    <input
                      type={showPw.newPw ? "text" : "password"}
                      placeholder="Enter new password"
                      value={pwForm.newPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPwForm((f) => ({ ...f, newPassword: val }));
                        setPwValidation(validatePassword(val));
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/40 pl-4 pr-10 py-2 rounded-lg text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => ({ ...s, newPw: !s.newPw }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Icon name={showPw.newPw ? "visibility_off" : "visibility"} className="text-outline hover:text-on-surface" />
                    </button>
                  </div>
                  <HelperText>Minimum 8 characters with a number and symbol.</HelperText>
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <div className="relative">
                    <input
                      type={showPw.confirm ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      className="w-full bg-surface-container-low border border-outline-variant/40 pl-4 pr-10 py-2 rounded-lg text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Icon name={showPw.confirm ? "visibility_off" : "visibility"} className="text-outline hover:text-on-surface" />
                    </button>
                  </div>
                  <HelperText>Must match new password entry.</HelperText>
                </div>
              </div>

              {/* Strength checklist */}
              {pwForm.newPassword.length > 0 && (
                <ul className="grid grid-cols-2 gap-y-1 pl-1">
                  <PasswordStrengthRow label="At least 8 characters" met={pwValidation.minLength} />
                  <PasswordStrengthRow label="Uppercase letter" met={pwValidation.hasUppercase} />
                  <PasswordStrengthRow label="Lowercase letter" met={pwValidation.hasLowercase} />
                  <PasswordStrengthRow label="Number" met={pwValidation.hasNumber} />
                  <PasswordStrengthRow label="Special character" met={pwValidation.hasSpecialChar} />
                </ul>
              )}

              {pwError && <p className="text-sm text-error">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-secondary">Password changed successfully.</p>}

              {/* Action */}
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={handlePasswordChange}
                  disabled={savingPassword}
                  className="px-6 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-primary text-sm font-bold rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Icon name="key" className="text-primary text-[18px]" />
                  {savingPassword ? "Updating…" : "Update Password"}
                </button>
              </div>
            </div>

            {/* ── Connected Banks & Accounts card ── */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col gap-4">
              {/* Card header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <div className="flex items-start gap-4">
                  <SectionIconBadge name="account_balance" />
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Connected Banks &amp; Accounts</h2>
                    <p className="text-sm text-on-surface-variant">Manage linked financial institutions for real-time transaction syncing.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-secondary-container/40 text-on-secondary-container text-[11px] font-bold rounded-full flex items-center gap-1.5 shrink-0 ml-3">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                  3 Active Accounts
                </span>
              </div>

              {/* Bank rows */}
              <div className="flex flex-col gap-3 pt-1">
                {DUMMY_CONNECTED_BANKS.map((bank) => (
                  <div
                    key={bank.id}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Bank icon badge */}
                      <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm border border-outline-variant/30 shrink-0">
                        <Icon name={bank.icon} className="text-primary text-[20px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-on-surface">{bank.name}</span>
                          <span className="text-xs text-outline font-semibold">••{bank.accountNumber}</span>
                          <span className="px-2 py-0.5 bg-secondary-container/60 text-on-secondary-container rounded-full text-[11px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                            {bank.syncStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                          <span className="font-semibold text-on-surface">{bank.subType}</span>
                          <span className="text-outline">•</span>
                          <span className="text-outline">Auto-sync active · Updated {bank.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-primary text-sm font-semibold rounded-lg shadow-sm transition-all self-start sm:self-auto shrink-0">
                      Manage
                    </button>
                  </div>
                ))}
              </div>

              {/* Connect new bank */}
              <button className="w-full py-3 px-6 bg-surface-container-low hover:bg-surface-container text-primary text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-dashed border-outline-variant">
                <Icon name="add_circle" className="text-primary text-[20px]" />
                + Connect New Bank or Card via Plaid / Open Banking
              </button>
            </div>

          </div>{/* end right column */}
        </div>{/* end grid */}
      </div>

      {/* Photo upload dialog */}
      {showPhotoDialog && (
        <PhotoUploadDialog
          onUpload={handleAvatarUpload}
          onClose={() => setShowPhotoDialog(false)}
          currentAvatarSrc={avatarSrc}
        />
      )}
    </div>
  );
}
