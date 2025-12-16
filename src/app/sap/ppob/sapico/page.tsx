'use client'
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const SapicoPpobNoSSR = dynamic(() => import("@/features/page/sap/ppob/sapico/index"), {
  ssr: false,
});

// eslint-disable-next-line react/no-children-prop
const SapicoPpobPage = () => <SapicoPpobNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
SapicoPpobPage.displayName = "SapicoPpobPage";

// Export the named component as the default export
export default SapicoPpobPage;