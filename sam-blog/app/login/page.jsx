import { redirect } from "next/navigation";
import { createSession } from "../../lib/session";

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const hasError = resolvedSearchParams?.error === "1";

  async function login(formData) {
    "use server";

    const password = formData.get("password")?.toString();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error("Missing ADMIN_PASSWORD environment variable.");
    }

    if (password !== adminPassword) {
      redirect("/login?error=1");
    }

    await createSession();
    redirect("/admin");
  }

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex items-center">
      <form action={login} className="w-full blog-card space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter your admin password to create and manage posts.
          </p>
        </div>

        {hasError ? (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            That password was not correct. Try again.
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] font-bold py-3 rounded-md hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
