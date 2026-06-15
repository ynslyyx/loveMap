"use client";

import { useState, useEffect } from 'react';
import { CloudSun, Sun, Cloud, Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { MemoryPageShell } from '@/components/MemoryNav';
import { useAdminMode } from '@/hooks/useAdminMode';
import { CitySearchSelect } from '@/components/shared/CitySearchSelect';
import {
  readAppSettings,
  writeAppSettings,
  defaultWeatherCityIds,
  maxWeatherCities,
  type AppSettings,
} from '@/data/appSettings';

const slotDecorations = [
  {
    icon: Sun,
    gradient: "from-[#F5DCE0]/40 to-[#E8B8C2]/10",
    border: "border-[#E8B8C2]/50",
    text: "text-[#E8B8C2]",
    animation: { y: [0, -4, 0], rotate: [0, 5, -5, 0] },
    duration: 4,
  },
  {
    icon: Cloud,
    gradient: "from-[#D6E8F0]/50 to-[#A8C8DC]/10",
    border: "border-[#A8C8DC]/50",
    text: "text-[#A8C8DC]",
    animation: { x: [0, 5, -5, 0], y: [0, 2, 0] },
    duration: 5,
  },
  {
    icon: Wind,
    gradient: "from-[#D8DDD8]/60 to-[#FAFBF7]/10",
    border: "border-[#D8DDD8]/80",
    text: "text-[#5A6670]/60",
    animation: { x: [0, 8, 0], rotate: [0, 10, 0] },
    duration: 3,
  },
];

export default function WeatherPage() {
  const isAdmin = useAdminMode();
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    setAppSettings(readAppSettings());
  }, []);

  const updateWeatherCity = (index: number, cityId: string) => {
    if (!isAdmin) {
      setStatus("请先进入管理员模式");
      return;
    }

    setAppSettings((current) => {
      const nextIds = [...(current.weatherCityIds ?? defaultWeatherCityIds)];
      nextIds[index] = cityId;
      const nextSettings = { ...current, weatherCityIds: nextIds };
      writeAppSettings(nextSettings);
      setStatus("城市更新成功，首页天气已刷新");
      return nextSettings;
    });
  };

  const weatherCityIds = appSettings.weatherCityIds ?? defaultWeatherCityIds;

  return (
    <MemoryPageShell active="weather">
      <header>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CloudSun className="h-10 w-10 text-[#A8C8DC]" />
          </motion.div>
          <h1 className="text-[34px] font-semibold leading-tight text-[#5A6670]">沿途天气</h1>
        </div>
        <p className="mt-3 text-sm font-medium text-[#5A6670]/58">
          配置首页顶部卡片显示的城市天气，最多可以设置 {maxWeatherCities} 个。
        </p>
      </header>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[12px] bg-[#FAFBF7]/80 p-3.5 text-sm font-semibold text-[#A8C8DC] shadow-sm backdrop-blur border border-[#D6E8F0]"
        >
          {status}
        </motion.div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {Array.from({ length: maxWeatherCities }).map((_, index) => {
          const dec = slotDecorations[index % slotDecorations.length];
          const Icon = dec.icon;

          return (
            <motion.div
              key={`weather-slot-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative rounded-[16px] border ${dec.border} bg-gradient-to-br ${dec.gradient} p-6 shadow-[0_12px_28px_rgba(90,102,112,0.06)] backdrop-blur-sm transition-all`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[16px] pointer-events-none">
                <div className="absolute -right-4 -top-4 opacity-20">
                  <motion.div
                    animate={dec.animation}
                    transition={{ duration: dec.duration, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon className={`h-32 w-32 ${dec.text}`} strokeWidth={1} />
                  </motion.div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-full bg-white/60 text-[11px] font-bold ${dec.text} shadow-sm`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-[#5A6670]">展示城市</span>
                  </div>
                  <Droplets className={`h-4 w-4 ${dec.text} opacity-60`} />
                </div>

                <div className="rounded-[10px] bg-white/40 p-1.5 backdrop-blur-md shadow-sm border border-white/50">
                  <CitySearchSelect
                    value={weatherCityIds[index] ?? ""}
                    onChange={(cityId) => updateWeatherCity(index, cityId)}
                    disabled={!isAdmin}
                    accent="blue"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </MemoryPageShell>
  );
}
