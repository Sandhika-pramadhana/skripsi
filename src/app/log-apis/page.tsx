'use client'
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const LogApisNoSSR = dynamic(() => import("@/features/page/log_apis"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const LogApisPage = () => <LogApisNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
LogApisPage.displayName = "LogApisPage";

// Export the named component as the default export
export default LogApisPage;