'use client';

import dynamic from "next/dynamic";

const ResultNoSSR = dynamic(() => import("@/features/result"), {
  ssr: false,
});

const ResultPage = () => <ResultNoSSR />;

ResultPage.displayName = "ResultPage";

export default ResultPage;