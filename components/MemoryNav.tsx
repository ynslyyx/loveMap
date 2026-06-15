"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  BookOpen,
  CalendarDays,
  Heart,
  Map as MapIcon,
  MapPin,
  Settings,
  Star,
  X,
  Info,
  Image as ImageIcon,
  PlaneTakeoff,
  CloudSun,
  Menu,
} from "lucide-react";
import { MobileBottomNav } from "./MobileBottomNav";

const githubUrl = "https://github.com/zkeyoned/map-of-us-template";
const devUrl = "https://github.com/WyankinzZ/map-for-everyone";
const douyinUrl = "https://www.douyin.com/user/MS4wLjABAAAAMWgaMMPGnFwsJmpKo1ha0HPQ6-ul-NEWzzMvQ9NIPYQ";

export type MemoryNavKey = "map" | "memories" | "favorites" | "anniversaries" | "capsule" | "landmarks" | "loginPhotos" | "trips" | "weather" | "settings";

const navItems = [
  { key: "map", label: "地图", icon: MapIcon, href: "/map" },
  { key: "memories", label: "回忆记录", icon: BookOpen, href: "/memories" },
  { key: "favorites", label: "地点收藏", icon: Heart, href: "/favorites" },
  { key: "anniversaries", label: "纪念日", icon: CalendarDays, href: "/anniversaries" },
  { key: "trips", label: "旅行倒数", icon: PlaneTakeoff, href: "/trips" },
  { key: "capsule", label: "时光宝盒", icon: Archive, href: "/time-capsule" },
  { key: "landmarks", label: "地标管理", icon: MapPin, href: "/landmarks" },
  { key: "loginPhotos", label: "登录照片", icon: ImageIcon, href: "/login-photos" },
  { key: "weather", label: "沿途天气", icon: CloudSun, href: "/weather" },
  { key: "settings", label: "设置", icon: Settings, href: "/settings" },
] satisfies Array<{
  key: MemoryNavKey;
  label: string;
  icon: typeof MapIcon;
  href: string;
}>;

export function MemorySidebar({ active, className, onClose }: Readonly<{ active: MemoryNavKey; className?: string; onClose?: () => void }>) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <aside className={className ?? "hidden h-[100dvh] w-[260px] shrink-0 border-r border-[#D8DDD8]/78 bg-[#FAFBF7]/78 px-5 py-8 shadow-[12px_0_34px_rgba(90,102,112,0.04)] backdrop-blur lg:flex lg:flex-col lg:overflow-y-auto lg:overscroll-contain lg:touch-pan-y"}>
      <div className="flex-1">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center">
            <Heart className="h-10 w-10 fill-[#F5DCE0] text-[#E8B8C2]" />
          </div>
          <p className="mt-2 text-lg font-semibold text-[#5A6670]">我们的地图</p>
          <p className="mt-1 text-xs text-[#5A6670]/52">只属于两个人的回忆</p>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = item.key === active;

            return (
              <Link
                key={item.key}
                onClick={onClose}
                className={`flex w-full items-center gap-3 rounded-[8px] border px-4 py-3 text-sm font-medium transition ${selected
                  ? "border-[#F5DCE0] bg-[#F5DCE0]/52 text-[#E8B8C2]"
                  : "border-transparent text-[#5A6670]/72 hover:border-[#D8DDD8] hover:bg-[#FAFBF7]"
                  }`}
                href={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 rounded-[8px] border border-[#D8DDD8]/72 bg-[#FAFBF7]/72 p-4 text-sm leading-7 text-[#5A6670]/62 shadow-[0_12px_26px_rgba(90,102,112,0.05)]">
          在地图的每个角落，都有我们一起走过的故事
          <Heart className="ml-1 inline h-3.5 w-3.5 fill-[#F5DCE0] text-[#E8B8C2]" />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setIsAboutOpen(true)}
          className="flex w-full items-center justify-between rounded-[8px] border border-[#D8DDD8]/72 bg-[#FAFBF7]/72 px-4 py-3 text-sm font-medium text-[#5A6670]/72 transition hover:border-[#D8DDD8] hover:bg-white"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[#A8C8DC]" />
            关于这份地图
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5A6670]/20 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[360px] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(90,102,112,0.12)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 fill-[#F5DCE0] text-[#E8B8C2]" />
                  <h2 className="text-base font-semibold text-[#5A6670]">关于这份地图</h2>
                </div>
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#5A6670]/40 transition hover:bg-[#FAFBF7] hover:text-[#5A6670]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-medium text-[#5A6670]/60">基于Map of Us 二次开发</p>

                <div className="border-t border-[#D8DDD8]/54 pt-4">
                  <p className="text-xs font-semibold text-[#5A6670]/60">数据存在哪</p>
                  <p className="mt-1.5 text-xs leading-5 text-[#5A6670]/50">
                    这个版本是「本地存储」：照片和回忆都只保存在你自己的电脑上，不上传云端、不联网同步。你的隐私完全留在本地。
                  </p>
                </div>

                <div className="border-t border-[#D8DDD8]/54 pt-4">
                  <p className="text-xs font-semibold text-[#5A6670]/60">开源项目</p>
                  <a
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-[7px] border border-[#F5DCE0] bg-[#F5DCE0]/40 px-3 py-2 text-xs font-semibold text-[#E8B8C2] transition hover:bg-[#F5DCE0]/70"
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Star className="h-3.5 w-3.5" />
                    去 GitHub 点个 Star
                  </a>
                  <p className="mt-2 select-text text-center text-[11px] text-[#5A6670]/40">
                    github.com/zkeyoned/map-of-us-template
                  </p>
                </div>

                <div className="border-t border-[#D8DDD8]/54 pt-4">
                  <p className="text-xs font-semibold text-[#5A6670]/60">二次开发</p>
                  <a
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-[7px] border border-[#D6E8F0] bg-[#D6E8F0]/40 px-3 py-2 text-xs font-semibold text-[#A8C8DC] transition hover:bg-[#D6E8F0]/70"
                    href={devUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Star className="h-3.5 w-3.5" />
                    去 GitHub 了解更多
                  </a>
                  <p className="mt-2 select-text text-center text-[11px] text-[#5A6670]/40">
                    github.com/WyankinzZ/map-for-everyone
                  </p>
                </div>

                <div className="border-t border-[#D8DDD8]/54 pt-4">
                  <p className="mb-2 text-xs font-semibold text-[#5A6670]/60">作者联系方式</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5A6670]/50">微信</span>
                    <span className="select-text font-medium text-[#5A6670]/72">fkqsj9999</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-[#5A6670]/50">抖音</span>
                    <a
                      className="font-medium text-[#E8B8C2] transition hover:underline"
                      href={douyinUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Www_531 ↗
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}

export function MemoryPageShell({
  active,
  children,
}: Readonly<{
  active: MemoryNavKey;
  children: ReactNode;
}>) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#FAFBF7] text-[#5A6670]">
      <div className="map-mist-band" aria-hidden="true" />
      <span className="absolute left-[38%] top-[9%] h-2 w-2 bg-[#F5DCE0]" aria-hidden="true" />
      <span className="absolute right-[17%] top-[15%] h-2 w-2 bg-[#D6E8F0]" aria-hidden="true" />
      
      <div className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-[#D8DDD8]/78 bg-[#FAFBF7]/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-[#F5DCE0] text-[#E8B8C2]" />
          <span className="font-semibold text-[#5A6670]">我们的地图</span>
        </div>
        <button onClick={() => setIsMobileNavOpen(true)} className="p-2">
          <Menu className="h-5 w-5 text-[#5A6670]" />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <MemorySidebar active={active} />
        
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavOpen(false)}
                className="fixed inset-0 z-[110] bg-[#5A6670]/20 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-[120] lg:hidden flex flex-col"
              >
                <MemorySidebar 
                  active={active} 
                  className="flex h-full w-[260px] shrink-0 flex-col overflow-y-auto overscroll-contain touch-pan-y border-r border-[#D8DDD8]/78 bg-[#FAFBF7] px-5 py-8" 
                  onClose={() => setIsMobileNavOpen(false)} 
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <section className="min-w-0 flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:px-10 lg:py-8">{children}</section>
      </div>
      <MobileBottomNav />
    </main>
  );
}
