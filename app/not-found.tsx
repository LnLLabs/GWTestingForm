import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">GenWealth</p>
      <h1 className="mt-2 text-4xl">This page is not available</h1>
      <Link href="/" className="mt-6 text-sm font-medium text-accent">
        Back to the tester home
      </Link>
    </main>
  );
}
