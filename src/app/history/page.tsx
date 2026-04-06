'use client'
import dynamic from "next/dynamic";

const HistoryNoSSR = dynamic(() => import("@/features/history"), {
  ssr: false,
});

const HistoryPage = () => <HistoryNoSSR />;

HistoryPage.displayName = "HistoryPage";

export default HistoryPage;
