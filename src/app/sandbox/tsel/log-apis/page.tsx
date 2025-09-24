'use client'
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const LogApisSandboxNoSSR = dynamic(() => import("@/features/page/tsel/sandbox/log-apis-tsel"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const LogApisSandboxPage = () => <LogApisSandboxNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
LogApisSandboxPage.displayName = "LogApisSandboxPage";

// Export the named component as the default export
export default LogApisSandboxPage;