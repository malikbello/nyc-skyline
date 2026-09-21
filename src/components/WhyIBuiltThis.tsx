"use client";

import { Flame, Puzzle, Trophy } from "lucide-react";
import { useTheme, themeClasses } from "@/lib/theme";
import { Reveal } from "./Reveal";

const reasons = [
  {
    icon: Flame,
    title: "One chart wasn't enough",
    body: "A class assignment ended at a single static plot of average floors by decade. I kept thinking about what that chart was hiding — a million individual decisions to build, one building at a time, for 220 years.",
  },
  {
    icon: Puzzle,
    title: "The data didn't want to be joined",
    body: "Tax lots and building footprints are different units by design — one lot, many buildings. Most people would fudge it with a lat/lon match. I went looking for NYC's own bridge between the two instead, and found one.",
  },
  {
    icon: Trophy,
    title: "I wanted it to earn a place next to the real thing",
    body: "There's a polished commercial version of this idea already live. I didn't want to build a worse copy — I wanted to sit down, take its approach apart, and build something that could stand next to it.",
  },
];

export default function WhyIBuiltThis() {
  const { theme } = useTheme();
  const t = themeClasses[theme];

  return (
    <section className={`${t.pageBg} px-6 py-20 ${t.text}`}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className={`mb-10 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
            Why this exists
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {reasons.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <Icon size={22} className="mb-4 text-[#f0456e]" />
              <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
              <p className={`text-sm leading-relaxed ${t.textMuted}`}>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
