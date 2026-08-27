"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-foreground/10 border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 p-4 md:px-6">
        <Link href="/" className="flex items-center tracking-tight">
          <Image
            src="/icon.svg"
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-sm"
          />
          <span className="ml-0.5 font-semibold">essionScan</span>
        </Link>
        {pathname !== "/about" && (
          <Link
            href="/about"
            className="text-muted-foreground text-sm hover:text-foreground"
          >
            About
          </Link>
        )}
      </div>
    </header>
  );
}
