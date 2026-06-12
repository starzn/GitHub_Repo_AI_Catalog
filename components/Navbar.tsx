"use client";

import Link from "next/link";
import { GithubLogoIcon } from "@phosphor-icons/react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white transition hover:opacity-80"
        >
          <GithubLogoIcon size={22} weight="duotone" className="text-accent" />
          <span className="text-base font-semibold tracking-tight">
            AI Catalog
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/repos"
            className="text-sm font-medium text-text-secondary transition hover:text-white"
          >
            仓库列表
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-zinc-950 transition hover:opacity-90 active:scale-[0.97]"
          >
            分析仓库
          </Link>
        </div>
      </nav>
    </header>
  );
}
