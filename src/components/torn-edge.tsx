"use client";

/**
 * TornEdge — A torn/ripped paper edge divider
 *
 * Creates two torn halves that sit slightly apart with soft drop shadows,
 * producing a visible ripped-paper gap between sections.
 * Both halves are visible in both paper and chalkboard themes.
 */

import React from "react";
import { useTheme } from "@/lib/theme-context";

interface TornEdgeProps {
  className?: string;
  /** Flip the edge vertically */
  flip?: boolean;
  /** Override colors */
  color?: string;
}

export function TornEdge({ className = "", flip = false, color }: TornEdgeProps) {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const topFill = color || (isChalkboard ? "#2A3B2A" : "#FAF0D7");
  const bottomFill = color || (isChalkboard ? "#1E2D1E" : "#FDF6E3");
  const shadowOpacity = isChalkboard ? 0.35 : 0.18;

  // Two different jagged paths for realistic torn halves
  const topPath =
    "M0,28 Q12,32 22,24 Q32,18 48,28 Q56,33 70,22 Q82,15 98,26 Q108,32 122,20 Q134,14 150,25 Q162,32 178,22 Q188,16 205,27 Q218,33 232,21 Q245,14 260,25 Q272,31 288,22 Q300,15 318,26 Q330,32 345,21 Q358,14 375,25 Q388,32 402,22 Q415,15 432,26 Q445,33 458,21 Q472,14 488,25 Q502,32 518,22 Q532,16 548,26 Q562,33 578,22 Q590,14 608,25 Q622,32 638,22 Q650,16 668,26 Q680,32 698,21 Q710,14 728,25 Q742,32 758,22 Q770,15 788,26 Q800,33 818,22 Q830,15 848,25 Q862,32 878,22 Q890,16 908,26 Q920,32 938,21 Q952,14 968,25 Q982,32 998,22 Q1010,16 1028,26 Q1042,33 1058,22 Q1070,15 1088,25 Q1102,32 1118,22 Q1130,16 1148,27 Q1162,32 1178,22 Q1190,16 1200,24 L1200,0 L0,0 Z";

  const bottomPath =
    "M0,12 Q15,6 28,14 Q42,20 58,10 Q70,4 88,13 Q100,18 118,9 Q130,3 148,12 Q160,18 178,10 Q190,4 208,12 Q220,18 238,10 Q250,4 268,12 Q280,18 298,9 Q310,3 328,12 Q342,19 358,10 Q370,4 388,12 Q400,18 418,10 Q430,4 448,12 Q462,18 478,9 Q490,3 508,12 Q522,19 538,10 Q550,4 568,12 Q580,18 598,10 Q610,4 628,12 Q642,18 658,9 Q670,3 688,13 Q700,18 718,10 Q730,4 748,12 Q762,18 778,10 Q790,4 808,12 Q822,19 838,10 Q850,4 868,12 Q880,18 898,10 Q910,4 928,12 Q942,18 958,9 Q970,3 988,12 Q1002,19 1018,10 Q1030,4 1048,13 Q1060,18 1078,10 Q1090,4 1108,12 Q1122,18 1138,10 Q1150,4 1168,13 Q1180,18 1200,12 L1200,40 L0,40 Z";

  return (
    <div
      className={`relative w-full ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
      style={{ height: "48px", zIndex: 5, marginTop: "-4px", marginBottom: "-4px" }}
    >
      {/* Top torn half — bottom edge of the section above */}
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full"
        style={{
          height: "26px",
          filter: `drop-shadow(0 2px 3px rgba(0,0,0,${shadowOpacity}))`,
        }}
      >
        <path d={topPath} fill={topFill} />
      </svg>

      {/* Bottom torn half — top edge of the section below */}
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: "26px",
          filter: `drop-shadow(0 -2px 3px rgba(0,0,0,${shadowOpacity}))`,
        }}
      >
        <path d={bottomPath} fill={bottomFill} />
      </svg>
    </div>
  );
}
