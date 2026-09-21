"use client";

import dynamic from "next/dynamic";
import StatsCards from "@/components/StatsCards";
import GrowthChart from "@/components/GrowthChart";
import DecadeBarChart from "@/components/DecadeBarChart";
import RegionalGrowthChart from "@/components/RegionalGrowthChart";
import HeightByDecadeChart from "@/components/HeightByDecadeChart";
import BoroughBreakdown from "@/components/BoroughBreakdown";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { SkylineSilhouette } from "@/components/SkylineSilhouette";
import { useTheme, themeClasses } from "@/lib/theme";

const SkylineMap = dynamic(() => import("@/components/SkylineMap"), { ssr: false });

export default function Home() {
  const { theme } = useTheme();
  const t = themeClasses[theme];

  return (
    <main className={t.pageBg}>
      <TopNav />

      <section className={`relative flex h-[70vh] min-h-[480px] flex-col items-center justify-center overflow-hidden px-6 text-center ${t.text}`}>
        <SkylineSilhouette
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full ${t.silhouette}`}
          seed={1}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              theme === "light"
                ? "radial-gradient(ellipse at 50% 30%, rgba(240,69,110,0.08), transparent 60%)"
                : "radial-gradient(ellipse at 50% 30%, rgba(240,69,110,0.12), transparent 60%)",
          }}
        />
        <p className={`relative mb-4 text-sm font-medium uppercase tracking-[0.3em] ${t.textFaint}`}>
          New York City, 1800&ndash;2020
        </p>
        <h1 className="relative max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Every building.
          <br />
          Every decade.
        </h1>
        <p className={`relative mt-6 max-w-lg text-lg ${t.textMuted}`}>
          A million-building map of how New York grew up &mdash; joined from the city&apos;s
          own building footprints and tax lot records, rendered in 3D.
        </p>
      </section>

      <StatsCards />
      <div className={`border-t ${t.border}`}>
        <GrowthChart />
      </div>
      <div className={`border-t ${t.border}`}>
        <DecadeBarChart />
      </div>
      <div className={`border-t ${t.border}`}>
        <RegionalGrowthChart />
      </div>
      <div className={`border-t ${t.border}`}>
        <HeightByDecadeChart />
      </div>
      <div className={`border-t ${t.border}`}>
        <BoroughBreakdown />
      </div>

      <section className="relative">
        <div className={`border-t ${t.border} ${t.pageBg} px-6 py-16 text-center ${t.text}`}>
          <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
            Explore it yourself
          </h2>
          <p className="mx-auto max-w-xl text-2xl font-semibold tracking-tight">
            Press play and watch the skyline grow &mdash; or drag the slider to any decade.
          </p>
        </div>
        <SkylineMap />
      </section>

      <Footer />
    </main>
  );
}
