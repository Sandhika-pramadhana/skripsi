'use client'
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const SapicoDssNoSSR = dynamic(() => import("@/features/page/sap/dss/sapico/index"), {
  ssr: false,
});

// eslint-disable-next-line react/no-children-prop
const SapicoDssPage = () => <SapicoDssNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
SapicoDssPage.displayName = "SapicoDssPage";

// Export the named component as the default export
export default SapicoDssPage;