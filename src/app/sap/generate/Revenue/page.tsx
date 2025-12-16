'use client'
import dynamic from "next/dynamic";

const RevenueNoSSR = dynamic(
  () => import("@/features/page/sap/generate/revenue/index"),
  { ssr: false }
);

const RevenuePage = () => <RevenueNoSSR />;

RevenuePage.displayName = "RevenuePage";

export default RevenuePage;
