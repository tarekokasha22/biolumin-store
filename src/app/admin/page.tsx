import { redirect } from "next/navigation";
import { loginAction, isAdmin } from "@/lib/admin-actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdmin()) redirect("/admin/inventory");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-center text-4xl text-champagne">
          BIOLUMIN
        </h1>
        <p className="font-body mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-ivory/40">
          Admin
        </p>

        <form action={loginAction} className="mt-12 space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
          />
          {error && (
            <p className="font-body text-sm text-red-300">Wrong password</p>
          )}
          <button
            type="submit"
            className="font-body w-full rounded-full bg-champagne px-9 py-3 text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
