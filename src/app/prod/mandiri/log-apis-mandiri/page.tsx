'use client'
import dynamic from "next/dynamic";

// Dynamically import the LogApisMandiri component with no server-side rendering
const LogApisMandiriNoSSR = dynamic(() => import("@/features/page/mandiri/prod/log-apis-mandiri"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const LogApisMandiriPage = () => <LogApisMandiriNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
LogApisMandiriPage.displayName = "LogApisMandiriPage";

// Export the named component as the default export
export default LogApisMandiriPage;