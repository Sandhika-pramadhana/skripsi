'use client'
import dynamic from "next/dynamic";

const CogsNoSSR = dynamic(
  () => import("@/features/page/sap/generate/cogs"),
  { ssr: false }
);

const CogsPage = () => <CogsNoSSR />;

CogsPage.displayName = "CogsPage";

export default CogsPage;
