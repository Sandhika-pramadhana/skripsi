'use client'
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const GenerateNoSSR = dynamic(() => import("@/features/page/sap/generate/report"), {
  ssr: false,
});

// eslint-disable-next-line react/no-children-prop
const GeneratePage = () => <GenerateNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
GeneratePage.displayName = "GeneratePage";

// Export the named component as the default export
export default GeneratePage;