'use client'
import dynamic from "next/dynamic";

// Dynamically import the LogApisMandiri component with no server-side rendering
const LogApisMandiriSandboxNoSSR = dynamic(() => import("@/features/page/mandiri/sandbox/log-apis-mandiri"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const LogApisMandiriSandboxPage = () => <LogApisMandiriSandboxNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
LogApisMandiriSandboxPage.displayName = "LogApisMandiriSandboxPage";

// Export the named component as the default export
export default LogApisMandiriSandboxPage;