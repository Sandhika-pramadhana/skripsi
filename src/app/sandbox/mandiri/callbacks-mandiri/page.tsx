'use client'
import dynamic from "next/dynamic";

// Dynamically import the CallbacksMandiri component with no server-side rendering
const CallbacksMandiriSandboxNoSSR = dynamic(() => import("@/features/page/mandiri/sandbox/callbacks-mandiri"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const CallbacksMandiriSandboxPage = () => <CallbacksMandiriSandboxNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
CallbacksMandiriSandboxPage.displayName = "CallbacksMandiriSandboxPage";

// Export the named component as the default export
export default CallbacksMandiriSandboxPage;