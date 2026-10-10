export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-5xl text-[#6b7280] animate-pulse">
          account_circle
        </span>
        <p className="text-sm text-[#6b7280]">Loading profile…</p>
      </div>
    </div>
  );
}
