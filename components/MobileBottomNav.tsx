"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map as MapIcon, Image as ImageIcon, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      key: "map",
      label: "地图",
      icon: MapIcon,
      href: "/map",
      isActive: pathname === "/map",
    },
    {
      key: "memories",
      label: "相册",
      icon: ImageIcon,
      href: "/memories",
      isActive: pathname === "/memories",
    },
    {
      key: "settings",
      label: "我的",
      icon: User,
      href: "/settings",
      isActive: pathname === "/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-[#D8DDD8]/80 bg-[#FAFBF7]/90 px-4 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_24px_rgba(90,102,112,0.04)] backdrop-blur-md lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex flex-col items-center justify-center p-2 transition ${
            item.isActive ? "text-[#D86F82]" : "text-[#5A6670]/50 hover:text-[#5A6670]/80"
          }`}
        >
          <item.icon className={`mb-1 h-5 w-5 ${item.isActive ? "fill-current" : ""}`} strokeWidth={item.isActive ? 2.5 : 2} />
          <span className={`text-[10px] ${item.isActive ? "font-semibold" : "font-medium"}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
