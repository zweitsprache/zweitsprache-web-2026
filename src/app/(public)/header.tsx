import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/zweitsprache_logo.svg"
            alt="Zweitsprache"
            width={35}
            height={9}
            priority
          />
        </Link>
        <nav className="flex gap-6">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Workshops
          </Link>
        </nav>
      </div>
    </header>
  );
}
