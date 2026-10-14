"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabActiveClass, tabClass } from "@/components/styles";

const tabs = [
  { href: "/account", label: "Main" },
  { href: "/points", label: "Points" },
  { href: "/bugs", label: "Bugs" },
];

export function AppTabs({ isReviewer }: { isReviewer: boolean }) {
  const path = usePathname();
  const items = isReviewer ? [...tabs, { href: "/admin", label: "Review" }] : tabs;

  return (
    <nav className="mt-4 flex flex-wrap gap-2" aria-label="Sections">
      {items.map((tab) => {
        const active = path === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={active ? tabActiveClass : tabClass}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
